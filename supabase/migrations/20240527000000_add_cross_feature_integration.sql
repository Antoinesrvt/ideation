-- Migration to add cross-feature integration capabilities

-- Create cross-feature tables for integrated functionality

-- Project Tags
CREATE TABLE IF NOT EXISTS project_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (project_id, name)
);

-- Feature Items Tags Junction Table
CREATE TABLE IF NOT EXISTS feature_item_tags (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tag_id uuid REFERENCES project_tags(id) ON DELETE CASCADE,
  feature_type text NOT NULL,  -- e.g. 'canvas', 'grp', 'market', etc.
  item_id uuid NOT NULL,       -- ID of the specific item
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Related Items (for cross-feature relationships)
CREATE TABLE IF NOT EXISTS related_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  source_type text NOT NULL,   -- e.g. 'canvas', 'grp', 'market', etc.
  source_id uuid NOT NULL,     -- ID of the specific source item
  target_type text NOT NULL,   -- e.g. 'canvas', 'grp', 'market', etc.
  target_id uuid NOT NULL,     -- ID of the specific target item
  relationship_type text,      -- e.g. 'supports', 'depends-on', 'related-to', etc.
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Prevent duplicate relationships
  UNIQUE (source_type, source_id, target_type, target_id)
);

-- Project Activity Log
CREATE TABLE IF NOT EXISTS project_activity_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_type text NOT NULL,   -- e.g. 'canvas', 'grp', 'market', etc.
  action text NOT NULL,         -- e.g. 'create', 'update', 'delete', etc.
  item_id uuid,                 -- ID of the specific item (if applicable)
  item_type text,               -- Type of the specific item (if applicable)
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Project Comments
CREATE TABLE IF NOT EXISTS project_comments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  feature_type text NOT NULL,   -- e.g. 'canvas', 'grp', 'market', etc.
  item_id uuid,                 -- ID of the specific item (if applicable)
  content text NOT NULL,
  parent_id uuid REFERENCES project_comments(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project Notifications
CREATE TABLE IF NOT EXISTS project_notifications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  feature_type text,           -- e.g. 'canvas', 'grp', 'market', etc.
  item_id uuid,                -- ID of the specific item (if applicable)
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Search Index (for faster cross-feature searching)
CREATE TABLE IF NOT EXISTS search_index (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  feature_type text NOT NULL,   -- e.g. 'canvas', 'grp', 'market', etc.
  item_id uuid NOT NULL,        -- ID of the specific item
  item_type text,               -- Type of the specific item (if applicable)
  title text,
  content text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector,
  UNIQUE (feature_type, item_id)
);

-- Add indexes for better performance
CREATE INDEX project_tags_project_id_idx ON project_tags(project_id);

CREATE INDEX feature_item_tags_tag_id_idx ON feature_item_tags(tag_id);
CREATE INDEX feature_item_tags_feature_type_idx ON feature_item_tags(feature_type);
CREATE INDEX feature_item_tags_item_id_idx ON feature_item_tags(item_id);

CREATE INDEX related_items_project_id_idx ON related_items(project_id);
CREATE INDEX related_items_source_idx ON related_items(source_type, source_id);
CREATE INDEX related_items_target_idx ON related_items(target_type, target_id);

CREATE INDEX project_activity_log_project_id_idx ON project_activity_log(project_id);
CREATE INDEX project_activity_log_feature_type_idx ON project_activity_log(feature_type);
CREATE INDEX project_activity_log_created_at_idx ON project_activity_log(created_at);
CREATE INDEX project_activity_log_user_id_idx ON project_activity_log(user_id);

CREATE INDEX project_comments_project_id_idx ON project_comments(project_id);
CREATE INDEX project_comments_feature_type_idx ON project_comments(feature_type);
CREATE INDEX project_comments_item_id_idx ON project_comments(item_id);
CREATE INDEX project_comments_parent_id_idx ON project_comments(parent_id);

CREATE INDEX project_notifications_user_id_idx ON project_notifications(user_id);
CREATE INDEX project_notifications_project_id_idx ON project_notifications(project_id);
CREATE INDEX project_notifications_is_read_idx ON project_notifications(is_read) WHERE is_read = false;

CREATE INDEX search_index_project_id_idx ON search_index(project_id);
CREATE INDEX search_index_feature_type_idx ON search_index(feature_type);
CREATE INDEX search_index_search_vector_idx ON search_index USING gin(search_vector);

-- Enable RLS on the tables
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_cross_feature_policies(table_name text) RETURNS void AS $$
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

-- Apply policies to cross-feature tables
SELECT create_cross_feature_policies('project_tags');
SELECT create_cross_feature_policies('related_items');
SELECT create_cross_feature_policies('project_activity_log');
SELECT create_cross_feature_policies('project_comments');
SELECT create_cross_feature_policies('search_index');

-- Special policy for feature_item_tags (based on the tag's project)
CREATE POLICY "Users can view their project's feature item tags"
  ON feature_item_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_tags
      JOIN projects ON projects.id = project_tags.project_id
      WHERE project_tags.id = feature_item_tags.tag_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert feature item tags for their projects"
  ON feature_item_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_tags
      JOIN projects ON projects.id = project_tags.project_id
      WHERE project_tags.id = feature_item_tags.tag_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update feature item tags for their projects"
  ON feature_item_tags FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM project_tags
      JOIN projects ON projects.id = project_tags.project_id
      WHERE project_tags.id = feature_item_tags.tag_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete feature item tags for their projects"
  ON feature_item_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM project_tags
      JOIN projects ON projects.id = project_tags.project_id
      WHERE project_tags.id = feature_item_tags.tag_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Special policy for project notifications (users can only see their own notifications)
CREATE POLICY "Users can view their own notifications"
  ON project_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON project_notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Project owners can insert notifications"
  ON project_notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_notifications.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON project_tags
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON related_items
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON project_comments
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON search_index
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to automatically update the search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(COALESCE(NEW.tags, '{}'::text[]), ' ')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for search vector updates
CREATE TRIGGER update_search_vector_trigger
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW
  EXECUTE PROCEDURE update_search_vector();

-- Function to log project activity
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
  project_id_val uuid;
  feature_type_val text;
  action_val text;
  details_val jsonb;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_val := 'create';
  ELSIF TG_OP = 'UPDATE' THEN
    action_val := 'update';
  ELSIF TG_OP = 'DELETE' THEN
    action_val := 'delete';
  END IF;
  
  -- Get the appropriate record based on operation
  IF TG_OP = 'DELETE' THEN
    -- For delete operations, use OLD
    project_id_val := OLD.project_id;
    
    -- Determine feature type based on the table name
    CASE TG_TABLE_NAME
      WHEN 'canvas_items' THEN
        feature_type_val := 'canvas';
        details_val := jsonb_build_object('text', OLD.text);
      WHEN 'grp_items' THEN
        feature_type_val := 'grp';
        details_val := jsonb_build_object('title', OLD.title);
      WHEN 'market_personas' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'persona');
      WHEN 'market_competitors' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'competitor');
      WHEN 'market_trends' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'trend');
      WHEN 'product_features' THEN
        feature_type_val := 'product_design';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'feature');
      WHEN 'validation_experiments' THEN
        feature_type_val := 'validation';
        details_val := jsonb_build_object('title', OLD.title, 'type', 'experiment');
      WHEN 'validation_ab_tests' THEN
        feature_type_val := 'validation';
        details_val := jsonb_build_object('title', OLD.title, 'type', 'abtest');
      WHEN 'financial_revenue_streams' THEN
        feature_type_val := 'financials';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'revenue');
      WHEN 'financial_cost_structure' THEN
        feature_type_val := 'financials';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'cost');
      WHEN 'team_members' THEN
        feature_type_val := 'team';
        details_val := jsonb_build_object('name', OLD.name, 'type', 'member');
      WHEN 'team_tasks' THEN
        feature_type_val := 'team';
        details_val := jsonb_build_object('title', OLD.title, 'type', 'task');
      ELSE
        feature_type_val := TG_TABLE_NAME;
        details_val := jsonb_build_object('id', OLD.id);
    END CASE;
    
    -- Insert log entry
    INSERT INTO project_activity_log (
      project_id,
      user_id,
      feature_type,
      action,
      item_id,
      item_type,
      details
    )
    VALUES (
      project_id_val,
      auth.uid(),
      feature_type_val,
      action_val,
      OLD.id,
      TG_TABLE_NAME,
      details_val
    );
    
    RETURN OLD;
  ELSE
    -- For insert/update operations, use NEW
    project_id_val := NEW.project_id;
    
    -- Determine feature type based on the table name
    CASE TG_TABLE_NAME
      WHEN 'canvas_items' THEN
        feature_type_val := 'canvas';
        details_val := jsonb_build_object('text', NEW.text);
      WHEN 'grp_items' THEN
        feature_type_val := 'grp';
        details_val := jsonb_build_object('title', NEW.title);
      WHEN 'market_personas' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'persona');
      WHEN 'market_competitors' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'competitor');
      WHEN 'market_trends' THEN
        feature_type_val := 'market';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'trend');
      WHEN 'product_features' THEN
        feature_type_val := 'product_design';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'feature');
      WHEN 'validation_experiments' THEN
        feature_type_val := 'validation';
        details_val := jsonb_build_object('title', NEW.title, 'type', 'experiment');
      WHEN 'validation_ab_tests' THEN
        feature_type_val := 'validation';
        details_val := jsonb_build_object('title', NEW.title, 'type', 'abtest');
      WHEN 'financial_revenue_streams' THEN
        feature_type_val := 'financials';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'revenue');
      WHEN 'financial_cost_structure' THEN
        feature_type_val := 'financials';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'cost');
      WHEN 'team_members' THEN
        feature_type_val := 'team';
        details_val := jsonb_build_object('name', NEW.name, 'type', 'member');
      WHEN 'team_tasks' THEN
        feature_type_val := 'team';
        details_val := jsonb_build_object('title', NEW.title, 'type', 'task');
      ELSE
        feature_type_val := TG_TABLE_NAME;
        details_val := jsonb_build_object('id', NEW.id);
    END CASE;
    
    -- For updates, add the old values to compare
    IF TG_OP = 'UPDATE' THEN
      details_val := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
    END IF;
    
    -- Insert log entry
    INSERT INTO project_activity_log (
      project_id,
      user_id,
      feature_type,
      action,
      item_id,
      item_type,
      details
    )
    VALUES (
      project_id_val,
      auth.uid(),
      feature_type_val,
      action_val,
      NEW.id,
      TG_TABLE_NAME,
      details_val
    );
    
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create search index function
CREATE OR REPLACE FUNCTION create_search_index()
RETURNS TRIGGER AS $$
DECLARE
  feature_type_val text;
  title_val text;
  content_val text;
  tags_val text[] := '{}';
BEGIN
  -- Determine feature type based on the table name
  CASE TG_TABLE_NAME
    WHEN 'canvas_items' THEN
      feature_type_val := 'canvas';
      title_val := NEW.text;
      content_val := NEW.text;
      tags_val := NEW.tags;
    WHEN 'grp_items' THEN
      feature_type_val := 'grp';
      title_val := NEW.title;
      content_val := NEW.description;
    WHEN 'market_personas' THEN
      feature_type_val := 'market';
      title_val := NEW.name;
      content_val := NEW.role || ' ' || NEW.demographics;
      tags_val := array_cat(NEW.pain_points, NEW.goals);
    WHEN 'market_competitors' THEN
      feature_type_val := 'market';
      title_val := NEW.name;
      content_val := array_to_string(array_cat(NEW.strengths, NEW.weaknesses), ' ');
    WHEN 'market_trends' THEN
      feature_type_val := 'market';
      title_val := NEW.name;
      content_val := NEW.description;
      tags_val := NEW.tags;
    WHEN 'product_features' THEN
      feature_type_val := 'product_design';
      title_val := NEW.name;
      content_val := NEW.description;
      tags_val := NEW.tags;
    WHEN 'validation_experiments' THEN
      feature_type_val := 'validation';
      title_val := NEW.title;
      content_val := NEW.description || ' ' || NEW.hypothesis || ' ' || NEW.results || ' ' || NEW.learnings;
    WHEN 'validation_ab_tests' THEN
      feature_type_val := 'validation';
      title_val := NEW.title;
      content_val := NEW.description || ' ' || NEW.variant_a || ' ' || NEW.variant_b || ' ' || NEW.notes;
    WHEN 'financial_revenue_streams' THEN
      feature_type_val := 'financials';
      title_val := NEW.name;
      content_val := NEW.description || ' ' || NEW.type || ' ' || NEW.pricing_model || ' ' || NEW.assumptions;
    WHEN 'financial_cost_structure' THEN
      feature_type_val := 'financials';
      title_val := NEW.name;
      content_val := NEW.description || ' ' || NEW.type || ' ' || NEW.category || ' ' || NEW.assumptions;
    WHEN 'team_members' THEN
      feature_type_val := 'team';
      title_val := NEW.name;
      content_val := NEW.role;
      tags_val := array_cat(NEW.expertise, NEW.responsibilities);
    WHEN 'team_tasks' THEN
      feature_type_val := 'team';
      title_val := NEW.title;
      content_val := NEW.description || ' ' || NEW.notes;
    ELSE
      RETURN NEW;
  END CASE;
  
  -- Insert or update the search index
  INSERT INTO search_index (
    project_id,
    feature_type,
    item_id,
    item_type,
    title,
    content,
    tags
  )
  VALUES (
    NEW.project_id,
    feature_type_val,
    NEW.id,
    TG_TABLE_NAME,
    title_val,
    content_val,
    tags_val
  )
  ON CONFLICT (feature_type, item_id) 
  DO UPDATE SET
    title = title_val,
    content = content_val,
    tags = tags_val,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for deleting from search index
CREATE OR REPLACE FUNCTION delete_from_search_index()
RETURNS TRIGGER AS $$
DECLARE
  feature_type_val text;
BEGIN
  -- Determine feature type based on the table name
  CASE TG_TABLE_NAME
    WHEN 'canvas_items' THEN feature_type_val := 'canvas';
    WHEN 'grp_items' THEN feature_type_val := 'grp';
    WHEN 'market_personas' THEN feature_type_val := 'market';
    WHEN 'market_competitors' THEN feature_type_val := 'market';
    WHEN 'market_trends' THEN feature_type_val := 'market';
    WHEN 'product_features' THEN feature_type_val := 'product_design';
    WHEN 'validation_experiments' THEN feature_type_val := 'validation';
    WHEN 'validation_ab_tests' THEN feature_type_val := 'validation';
    WHEN 'financial_revenue_streams' THEN feature_type_val := 'financials';
    WHEN 'financial_cost_structure' THEN feature_type_val := 'financials';
    WHEN 'team_members' THEN feature_type_val := 'team';
    WHEN 'team_tasks' THEN feature_type_val := 'team';
    ELSE RETURN OLD;
  END CASE;
  
  -- Delete from search index
  DELETE FROM search_index
  WHERE feature_type = feature_type_val AND item_id = OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply activity logging triggers to key tables
-- Apply search index triggers to key tables
-- Note: For brevity, showing only a few examples but would need to be applied to all tables

-- Canvas Items
CREATE TRIGGER log_canvas_items_activity
  AFTER INSERT OR UPDATE OR DELETE ON canvas_items
  FOR EACH ROW
  EXECUTE PROCEDURE log_project_activity();

CREATE TRIGGER update_canvas_items_search_index
  AFTER INSERT OR UPDATE ON canvas_items
  FOR EACH ROW
  EXECUTE PROCEDURE create_search_index();

CREATE TRIGGER delete_canvas_items_search_index
  AFTER DELETE ON canvas_items
  FOR EACH ROW
  EXECUTE PROCEDURE delete_from_search_index();

-- Validation Experiments
CREATE TRIGGER log_validation_experiments_activity
  AFTER INSERT OR UPDATE OR DELETE ON validation_experiments
  FOR EACH ROW
  EXECUTE PROCEDURE log_project_activity();

CREATE TRIGGER update_validation_experiments_search_index
  AFTER INSERT OR UPDATE ON validation_experiments
  FOR EACH ROW
  EXECUTE PROCEDURE create_search_index();

CREATE TRIGGER delete_validation_experiments_search_index
  AFTER DELETE ON validation_experiments
  FOR EACH ROW
  EXECUTE PROCEDURE delete_from_search_index();

-- Financial Revenue Streams
CREATE TRIGGER log_financial_revenue_streams_activity
  AFTER INSERT OR UPDATE OR DELETE ON financial_revenue_streams
  FOR EACH ROW
  EXECUTE PROCEDURE log_project_activity();

CREATE TRIGGER update_financial_revenue_streams_search_index
  AFTER INSERT OR UPDATE ON financial_revenue_streams
  FOR EACH ROW
  EXECUTE PROCEDURE create_search_index();

CREATE TRIGGER delete_financial_revenue_streams_search_index
  AFTER DELETE ON financial_revenue_streams
  FOR EACH ROW
  EXECUTE PROCEDURE delete_from_search_index();

-- Team Members
CREATE TRIGGER log_team_members_activity
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE PROCEDURE log_project_activity();

CREATE TRIGGER update_team_members_search_index
  AFTER INSERT OR UPDATE ON team_members
  FOR EACH ROW
  EXECUTE PROCEDURE create_search_index();

CREATE TRIGGER delete_team_members_search_index
  AFTER DELETE ON team_members
  FOR EACH ROW
  EXECUTE PROCEDURE delete_from_search_index();

-- (Similar triggers would be created for all other feature tables)

-- Drop the helper function
DROP FUNCTION create_cross_feature_policies(text); 