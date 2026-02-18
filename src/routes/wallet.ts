import { Router, type Request, type Response } from "express";
import { db } from "../db/index.js";
import { users, wallets, assetTypes } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { spendFromWallet, topUpWallet } from "../services/wallet.js";
import {
  balanceParamsSchema,
  spendSchema,
  topUpSchema,
} from "../validators/wallet.js";

const router: Router = Router();

// get balance route
router.get(
  "/:userId/:assetName/balance",
  async (req: Request, res: Response) => {
    try {
      const parsed = balanceParamsSchema.safeParse(req.params);

      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid parameters",
          errors: parsed.error.issues,
        });
      }

      const { userId, assetName } = parsed.data;

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

// add balance route
router.post("/topup", async (req: Request, res: Response) => {
  try {
    const parsed = topUpSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid inputs",
        errors: parsed.error.issues,
      });
    }

    const { userId, assetName, amount, referenceId } = parsed.data;

    const result = await topUpWallet({
      userId,
      assetName,
      amount: Number(amount),
      referenceId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    const errorMessage =
      error && typeof error.message === "string"
        ? error.message
        : String(error);

    if (errorMessage.includes("Conflict")) {
      return res.status(409).json({
        message: "Retry Request",
      });
    }

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// spend balance route
router.post("/spend", async (req: Request, res: Response) => {
  try {
    const parsed = spendSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: parsed.error.issues,
      });
    }

    const { userId, assetName, amount, referenceId } = parsed.data;

    const result = await spendFromWallet({
      userId,
      assetName,
      amount,
      referenceId,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error(error);

    const errorMessage =
      error && typeof error.message === "string"
        ? error.message
        : String(error);

    if (errorMessage.includes("Insufficent")) {
      return res.status(400).json({
        message: "Insufficent balance",
      });
    }

    if (error.message.includes("Conflict")) {
      return res.status(409).json({
        message: "Retry request",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;
