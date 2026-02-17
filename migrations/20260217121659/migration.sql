/*
  Warnings:

  - You are about to drop the `t_payment_method` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "t_payment_method" DROP CONSTRAINT "t_payment_method_stripeCustomerId_fkey";

-- DropTable
DROP TABLE "t_payment_method";
