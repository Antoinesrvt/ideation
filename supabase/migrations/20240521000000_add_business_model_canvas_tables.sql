-- Migration to add Business Model Canvas tables

-- Create business model canvas tables
CREATE TABLE IF NOT EXISTS canvas_sections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  section_type text CHECK (section_type IN ('key_partners', 'key_activities', 'value_propositions', 'customer_segments', 'channels', 'cost_structure', 'revenue_streams', 'key_resources', 'customer_relationships')),
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, section_type)
);

CREATE TABLE IF NOT EXISTS canvas_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id uuid REFERENCES canvas_sections(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  text text NOT NULL,
  checked boolean DEFAULT false,
  order_index integer DEFAULT 0,
  color text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX canvas_sections_project_id_idx ON canvas_sections(project_id);
CREATE INDEX canvas_items_section_id_idx ON canvas_items(section_id);
CREATE INDEX canvas_items_project_id_idx ON canvas_items(project_id);

-- Enable RLS on the tables
ALTER TABLE canvas_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Canvas sections policies
CREATE POLICY "Users can view own project's canvas sections"
  ON canvas_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_sections.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project's canvas sections"
  ON canvas_sections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_sections.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project's canvas sections"
  ON canvas_sections FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_sections.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project's canvas sections"
  ON canvas_sections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_sections.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Canvas items policies
CREATE POLICY "Users can view own project's canvas items"
  ON canvas_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_items.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project's canvas items"
  ON canvas_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_items.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project's canvas items"
  ON canvas_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_items.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project's canvas items"
  ON canvas_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = canvas_items.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON canvas_sections
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON canvas_items
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Helper function to create default canvas sections for a new project
CREATE OR REPLACE FUNCTION create_default_canvas_sections()
RETURNS TRIGGER AS $$
DECLARE
  section_types text[] := ARRAY['key_partners', 'key_activities', 'value_propositions', 'customer_segments', 'channels', 'cost_structure', 'revenue_streams', 'key_resources', 'customer_relationships'];
  section_type text;
  order_idx integer := 0;
BEGIN
  FOREACH section_type IN ARRAY section_types
  LOOP
    INSERT INTO canvas_sections (project_id, section_type, order_index, created_by)
    VALUES (NEW.id, section_type, order_idx, NEW.owner_id);
    order_idx := order_idx + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create canvas sections when a new project is created
CREATE TRIGGER create_canvas_sections_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE create_default_canvas_sections();

-- Function to migrate existing project canvas data from metadata JSON
CREATE OR REPLACE FUNCTION migrate_canvas_data()
RETURNS void AS $$
DECLARE
  project_record RECORD;
  section_id uuid;
  section_name text;
  item_record RECORD;
  canvas_json jsonb;
BEGIN
  FOR project_record IN SELECT id, metadata, owner_id FROM projects WHERE metadata ? 'canvas'
  LOOP
    canvas_json := project_record.metadata->'canvas';
    
    -- For each section in the canvas JSON
    FOR section_name IN 
      SELECT jsonb_object_keys(canvas_json)
    LOOP
      -- Convert section name to section_type format
      DECLARE
        section_type text := CASE
          WHEN section_name = 'keyPartners' THEN 'key_partners'
          WHEN section_name = 'keyActivities' THEN 'key_activities'
          WHEN section_name = 'valuePropositions' THEN 'value_propositions'
          WHEN section_name = 'customerSegments' THEN 'customer_segments'
          WHEN section_name = 'customerRelationships' THEN 'customer_relationships'
          WHEN section_name = 'channels' THEN 'channels'
          WHEN section_name = 'costStructure' THEN 'cost_structure'
          WHEN section_name = 'revenueStreams' THEN 'revenue_streams'
          WHEN section_name = 'keyResources' THEN 'key_resources'
          ELSE section_name
        END;
      BEGIN
        -- Check if section already exists
        SELECT id INTO section_id FROM canvas_sections 
        WHERE project_id = project_record.id AND section_type = section_type;
        
        -- Create section if it doesn't exist
        IF NOT FOUND THEN
          INSERT INTO canvas_sections (project_id, section_type, created_by)
          VALUES (project_record.id, section_type, project_record.owner_id)
          RETURNING id INTO section_id;
        END IF;
        
        -- For each item in the section array
        FOR item_record IN 
          SELECT * FROM jsonb_array_elements(canvas_json->section_name) AS item
        LOOP
          -- Insert the item
          INSERT INTO canvas_items (section_id, project_id, text, checked, created_by)
          VALUES (
            section_id, 
            project_record.id, 
            item_record.item->>'text', 
            COALESCE((item_record.item->>'checked')::boolean, false),
            project_record.owner_id
          );
        END LOOP;
      END;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_canvas_data();

-- Drop the migration function as we don't need it anymore
DROP FUNCTION migrate_canvas_data(); 