-- Migration file: 20240630000000_streamlined_product_development_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Product Problems table (combines problems and pain points)
CREATE TABLE IF NOT EXISTS product_problems (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  problem_type text CHECK (problem_type IN ('pain_point', 'discovered', 'validated', 'critical')),
  significance integer CHECK (significance BETWEEN 0 AND 100),
  customer_segments text[] DEFAULT '{}',
  related_feedback_ids uuid[] DEFAULT '{}', -- Array of validation_user_feedback IDs
  metadata jsonb DEFAULT '{}'::jsonb, -- For flexible additional attributes
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add type field to validation_hypotheses
ALTER TABLE validation_hypotheses 
  ADD COLUMN IF NOT EXISTS entity_type text CHECK (entity_type IN ('problem', 'solution', 'feature', 'other')),
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS success_criteria jsonb DEFAULT '{}'::jsonb;

-- Product Solutions table (simplified with direct connections)
CREATE TABLE IF NOT EXISTS product_solutions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES product_problems(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  effectiveness integer CHECK (effectiveness BETWEEN 0 AND 100),
  feasibility integer CHECK (feasibility BETWEEN 0 AND 100),
  hypothesis_ids uuid[] DEFAULT '{}', -- Array of validation_hypotheses IDs
  experiment_ids uuid[] DEFAULT '{}', -- Array of validation_experiments IDs
  status text CHECK (status IN ('proposed', 'validated', 'invalidated', 'implemented')),
  metadata jsonb DEFAULT '{}'::jsonb, -- For flexible additional attributes
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modify product_features to link back to solutions
ALTER TABLE product_features
  ADD COLUMN IF NOT EXISTS solution_id uuid REFERENCES product_solutions(id),
  ADD COLUMN IF NOT EXISTS problem_id uuid REFERENCES product_problems(id),
  ADD COLUMN IF NOT EXISTS importance_score integer CHECK (importance_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS effort_score integer CHECK (effort_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Create MVPs table for MVP management
CREATE TABLE IF NOT EXISTS product_mvps (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  feature_ids uuid[] DEFAULT '{}', -- Array of selected feature IDs
  success_criteria jsonb DEFAULT '[]'::jsonb, -- Array of success criteria objects
  timeline jsonb DEFAULT '{}'::jsonb, -- Timeline data
  status text CHECK (status IN ('planning', 'in_progress', 'completed')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS product_problems_project_id_idx ON product_problems(project_id);
CREATE INDEX IF NOT EXISTS product_problems_problem_type_idx ON product_problems(problem_type);
CREATE INDEX IF NOT EXISTS validation_hypotheses_entity_id_idx ON validation_hypotheses(entity_id);
CREATE INDEX IF NOT EXISTS validation_hypotheses_entity_type_idx ON validation_hypotheses(entity_type);
CREATE INDEX IF NOT EXISTS product_solutions_project_id_idx ON product_solutions(project_id);
CREATE INDEX IF NOT EXISTS product_solutions_problem_id_idx ON product_solutions(problem_id);
CREATE INDEX IF NOT EXISTS product_features_solution_id_idx ON product_features(solution_id);
CREATE INDEX IF NOT EXISTS product_features_problem_id_idx ON product_features(problem_id);
CREATE INDEX IF NOT EXISTS product_mvps_project_id_idx ON product_mvps(project_id);

-- GIN indexes for array and jsonb fields for efficient searching
CREATE INDEX IF NOT EXISTS product_problems_related_feedback_ids_idx ON product_problems USING GIN (related_feedback_ids);
CREATE INDEX IF NOT EXISTS product_solutions_hypothesis_ids_idx ON product_solutions USING GIN (hypothesis_ids);
CREATE INDEX IF NOT EXISTS product_solutions_experiment_ids_idx ON product_solutions USING GIN (experiment_ids);
CREATE INDEX IF NOT EXISTS product_mvps_feature_ids_idx ON product_mvps USING GIN (feature_ids);

-- Create update triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_problems_timestamp
BEFORE UPDATE ON product_problems
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_solutions_timestamp
BEFORE UPDATE ON product_solutions
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_product_mvps_timestamp
BEFORE UPDATE ON product_mvps
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Enable Row Level Security
ALTER TABLE product_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mvps ENABLE ROW LEVEL SECURITY;

-- Create policies (abbreviated for clarity)
CREATE POLICY select_product_problems ON product_problems FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid() OR id IN 
    (SELECT project_id FROM project_members WHERE user_id = auth.uid()))
);

-- Similar policies would be created for all other tables