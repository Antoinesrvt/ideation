-- Migration to add Product Design (User Flow) tables

-- Create product design tables
CREATE TABLE IF NOT EXISTS product_wireframes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  image_url text,
  screen_type text,
  order_index integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_features (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  priority text CHECK (priority IN ('must', 'should', 'could', 'wont')),
  status text CHECK (status IN ('planned', 'in-progress', 'completed')),
  tags text[] DEFAULT '{}',
  notes text,
  effort integer DEFAULT 0,
  impact integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_journey_stages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_journey_actions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stage_id uuid REFERENCES product_journey_stages(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  description text NOT NULL,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_journey_pain_points (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  stage_id uuid REFERENCES product_journey_stages(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  issue text NOT NULL,
  solution text,
  priority text CHECK (priority IN ('low', 'medium', 'high')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX product_wireframes_project_id_idx ON product_wireframes(project_id);
CREATE INDEX product_features_project_id_idx ON product_features(project_id);
CREATE INDEX product_journey_stages_project_id_idx ON product_journey_stages(project_id);
CREATE INDEX product_journey_actions_stage_id_idx ON product_journey_actions(stage_id);
CREATE INDEX product_journey_actions_project_id_idx ON product_journey_actions(project_id);
CREATE INDEX product_journey_pain_points_stage_id_idx ON product_journey_pain_points(stage_id);
CREATE INDEX product_journey_pain_points_project_id_idx ON product_journey_pain_points(project_id);

-- Enable RLS on the tables
ALTER TABLE product_wireframes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_journey_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_journey_pain_points ENABLE ROW LEVEL SECURITY;

-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_product_design_policies(table_name text) RETURNS void AS $$
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

-- Apply policies to all product design tables
SELECT create_product_design_policies('product_wireframes');
SELECT create_product_design_policies('product_features');
SELECT create_product_design_policies('product_journey_stages');
SELECT create_product_design_policies('product_journey_actions');
SELECT create_product_design_policies('product_journey_pain_points');

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON product_wireframes
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON product_features
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON product_journey_stages
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON product_journey_actions
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON product_journey_pain_points
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to migrate existing user flow data from metadata JSON
CREATE OR REPLACE FUNCTION migrate_user_flow_data()
RETURNS void AS $$
DECLARE
  project_record RECORD;
  userflow_json jsonb;
  wireframe_record RECORD;
  feature_record RECORD;
  stage_record RECORD;
  stage_id uuid;
  action_text text;
  pain_point_record RECORD;
BEGIN
  FOR project_record IN SELECT id, metadata, owner_id FROM projects WHERE metadata ? 'userFlow'
  LOOP
    userflow_json := project_record.metadata->'userFlow';
    
    -- Migrate wireframes
    IF userflow_json ? 'wireframes' THEN
      FOR wireframe_record IN 
        SELECT * FROM jsonb_array_elements(userflow_json->'wireframes') AS wireframe
      LOOP
        INSERT INTO product_wireframes (
          project_id,
          name,
          image_url,
          created_by,
          created_at
        )
        VALUES (
          project_record.id,
          wireframe_record.wireframe->>'name',
          wireframe_record.wireframe->>'imageUrl',
          project_record.owner_id,
          CASE WHEN wireframe_record.wireframe->>'createdAt' IS NOT NULL THEN
            (wireframe_record.wireframe->>'createdAt')::timestamptz
          ELSE
            now()
          END
        );
      END LOOP;
    END IF;
    
    -- Migrate features
    IF userflow_json ? 'features' THEN
      FOR feature_record IN 
        SELECT * FROM jsonb_array_elements(userflow_json->'features') AS feature
      LOOP
        INSERT INTO product_features (
          project_id,
          name,
          description,
          priority,
          status,
          tags,
          created_by
        )
        VALUES (
          project_record.id,
          feature_record.feature->>'name',
          feature_record.feature->>'description',
          feature_record.feature->>'priority',
          feature_record.feature->>'status',
          COALESCE((SELECT array_agg(jsonb_array_elements_text(feature_record.feature->'tags'))), '{}'::text[]),
          project_record.owner_id
        );
      END LOOP;
    END IF;
    
    -- Migrate user journey stages
    IF userflow_json ? 'journey' AND userflow_json->'journey' ? 'stages' THEN
      FOR stage_record IN 
        SELECT * FROM jsonb_array_elements(userflow_json->'journey'->'stages') WITH ORDINALITY AS stage(data, idx)
      LOOP
        -- Insert stage
        INSERT INTO product_journey_stages (
          project_id,
          name,
          description,
          order_index,
          completed,
          created_by
        )
        VALUES (
          project_record.id,
          stage_record.data->>'name',
          stage_record.data->>'description',
          stage_record.idx::integer - 1,
          COALESCE((stage_record.data->>'completed')::boolean, false),
          project_record.owner_id
        )
        RETURNING id INTO stage_id;
        
        -- Insert actions for this stage
        IF stage_record.data ? 'actions' THEN
          FOR action_text IN 
            SELECT jsonb_array_elements_text(stage_record.data->'actions')
          LOOP
            INSERT INTO product_journey_actions (
              stage_id,
              project_id,
              description,
              created_by
            )
            VALUES (
              stage_id,
              project_record.id,
              action_text,
              project_record.owner_id
            );
          END LOOP;
        END IF;
        
        -- Insert pain points for this stage
        IF stage_record.data ? 'painPoints' THEN
          FOR pain_point_record IN 
            SELECT * FROM jsonb_array_elements(stage_record.data->'painPoints') AS pain_point
          LOOP
            INSERT INTO product_journey_pain_points (
              stage_id,
              project_id,
              issue,
              solution,
              created_by
            )
            VALUES (
              stage_id,
              project_record.id,
              pain_point_record.pain_point->>'issue',
              pain_point_record.pain_point->>'solution',
              project_record.owner_id
            );
          END LOOP;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_user_flow_data();

-- Drop the migration function and helper function
DROP FUNCTION migrate_user_flow_data();
DROP FUNCTION create_product_design_policies(text); 