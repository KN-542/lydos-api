-- CreateTable
CREATE TABLE "t_stripe_customer" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "stripeCustomerId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_stripe_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_payment_method" (
    "id" SERIAL NOT NULL,
    "stripeCustomerId" INTEGER NOT NULL,
    "stripePaymentMethodId" VARCHAR(255) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "last4" VARCHAR(4) NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_stripe_customer_userId_key" ON "t_stripe_customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "t_stripe_customer_stripeCustomerId_key" ON "t_stripe_customer"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "t_payment_method_stripePaymentMethodId_key" ON "t_payment_method"("stripePaymentMethodId");

-- AddForeignKey
ALTER TABLE "t_stripe_customer" ADD CONSTRAINT "t_stripe_customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "t_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_payment_method" ADD CONSTRAINT "t_payment_method_stripeCustomerId_fkey" FOREIGN KEY ("stripeCustomerId") REFERENCES "t_stripe_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
