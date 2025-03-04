-- Create research cache table
CREATE TABLE research_cache (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL,
  key text NOT NULL,
  data jsonb NOT NULL,
  expiry integer NOT NULL DEFAULT 60, -- minutes until cache expires
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(type, key)
);

-- Create indexes
CREATE INDEX research_cache_type_key_idx ON research_cache(type, key);
CREATE INDEX research_cache_created_at_idx ON research_cache(created_at);

-- Enable RLS
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view cached research data"
  ON research_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create and update cached research data"
  ON research_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update cached research data"
  ON research_cache FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete cached research data"
  ON research_cache FOR DELETE
  TO authenticated
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_research_cache
  BEFORE UPDATE ON research_cache
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at(); 