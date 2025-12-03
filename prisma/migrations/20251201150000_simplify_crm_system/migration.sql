-- Migration: Simplify CRM System
-- This migration removes over-engineered features and simplifies the CRM for e-commerce

-- Step 1: Change columns to text temporarily to allow updates
ALTER TABLE "public"."leads" ALTER COLUMN "source" TYPE text USING "source"::text;
ALTER TABLE "public"."leads" ALTER COLUMN "status" TYPE text USING "status"::text;

-- Step 2: Update existing data to use new enum values
-- Update LeadSource: EMAIL_CAMPAIGN -> EMAIL, COLD_CALL -> PHONE
UPDATE "public"."leads" 
SET "source" = 'EMAIL'
WHERE "source" = 'EMAIL_CAMPAIGN';

UPDATE "public"."leads" 
SET "source" = 'PHONE'
WHERE "source" = 'COLD_CALL';

-- Step 3: Update LeadStatus: PROPOSAL/NEGOTIATION -> QUALIFIED, UNQUALIFIED -> LOST
UPDATE "public"."leads" 
SET "status" = 'QUALIFIED'
WHERE "status" IN ('PROPOSAL', 'NEGOTIATION');

UPDATE "public"."leads" 
SET "status" = 'LOST'
WHERE "status" = 'UNQUALIFIED';

-- Step 4: Remove opportunityId from quotes (set to NULL first, then drop column)
UPDATE "public"."quotes" 
SET "opportunityId" = NULL 
WHERE "opportunityId" IS NOT NULL;

-- Step 5: Drop foreign key constraints and tables that will be removed
-- Drop OpportunityActivity table (if exists)
DROP TABLE IF EXISTS "public"."opportunity_activities" CASCADE;

-- Drop Opportunity table (if exists)
DROP TABLE IF EXISTS "public"."opportunities" CASCADE;

-- Drop CampaignAnalytics table (if exists)
DROP TABLE IF EXISTS "public"."campaign_analytics" CASCADE;

-- Drop CustomerCampaign table (if exists)
DROP TABLE IF EXISTS "public"."customer_campaigns" CASCADE;

-- Drop Campaign table (if exists)
DROP TABLE IF EXISTS "public"."campaigns" CASCADE;

-- Drop LeadActivity table (if exists)
DROP TABLE IF EXISTS "public"."lead_activities" CASCADE;

-- Step 6: Remove columns from existing tables
-- Remove opportunityId from quotes
ALTER TABLE "public"."quotes" DROP COLUMN IF EXISTS "opportunityId";

-- Remove score, expectedValue, expectedClose from leads
ALTER TABLE "public"."leads" DROP COLUMN IF EXISTS "score";
ALTER TABLE "public"."leads" DROP COLUMN IF EXISTS "expectedValue";
ALTER TABLE "public"."leads" DROP COLUMN IF EXISTS "expectedClose";

-- Step 7: Update LeadSource enum - Remove EMAIL_CAMPAIGN and COLD_CALL
-- PostgreSQL doesn't support removing enum values directly, so we recreate the enum
-- First, change column to text temporarily
ALTER TABLE "public"."leads" ALTER COLUMN "source" TYPE text USING "source"::text;

-- Create new enum type with only the values we want
CREATE TYPE "public"."LeadSource_new" AS ENUM ('WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'TRADE_SHOW', 'PHONE', 'PARTNER', 'ADVERTISING', 'OTHER');

-- Update column to use new enum (data already migrated in Step 1)
ALTER TABLE "public"."leads" ALTER COLUMN "source" TYPE "public"."LeadSource_new" USING "source"::"public"."LeadSource_new";

-- Drop old enum and rename new one
DROP TYPE "public"."LeadSource";
ALTER TYPE "public"."LeadSource_new" RENAME TO "LeadSource";

-- Step 8: Update LeadStatus enum - Remove PROPOSAL, NEGOTIATION, UNQUALIFIED
-- First, change column to text temporarily
ALTER TABLE "public"."leads" ALTER COLUMN "status" TYPE text USING "status"::text;

-- Create new enum type
CREATE TYPE "public"."LeadStatus_new" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');

-- Update column to use new enum (data already migrated in Step 2)
ALTER TABLE "public"."leads" ALTER COLUMN "status" TYPE "public"."LeadStatus_new" USING "status"::"public"."LeadStatus_new";

-- Drop old enum and rename new one
DROP TYPE "public"."LeadStatus";
ALTER TYPE "public"."LeadStatus_new" RENAME TO "LeadStatus";

-- Step 9: Drop unused enum types
DROP TYPE IF EXISTS "public"."OpportunityStage" CASCADE;
DROP TYPE IF EXISTS "public"."CampaignType" CASCADE;
DROP TYPE IF EXISTS "public"."CampaignStatus" CASCADE;
DROP TYPE IF EXISTS "public"."ActivityType" CASCADE;
