/*
  Warnings:

  - Added the required column `description` to the `m_plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `m_plan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "m_plan" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "price" INTEGER NOT NULL;
