-- CreateTable
CREATE TABLE "m_model" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "modelId" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "m_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_chat_session" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_chat_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_chat_history" (
    "id" SERIAL NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "content" TEXT NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "t_chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "m_model_modelId_key" ON "m_model"("modelId");

-- AddForeignKey
ALTER TABLE "t_chat_session" ADD CONSTRAINT "t_chat_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "t_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_chat_session" ADD CONSTRAINT "t_chat_session_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "m_model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_chat_history" ADD CONSTRAINT "t_chat_history_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "t_chat_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
