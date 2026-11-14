CREATE TABLE "shipping_policy" ("id" TEXT NOT NULL DEFAULT 'default', "freeShippingThreshold" INTEGER NOT NULL DEFAULT 250000000, CONSTRAINT "shipping_policy_pkey" PRIMARY KEY ("id"));
