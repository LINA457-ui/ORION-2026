import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, accounts } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createAccountWithSeed } from "./seedPortfolio";

export type AuthedRequest = Request & { userId: string };

function asAuthed(req: Request): AuthedRequest {
  return req as AuthedRequest;
}

export function userIdOf(req: Request): string {
  const r = asAuthed(req);
  return r.userId;
}

export async function ensureAccount(userId: string, displayName?: string) {
  // Fast path: return existing account without opening a transaction.
  const existing = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  // Slow path: atomically create account + seed starter portfolio. Falls back
  // to a flat row if seeding errors so the user can still use the app.
  try {
    return await createAccountWithSeed(userId, displayName ?? "Investor");
  } catch (err) {
    console.error("[ensureAccount] seeded creation failed; using flat fallback", err);
    const [created] = await db
      .insert(accounts)
      .values({
        userId,
        displayName: displayName ?? "Investor",
        cashBalance: "100000.00",
      })
      .onConflictDoNothing()
      .returning();
    if (created) return created;
    const [afterConflict] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    return afterConflict;
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  asAuthed(req).userId = String(userId);
  next();
}
