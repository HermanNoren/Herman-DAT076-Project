CREATE TYPE "public"."access_level" AS ENUM('Master', 'Individual', 'Common');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."order_reason" AS ENUM('lost', 'damaged', 'additional_copy', 'stolen', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('placed', 'ready', 'collected');--> statement-breakpoint
CREATE TABLE "lock_systems" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reference_code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lock_systems_reference_code_unique" UNIQUE("reference_code")
);
--> statement-breakpoint
CREATE TABLE "keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"access_level" "access_level" NOT NULL,
	"lock_system_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "keys_lock_system_id_label_unique" UNIQUE("lock_system_id","label")
);
--> statement-breakpoint
CREATE TABLE "user_lock_systems" (
	"user_id" uuid NOT NULL,
	"lock_system_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_lock_systems_user_id_lock_system_id_pk" PRIMARY KEY("user_id","lock_system_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"key_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"reason" "order_reason" NOT NULL,
	"reason_detail" text,
	"status" "order_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_quantity_positive" CHECK ("orders"."quantity" > 0)
);
--> statement-breakpoint
ALTER TABLE "keys" ADD CONSTRAINT "keys_lock_system_id_lock_systems_id_fk" FOREIGN KEY ("lock_system_id") REFERENCES "public"."lock_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lock_systems" ADD CONSTRAINT "user_lock_systems_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lock_systems" ADD CONSTRAINT "user_lock_systems_lock_system_id_lock_systems_id_fk" FOREIGN KEY ("lock_system_id") REFERENCES "public"."lock_systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_key_id_keys_id_fk" FOREIGN KEY ("key_id") REFERENCES "public"."keys"("id") ON DELETE no action ON UPDATE no action;