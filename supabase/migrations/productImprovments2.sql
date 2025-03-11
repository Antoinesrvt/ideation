-- Migration file: 20240630000000_product_development_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create product_problems table (separate from journey pain points)
CREATE TABLE IF NOT EXISTS product_problems (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('discovered', 'validated', 'critical')),
  significance integer CHECK (significance BETWEEN 0 AND 100),
  customer_segments text[] DEFAULT '{}',
  evidence_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a product_solutions table
CREATE TABLE IF NOT EXISTS product_solutions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  problem_id uuid REFERENCES product_problems(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  effectiveness integer CHECK (effectiveness BETWEEN 0 AND 100),
  feasibility integer CHECK (feasibility BETWEEN 0 AND 100),
  status text CHECK (status IN ('proposed', 'validated', 'invalidated', 'implemented')),
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add fields to product_features to link to solutions and problems
ALTER TABLE product_features
  ADD COLUMN IF NOT EXISTS solution_id uuid REFERENCES product_solutions(id),
  ADD COLUMN IF NOT EXISTS problem_id uuid REFERENCES product_problems(id),
  ADD COLUMN IF NOT EXISTS value_score integer CHECK (value_score BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS is_mvp boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add fields to validation_hypotheses to link to product entities
ALTER TABLE validation_hypotheses 
  ADD COLUMN IF NOT EXISTS entity_type text CHECK (entity_type IN ('problem', 'solution', 'feature', 'journey_pain_point')),
  ADD COLUMN IF NOT EXISTS entity_id uuid;

-- Add fields to validation_experiments to link to product entities
ALTER TABLE validation_experiments
  ADD COLUMN IF NOT EXISTS solution_id uuid REFERENCES product_solutions(id),
  ADD COLUMN IF NOT EXISTS problem_id uuid REFERENCES product_problems(id),
  ADD COLUMN IF NOT EXISTS feature_id uuid REFERENCES product_features(id);

-- Create a table for evidence
CREATE TABLE IF NOT EXISTS product_evidence (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  source text,
  type text CHECK (type IN ('interview', 'survey', 'research', 'observation', 'test')),
  status text CHECK (status IN ('unverified', 'partial', 'verified')),
  feedback_id uuid REFERENCES validation_user_feedback(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a linking table for evidence to any entity
CREATE TABLE IF NOT EXISTS product_evidence_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  evidence_id uuid REFERENCES product_evidence(id) ON DELETE CASCADE,
  entity_type text CHECK (entity_type IN ('problem', 'solution', 'feature', 'journey_pain_point')),
  entity_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create a table for MVP management
CREATE TABLE IF NOT EXISTS product_mvps (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  version text,
  status text CHECK (status IN ('planning', 'in_progress', 'completed')),
  success_criteria jsonb DEFAULT '[]'::jsonb,
  timeline jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create a junction table for MVP features
CREATE TABLE IF NOT EXISTS product_mvp_features (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  mvp_id uuid REFERENCES product_mvps(id) ON DELETE CASCADE,
  feature_id uuid REFERENCES product_features(id) ON DELETE CASCADE,
  order_index integer DEFAULT 0,
  UNIQUE (mvp_id, feature_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS product_problems_project_id_idx ON product_problems(project_id);
CREATE INDEX IF NOT EXISTS product_problems_status_idx ON product_problems(status);
CREATE INDEX IF NOT EXISTS product_solutions_project_id_idx ON product_solutions(project_id);
CREATE INDEX IF NOT EXISTS product_solutions_problem_id_idx ON product_solutions(problem_id);
CREATE INDEX IF NOT EXISTS product_features_solution_id_idx ON product_features(solution_id);
CREATE INDEX IF NOT EXISTS product_features_problem_id_idx ON product_features(problem_id);
CREATE INDEX IF NOT EXISTS validation_hypotheses_entity_id_idx ON validation_hypotheses(entity_id);
CREATE INDEX IF NOT EXISTS validation_hypotheses_entity_type_idx ON validation_hypotheses(entity_type);
CREATE INDEX IF NOT EXISTS validation_experiments_solution_id_idx ON validation_experiments(solution_id);
CREATE INDEX IF NOT EXISTS validation_experiments_problem_id_idx ON validation_experiments(problem_id);
CREATE INDEX IF NOT EXISTS validation_experiments_feature_id_idx ON validation_experiments(feature_id);
CREATE INDEX IF NOT EXISTS product_evidence_project_id_idx ON product_evidence(project_id);
CREATE INDEX IF NOT EXISTS product_evidence_links_evidence_id_idx ON product_evidence_links(evidence_id);
CREATE INDEX IF NOT EXISTS product_evidence_links_entity_id_idx ON product_evidence_links(entity_id);
CREATE INDEX IF NOT EXISTS product_evidence_links_entity_type_idx ON product_evidence_links(entity_type);
CREATE INDEX IF NOT EXISTS product_mvps_project_id_idx ON product_mvps(project_id);
CREATE INDEX IF NOT EXISTS product_mvp_features_mvp_id_idx ON product_mvp_features(mvp_id);
CREATE INDEX IF NOT EXISTS product_mvp_features_feature_id_idx ON product_mvp_features(feature_id);

-- Enable Row Level Security for new tables
ALTER TABLE product_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_mvp_features ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (abbreviated)
CREATE POLICY select_product_problems ON product_problems FOR SELECT USING (
  project_id IN (SELECT id FROM projects WHERE created_by = auth.uid() OR id IN 
    (SELECT project_id FROM project_members WHERE user_id = auth.uid()))
);

-- Similar policies would be created for all other tables