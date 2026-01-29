/*
  Warnings:

  - You are about to drop the column `companyId` on the `t_user` table. All the data in the column will be lost.
  - You are about to drop the column `initPassword` on the `t_user` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `t_user` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `t_user` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the `m_site` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `t_company` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerkUserId]` on the table `t_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerkUserId` to the `t_user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `t_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "t_user" DROP CONSTRAINT "t_user_companyId_fkey";

-- AlterTable
ALTER TABLE "t_user" DROP COLUMN "companyId",
DROP COLUMN "initPassword",
DROP COLUMN "password",
ADD COLUMN     "clerkUserId" VARCHAR(255) NOT NULL,
ADD COLUMN     "imageUrl" VARCHAR(500),
ADD COLUMN     "planId" INTEGER NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- DropTable
DROP TABLE "m_site";

-- DropTable
DROP TABLE "t_company";

-- CreateTable
CREATE TABLE "m_plan" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(25) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "m_plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_clerkUserId_key" ON "t_user"("clerkUserId");

-- AddForeignKey
ALTER TABLE "t_user" ADD CONSTRAINT "t_user_planId_fkey" FOREIGN KEY ("planId") REFERENCES "m_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
