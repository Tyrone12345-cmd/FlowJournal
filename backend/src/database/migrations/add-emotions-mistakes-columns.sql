-- Add emotions and mistakes columns to trades table
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS emotions TEXT,
ADD COLUMN IF NOT EXISTS mistakes TEXT;

-- Update comment
COMMENT ON COLUMN trades.emotions IS 'Comma-separated list of emotions during the trade';
COMMENT ON COLUMN trades.mistakes IS 'Comma-separated list of mistakes/learnings from the trade';
