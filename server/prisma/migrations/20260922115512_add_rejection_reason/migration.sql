-- Stores the admin's free-text reason when rejecting a winner verification, shown back to the
-- user per the architecture doc's admin Winners spec.
ALTER TABLE "DrawWinner" ADD COLUMN "rejectionReason" TEXT;
