import {
  pgTable,
  uuid,
  varchar,
  numeric,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { table } from "node:console";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assetTypes = pgTable("asset_types", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id").notNull(),
    assetTypeId: uuid("asset_type_id").notNull(),
    balance: numeric("balance", { precision: 20, scale: 2 })
      .notNull()
      .default("0"),
    version: integer("version").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      userAssetUnique: uniqueIndex("user_asset_unique").on(
        table.userId,
        table.assetTypeId,
      ),
    };
  },
);

export const ledgerEntries = pgTable(
  "ledger_entries",
  {
    id: uuid("id").primaryKey(),
    walletId: uuid("wallet_id").notNull(),
    amount: numeric("amount", { precision: 20, scale: 2 }).notNull(),
    entryType: varchar("entry_type", { length: 10 }).notNull(),
    referenceId: varchar("reference_id", { length: 150 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      referenceUnique: uniqueIndex("reference_unique").on(table.referenceId),
    };
  },
);
