ALTER TABLE "Score" ADD CONSTRAINT score_value_range CHECK ("scoreValue" >= 1 AND "scoreValue" <= 45);
ALTER TABLE "Subscription" ADD CONSTRAINT charity_pct_min CHECK ("charityPercentage" >= 10.0);
