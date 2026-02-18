import { db } from "../db/index.js";
import { wallets, ledgerEntries, assetTypes } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function topUpWallet(
  userId: string,
  assetName: string,
  amount: number,
  referenceId: string,
) {
  return db.transaction(async (tx) => {
    // Idempotency Check
    const existing = await tx
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.referenceId, referenceId));

    if (existing.length > 0) {
      return { message: "Already processed", referenceId };
    }

    // Get wallet
    const walletResult = await tx
      .select({
        id: wallets.id,
        balance: wallets.balance,
        version: wallets.version,
      })
      .from(wallets)
      .innerJoin(assetTypes, eq(wallets.assetTypeId, assetTypes.id))
      .where(and(eq(wallets.userId, userId), eq(assetTypes.name, assetName)));

    if (walletResult.length === 0) {
      throw new Error("Wallet not found");
    }

    const wallet = walletResult[0];

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Optimistic Lock update
    const updated = await tx
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        version: sql`${wallets.version} + 1`,
      })
      .where(
        and(eq(wallets.id, wallet.id), eq(wallets.version, wallet.version)),
      );

    if (updated.rowCount === 0) {
      throw new Error("Conflict detected. Retry");
    }

    // Insert ledger entry
    await tx.insert(ledgerEntries).values({
      id: randomUUID(),
      walletId: wallet.id,
      amount: amount.toString(),
      entryType: "credit",
      referenceId,
    });

    return { message: "Top-up successful", referenceId };
  });
}
