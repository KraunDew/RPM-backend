-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateTable
CREATE TABLE "AIConversation" (
    "id_conversation" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id_conversation")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id_message" TEXT NOT NULL,
    "id_conversation" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "AIUserMemory" (
    "id_memory" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIUserMemory_pkey" PRIMARY KEY ("id_memory")
);

-- CreateIndex
CREATE INDEX "AIConversation_id_user_updatedAt_idx" ON "AIConversation"("id_user", "updatedAt");

-- CreateIndex
CREATE INDEX "AIMessage_id_conversation_createdAt_idx" ON "AIMessage"("id_conversation", "createdAt");

-- CreateIndex
CREATE INDEX "AIUserMemory_id_user_idx" ON "AIUserMemory"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "AIUserMemory_id_user_key_key" ON "AIUserMemory"("id_user", "key");

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_id_conversation_fkey" FOREIGN KEY ("id_conversation") REFERENCES "AIConversation"("id_conversation") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUserMemory" ADD CONSTRAINT "AIUserMemory_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
