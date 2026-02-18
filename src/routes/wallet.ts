import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { users, wallets, assetTypes } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router: Router = Router();

router.get(
  "/:userId/:assetName/balance",
  async (req: Request, res: Response) => {
    try {
      const { userId, assetName } = req.params as {
        userId: string;
        assetName: string;
      };

      const result = await db
        .select({
          balance: wallets.balance,
        })
        .from(wallets)
        .innerJoin(users, eq(wallets.userId, users.id))
        .innerJoin(assetTypes, eq(wallets.assetTypeId, assetTypes.id))
        .where(and(eq(users.id, userId), eq(assetTypes.name, assetName)));

      if (result.length === 0) {
        return res.status(404).json({
          message: "Wallet not found",
        });
      }

      return res.status(200).json({
        balance: result[0]?.balance,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },
);

export default router;
