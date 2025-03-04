-- Migration to add GRP Model tables

-- Create GRP model tables
CREATE TABLE IF NOT EXISTS grp_categories (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  category_type text CHECK (category_type IN ('generation', 'remuneration', 'partage')),
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, category_type)
);

CREATE TABLE IF NOT EXISTS grp_sections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES grp_categories(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  section_type text NOT NULL,
  name text NOT NULL,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (category_id, section_type)
);

CREATE TABLE IF NOT EXISTS grp_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id uuid REFERENCES grp_sections(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  percentage integer,
  order_index integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX grp_categories_project_id_idx ON grp_categories(project_id);
CREATE INDEX grp_sections_category_id_idx ON grp_sections(category_id);
CREATE INDEX grp_sections_project_id_idx ON grp_sections(project_id);
CREATE INDEX grp_items_section_id_idx ON grp_items(section_id);
CREATE INDEX grp_items_project_id_idx ON grp_items(project_id);

-- Enable RLS on the tables
ALTER TABLE grp_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE grp_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE grp_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_grp_policies(table_name text) RETURNS void AS $$
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

-- Apply policies to all GRP tables
SELECT create_grp_policies('grp_categories');
SELECT create_grp_policies('grp_sections');
SELECT create_grp_policies('grp_items');

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON grp_categories
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON grp_sections
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON grp_items
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Helper function to create default GRP structure for a new project
CREATE OR REPLACE FUNCTION create_default_grp_structure()
RETURNS TRIGGER AS $$
DECLARE
  category_types text[] := ARRAY['generation', 'remuneration', 'partage'];
  category_type text;
  category_id uuid;
  order_idx integer := 0;
  
  -- Define section mappings
  generation_sections text[] := ARRAY['porteurs', 'propositionValeur', 'fabricationValeur'];
  remuneration_sections text[] := ARRAY['sourcesRevenus', 'volumeRevenus', 'performance'];
  partage_sections text[] := ARRAY['partiesPrenantes', 'conventions', 'ecosysteme'];
  
  -- Section names for display
  section_names jsonb := '{
    "porteurs": "Porteurs", 
    "propositionValeur": "Proposition de Valeur", 
    "fabricationValeur": "Fabrication de Valeur",
    "sourcesRevenus": "Sources de Revenus", 
    "volumeRevenus": "Volume de Revenus", 
    "performance": "Performance",
    "partiesPrenantes": "Parties Prenantes", 
    "conventions": "Conventions", 
    "ecosysteme": "Écosystème"
  }'::jsonb;
  
  section text;
  section_id uuid;
  section_order integer;
BEGIN
  -- Create each category
  FOREACH category_type IN ARRAY category_types
  LOOP
    INSERT INTO grp_categories (project_id, category_type, order_index, created_by)
    VALUES (NEW.id, category_type, order_idx, NEW.owner_id)
    RETURNING id INTO category_id;
    
    -- Add sections for each category
    section_order := 0;
    
    IF category_type = 'generation' THEN
      FOREACH section IN ARRAY generation_sections
      LOOP
        INSERT INTO grp_sections (
          category_id, 
          project_id, 
          section_type, 
          name, 
          order_index, 
          created_by
        )
        VALUES (
          category_id, 
          NEW.id, 
          section, 
          section_names->>section, 
          section_order, 
          NEW.owner_id
        );
        section_order := section_order + 1;
      END LOOP;
    ELSIF category_type = 'remuneration' THEN
      FOREACH section IN ARRAY remuneration_sections
      LOOP
        INSERT INTO grp_sections (
          category_id, 
          project_id, 
          section_type, 
          name, 
          order_index, 
          created_by
        )
        VALUES (
          category_id, 
          NEW.id, 
          section, 
          section_names->>section, 
          section_order, 
          NEW.owner_id
        );
        section_order := section_order + 1;
      END LOOP;
    ELSIF category_type = 'partage' THEN
      FOREACH section IN ARRAY partage_sections
      LOOP
        INSERT INTO grp_sections (
          category_id, 
          project_id, 
          section_type, 
          name, 
          order_index, 
          created_by
        )
        VALUES (
          category_id, 
          NEW.id, 
          section, 
          section_names->>section, 
          section_order, 
          NEW.owner_id
        );
        section_order := section_order + 1;
      END LOOP;
    END IF;
    
    order_idx := order_idx + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically create GRP structure when a new project is created
CREATE TRIGGER create_grp_structure_trigger
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE PROCEDURE create_default_grp_structure();

-- Function to migrate existing project GRP data from metadata JSON
CREATE OR REPLACE FUNCTION migrate_grp_data()
RETURNS void AS $$
DECLARE
  project_record RECORD;
  grp_json jsonb;
  category_id uuid;
  section_id uuid;
  category_name text;
  section_name text;
  item_record RECORD;
BEGIN
  FOR project_record IN SELECT id, metadata, owner_id FROM projects WHERE metadata ? 'grpModel'
  LOOP
    grp_json := project_record.metadata->'grpModel';
    
    -- For each category in the GRP JSON
    FOR category_name IN 
      SELECT jsonb_object_keys(grp_json)
    LOOP
      -- Convert category name to database format
      DECLARE
        category_type text := CASE
          WHEN category_name = 'generation' THEN 'generation'
          WHEN category_name = 'remuneration' THEN 'remuneration'
          WHEN category_name = 'partage' THEN 'partage'
          ELSE category_name
        END;
      BEGIN
        -- Check if category already exists
        SELECT id INTO category_id FROM grp_categories 
        WHERE project_id = project_record.id AND category_type = category_type;
        
        -- Create category if it doesn't exist
        IF NOT FOUND THEN
          INSERT INTO grp_categories (project_id, category_type, created_by)
          VALUES (project_record.id, category_type, project_record.owner_id)
          RETURNING id INTO category_id;
        END IF;
        
        -- For each section in the category
        FOR section_name IN 
          SELECT jsonb_object_keys(grp_json->category_name)
        LOOP
          -- Check if section already exists
          SELECT id INTO section_id FROM grp_sections 
          WHERE category_id = category_id AND section_type = section_name;
          
          -- Create section if it doesn't exist
          IF NOT FOUND THEN
            INSERT INTO grp_sections (
              category_id, 
              project_id, 
              section_type, 
              name, 
              created_by
            )
            VALUES (
              category_id, 
              project_record.id, 
              section_name,
              section_name, -- Default name same as type, can be updated later
              project_record.owner_id
            )
            RETURNING id INTO section_id;
          END IF;
          
          -- For each item in the section array
          FOR item_record IN 
            SELECT * FROM jsonb_array_elements(grp_json->category_name->section_name) AS item
          LOOP
            -- Insert the item
            INSERT INTO grp_items (
              section_id, 
              project_id, 
              title, 
              description, 
              percentage,
              created_by
            )
            VALUES (
              section_id, 
              project_record.id, 
              item_record.item->>'title',
              item_record.item->>'description',
              (item_record.item->>'percentage')::integer,
              project_record.owner_id
            );
          END LOOP;
        END LOOP;
      END;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_grp_data();

-- Drop the migration function and helper function
DROP FUNCTION migrate_grp_data();
DROP FUNCTION create_grp_policies(text); 