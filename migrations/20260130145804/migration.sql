/*
  Warnings:

  - You are about to drop the column `clerkUserId` on the `t_user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[authId]` on the table `t_user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `authId` to the `t_user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "t_user_clerkUserId_key";

-- AlterTable
ALTER TABLE "t_user" DROP COLUMN "clerkUserId",
ADD COLUMN     "authId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "t_user_authId_key" ON "t_user"("authId");
