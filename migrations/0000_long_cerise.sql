CREATE TABLE "athletes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	"status" varchar(50),
	"current_phase_id" varchar
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" varchar NOT NULL,
	"phase_id" varchar NOT NULL,
	"block_number" integer NOT NULL,
	"name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"duration" integer NOT NULL,
	"season" varchar(20) NOT NULL,
	"sub_season" varchar(50),
	"status" varchar(20) NOT NULL,
	"current_day" jsonb,
	"throwing" jsonb,
	"movement" jsonb,
	"lifting" jsonb,
	"conditioning" jsonb,
	"last_modification" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phases" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" varchar NOT NULL,
	"phase_number" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" varchar NOT NULL,
	"athlete_id" varchar NOT NULL,
	"athlete_name" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"routine_types" jsonb NOT NULL,
	"block_duration" integer NOT NULL,
	"status" varchar(50),
	"season" varchar(50),
	"sub_season" varchar(50),
	"last_modification" timestamp,
	"last_submission" timestamp,
	"current_day" jsonb,
	"next_block_due" timestamp,
	"days_complete" integer,
	"days_available" integer,
	CONSTRAINT "programs_program_id_unique" UNIQUE("program_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_phase_id_phases_id_fk" FOREIGN KEY ("phase_id") REFERENCES "public"."phases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phases" ADD CONSTRAINT "phases_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;