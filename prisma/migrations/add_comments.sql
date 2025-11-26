-- Add Comments table for document comments
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "versionId" TEXT,
    "authorId" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'Anonymous',
    "authorEmail" TEXT,
    "content" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Add index for document queries
CREATE INDEX IF NOT EXISTS "Comment_documentId_idx" ON "Comment"("documentId");
CREATE INDEX IF NOT EXISTS "Comment_parentId_idx" ON "Comment"("parentId");
CREATE INDEX IF NOT EXISTS "Comment_resolved_idx" ON "Comment"("resolved");

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Comment_documentId_fkey'
    ) THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_documentId_fkey" 
        FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key for parent comments
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Comment_parentId_fkey'
    ) THEN
        ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" 
        FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
