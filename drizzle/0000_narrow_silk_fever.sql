CREATE TYPE "public"."classification" AS ENUM('Compact', 'SUV', 'Sports', 'Subcompact', 'Minivan', 'Luxury');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('holiday', 'duration', 'none');--> statement-breakpoint
CREATE TYPE "public"."pricing_model" AS ENUM('per_rental', 'per_day');--> statement-breakpoint
CREATE TABLE "addons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"pricing_model" "pricing_model" NOT NULL,
	"price_cents" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "addons_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"base_price_cents" integer NOT NULL,
	"discount_type" "discount_type" DEFAULT 'none' NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"total_price_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"doors" integer NOT NULL,
	"max_passengers" integer NOT NULL,
	"classification" "classification" NOT NULL,
	"thumbnail_url" text NOT NULL,
	"daily_rate_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reservations_vehicle_id" ON "reservations" USING btree ("vehicle_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_time_range" ON "reservations" USING btree ("vehicle_id","start_time","end_time");--> statement-breakpoint
CREATE INDEX "idx_vehicles_classification" ON "vehicles" USING btree ("classification");--> statement-breakpoint
CREATE INDEX "idx_vehicles_daily_rate" ON "vehicles" USING btree ("daily_rate_cents");--> statement-breakpoint
CREATE INDEX "idx_vehicles_max_passengers" ON "vehicles" USING btree ("max_passengers");