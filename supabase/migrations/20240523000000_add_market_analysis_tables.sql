-- Migration to add Market Analysis tables

-- Create market analysis tables
CREATE TABLE IF NOT EXISTS market_personas (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  demographics text,
  pain_points text[] DEFAULT '{}',
  goals text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_interviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  interview_date timestamptz,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  notes text,
  key_insights text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_competitors (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  website text,
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  price text,
  market_share text,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_trends (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  direction text CHECK (direction IN ('upward', 'downward', 'stable')),
  trend_type text CHECK (trend_type IN ('opportunity', 'threat', 'neutral')),
  description text,
  tags text[] DEFAULT '{}',
  sources text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX market_personas_project_id_idx ON market_personas(project_id);
CREATE INDEX market_interviews_project_id_idx ON market_interviews(project_id);
CREATE INDEX market_competitors_project_id_idx ON market_competitors(project_id);
CREATE INDEX market_trends_project_id_idx ON market_trends(project_id);

-- Enable RLS on the tables
ALTER TABLE market_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;

-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_market_policies(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Users can view own project''s %1$s"
      ON %1$s FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = %1$s.project_id
          AND projects.owner_id = auth.uid()
        )
      );
    
    CREATE POLICY "Users can insert own project''s %1$s"
      ON %1$s FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = %1$s.project_id
          AND projects.owner_id = auth.uid()
        )
      );
    
    CREATE POLICY "Users can update own project''s %1$s"
      ON %1$s FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = %1$s.project_id
          AND projects.owner_id = auth.uid()
        )
      );
    
    CREATE POLICY "Users can delete own project''s %1$s"
      ON %1$s FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = %1$s.project_id
          AND projects.owner_id = auth.uid()
        )
      );
  ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply policies to all market analysis tables
SELECT create_market_policies('market_personas');
SELECT create_market_policies('market_interviews');
SELECT create_market_policies('market_competitors');
SELECT create_market_policies('market_trends');

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON market_personas
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON market_interviews
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON market_competitors
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON market_trends
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to migrate existing market analysis data from metadata JSON
CREATE OR REPLACE FUNCTION migrate_market_analysis_data()
RETURNS void AS $$
DECLARE
  project_record RECORD;
  market_json jsonb;
  persona_record RECORD;
  interview_record RECORD;
  competitor_record RECORD;
  trend_record RECORD;
BEGIN
  FOR project_record IN SELECT id, metadata, owner_id FROM projects WHERE metadata ? 'marketAnalysis'
  LOOP
    market_json := project_record.metadata->'marketAnalysis';
    
    -- Migrate personas
    IF market_json ? 'customerInsights' AND market_json->'customerInsights' ? 'personas' THEN
      FOR persona_record IN 
        SELECT * FROM jsonb_array_elements(market_json->'customerInsights'->'personas') AS persona
      LOOP
        INSERT INTO market_personas (
          project_id,
          name,
          role,
          demographics,
          pain_points,
          goals,
          created_by
        )
        VALUES (
          project_record.id,
          persona_record.persona->>'name',
          persona_record.persona->>'role',
          persona_record.persona->>'demographics',
          COALESCE((SELECT array_agg(jsonb_array_elements_text(persona_record.persona->'painPoints'))), '{}'::text[]),
          COALESCE((SELECT array_agg(jsonb_array_elements_text(persona_record.persona->'goals'))), '{}'::text[]),
          project_record.owner_id
        );
      END LOOP;
    END IF;
    
    -- Migrate interviews
    IF market_json ? 'customerInsights' AND market_json->'customerInsights' ? 'interviews' THEN
      FOR interview_record IN 
        SELECT * FROM jsonb_array_elements(market_json->'customerInsights'->'interviews') AS interview
      LOOP
        INSERT INTO market_interviews (
          project_id,
          name,
          company,
          interview_date,
          sentiment,
          notes,
          created_by
        )
        VALUES (
          project_record.id,
          interview_record.interview->>'name',
          interview_record.interview->>'company',
          CASE WHEN interview_record.interview->>'date' IS NOT NULL THEN
            (interview_record.interview->>'date')::timestamptz
          ELSE
            NULL
          END,
          interview_record.interview->>'sentiment',
          interview_record.interview->>'notes',
          project_record.owner_id
        );
      END LOOP;
    END IF;
    
    -- Migrate competitors
    IF market_json ? 'competitors' THEN
      FOR competitor_record IN 
        SELECT * FROM jsonb_array_elements(market_json->'competitors') AS competitor
      LOOP
        INSERT INTO market_competitors (
          project_id,
          name,
          strengths,
          weaknesses,
          price,
          created_by
        )
        VALUES (
          project_record.id,
          competitor_record.competitor->>'name',
          COALESCE((SELECT array_agg(jsonb_array_elements_text(competitor_record.competitor->'strengths'))), '{}'::text[]),
          COALESCE((SELECT array_agg(jsonb_array_elements_text(competitor_record.competitor->'weaknesses'))), '{}'::text[]),
          competitor_record.competitor->>'price',
          project_record.owner_id
        );
      END LOOP;
    END IF;
    
    -- Migrate trends
    IF market_json ? 'trends' THEN
      FOR trend_record IN 
        SELECT * FROM jsonb_array_elements(market_json->'trends') AS trend
      LOOP
        INSERT INTO market_trends (
          project_id,
          name,
          direction,
          trend_type,
          description,
          tags,
          created_by
        )
        VALUES (
          project_record.id,
          trend_record.trend->>'name',
          trend_record.trend->>'direction',
          trend_record.trend->>'type',
          trend_record.trend->>'description',
          COALESCE((SELECT array_agg(jsonb_array_elements_text(trend_record.trend->'tags'))), '{}'::text[]),
          project_record.owner_id
        );
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_market_analysis_data();

-- Drop the migration function and helper function
DROP FUNCTION migrate_market_analysis_data();
DROP FUNCTION create_market_policies(text); 