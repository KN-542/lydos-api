-- CreateTable
CREATE TABLE "m_site" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "m_site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_company" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_user" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "name" VARCHAR(25) NOT NULL,
    "email" TEXT NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "initPassword" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "t_user_email_key" ON "t_user"("email");

-- AddForeignKey
ALTER TABLE "t_user" ADD CONSTRAINT "t_user_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "t_company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
