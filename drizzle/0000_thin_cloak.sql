CREATE TABLE "asset_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "asset_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"wallet_id" uuid NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"entry_type" varchar(10) NOT NULL,
	"reference_id" varchar(150) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"asset_type_id" uuid NOT NULL,
	"balance" numeric(20, 2) DEFAULT '0' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "reference_unique" ON "ledger_entries" USING btree ("reference_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_asset_unique" ON "wallets" USING btree ("user_id","asset_type_id");