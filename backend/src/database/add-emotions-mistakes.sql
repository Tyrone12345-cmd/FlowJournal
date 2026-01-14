-- Add emotions and mistakes columns to trades table

ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS emotions TEXT,
ADD COLUMN IF NOT EXISTS mistakes TEXT;

-- Add index for better search performance if needed
CREATE INDEX IF NOT EXISTS idx_trades_emotions ON trades(emotions);
CREATE INDEX IF NOT EXISTS idx_trades_mistakes ON trades(mistakes);
