-- AlterTable
ALTER TABLE "m_plan" ADD COLUMN "stripePriceId" VARCHAR(255);

-- AlterTable
ALTER TABLE "t_user" ADD COLUMN "stripeSubscriptionId" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_stripeSubscriptionId_key" ON "t_user"("stripeSubscriptionId");
