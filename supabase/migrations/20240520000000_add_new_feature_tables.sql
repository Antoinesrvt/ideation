-- Migration for new feature tables: Validation, Financial Projections, and Team Management

-- Drop existing project_members table if it exists
DROP TABLE IF EXISTS project_members;

-- Create validation tables
CREATE TABLE IF NOT EXISTS validation_experiments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  hypothesis text,
  status text CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  results text,
  learnings text,
  metrics jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS validation_ab_tests (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('planned', 'running', 'completed')),
  variant_a text NOT NULL,
  variant_b text NOT NULL,
  metric text NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  sample_size integer,
  conversion_a real,
  conversion_b real,
  confidence real,
  winner text CHECK (winner IN ('A', 'B', 'inconclusive', NULL)),
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS validation_user_feedback (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  source text NOT NULL,
  date timestamptz DEFAULT now(),
  type text CHECK (type IN ('feature-request', 'bug-report', 'testimonial', 'criticism', 'suggestion')),
  content text NOT NULL,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  impact text CHECK (impact IN ('low', 'medium', 'high')),
  status text CHECK (status IN ('new', 'in-review', 'accepted', 'rejected', 'implemented')),
  response text,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS validation_hypotheses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  statement text NOT NULL,
  assumptions text[] DEFAULT '{}',
  validation_method text,
  status text CHECK (status IN ('unvalidated', 'in-progress', 'validated', 'invalidated')),
  confidence real,
  evidence text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create financial projections tables
CREATE TABLE IF NOT EXISTS financial_revenue_streams (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('one-time', 'recurring', 'usage-based', 'licensing', 'advertising', 'other')),
  pricing_model text,
  unit_price real,
  volume integer,
  frequency text,
  growth_rate real,
  projections jsonb DEFAULT '[]'::jsonb,
  assumptions text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_cost_structure (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('fixed', 'variable', 'semi-variable')),
  category text CHECK (category IN ('development', 'sales', 'marketing', 'operations', 'administrative', 'other')),
  amount real,
  frequency text,
  growth_rate real,
  projections jsonb DEFAULT '[]'::jsonb,
  assumptions text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_pricing_strategies (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  strategy_type text CHECK (strategy_type IN ('cost-plus', 'value-based', 'competitive', 'penetration', 'skimming', 'freemium', 'subscription')),
  target_price_range jsonb DEFAULT '{"min": 0, "max": 0}'::jsonb,
  considerations text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS financial_projections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scenario text CHECK (scenario IN ('best-case', 'most-likely', 'worst-case')),
  timeframe text CHECK (timeframe IN ('monthly', 'quarterly', 'yearly')),
  start_date timestamptz,
  data jsonb NOT NULL,
  break_even jsonb DEFAULT '{"units": 0, "revenue": 0, "months": 0}'::jsonb,
  assumptions text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team management tables
CREATE TABLE IF NOT EXISTS team_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  expertise text[] DEFAULT '{}',
  responsibilities text[] DEFAULT '{}',
  availability text,
  contact_info jsonb DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users(id),
  status text CHECK (status IN ('active', 'inactive')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_tasks (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  team_member_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('not-started', 'in-progress', 'on-hold', 'completed')),
  priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date timestamptz,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_responsibility_matrix (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  area text NOT NULL,
  description text,
  raci_matrix jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX validation_experiments_project_id_idx ON validation_experiments(project_id);
CREATE INDEX validation_ab_tests_project_id_idx ON validation_ab_tests(project_id);
CREATE INDEX validation_user_feedback_project_id_idx ON validation_user_feedback(project_id);
CREATE INDEX validation_hypotheses_project_id_idx ON validation_hypotheses(project_id);

CREATE INDEX financial_revenue_streams_project_id_idx ON financial_revenue_streams(project_id);
CREATE INDEX financial_cost_structure_project_id_idx ON financial_cost_structure(project_id);
CREATE INDEX financial_pricing_strategies_project_id_idx ON financial_pricing_strategies(project_id);
CREATE INDEX financial_projections_project_id_idx ON financial_projections(project_id);

CREATE INDEX team_members_project_id_idx ON team_members(project_id);
CREATE INDEX team_tasks_project_id_idx ON team_tasks(project_id);
CREATE INDEX team_tasks_team_member_id_idx ON team_tasks(team_member_id);
CREATE INDEX team_responsibility_matrix_project_id_idx ON team_responsibility_matrix(project_id);

-- Enable RLS on new tables
ALTER TABLE validation_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_hypotheses ENABLE ROW LEVEL SECURITY;

ALTER TABLE financial_revenue_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_cost_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_pricing_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_projections ENABLE ROW LEVEL SECURITY;

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_responsibility_matrix ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
-- Validation experiments
CREATE POLICY "Users can view own project's validation experiments"
  ON validation_experiments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = validation_experiments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project's validation experiments"
  ON validation_experiments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = validation_experiments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project's validation experiments"
  ON validation_experiments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = validation_experiments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project's validation experiments"
  ON validation_experiments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = validation_experiments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- Similar policies for all other tables...
-- For brevity, let's define a function to create standard policies
CREATE OR REPLACE FUNCTION create_project_based_policies(table_name text) RETURNS void AS $$
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

-- Apply policies to all tables
SELECT create_project_based_policies('validation_ab_tests');
SELECT create_project_based_policies('validation_user_feedback');
SELECT create_project_based_policies('validation_hypotheses');
SELECT create_project_based_policies('financial_revenue_streams');
SELECT create_project_based_policies('financial_cost_structure');
SELECT create_project_based_policies('financial_pricing_strategies');
SELECT create_project_based_policies('financial_projections');
SELECT create_project_based_policies('team_members');
SELECT create_project_based_policies('team_tasks');
SELECT create_project_based_policies('team_responsibility_matrix');

-- Add trigger to auto-update updated_at field
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON validation_experiments
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON validation_ab_tests
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON validation_user_feedback
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON validation_hypotheses
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON financial_revenue_streams
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON financial_cost_structure
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON financial_pricing_strategies
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON financial_projections
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON team_tasks
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON team_responsibility_matrix
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Drop the helper function as we don't need it anymore
DROP FUNCTION create_project_based_policies(text); 