-- Migration to add validation relationships, insights, decisions, and milestones tables
-- These tables will enhance the validation framework with interconnections and progress tracking

-- Add validation_relationships table to track connections between different validation entities
CREATE TABLE IF NOT EXISTS validation_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('hypothesis', 'experiment', 'ab_test', 'user_feedback')),
  source_id UUID NOT NULL, 
  target_type TEXT NOT NULL CHECK (target_type IN ('hypothesis', 'experiment', 'ab_test', 'user_feedback')),
  target_id UUID NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('tests', 'validates', 'invalidates', 'supports')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Prevent duplicate relationships
  CONSTRAINT validation_relationships_unique UNIQUE (source_type, source_id, target_type, target_id, relationship_type),
  
  -- Constraints to ensure we're referring to valid entities (source)
  CONSTRAINT check_source_hypothesis CHECK (
    (source_type = 'hypothesis' AND EXISTS (SELECT 1 FROM validation_hypotheses WHERE id = source_id))
    OR source_type != 'hypothesis'
  ),
  CONSTRAINT check_source_experiment CHECK (
    (source_type = 'experiment' AND EXISTS (SELECT 1 FROM validation_experiments WHERE id = source_id))
    OR source_type != 'experiment'
  ),
  CONSTRAINT check_source_ab_test CHECK (
    (source_type = 'ab_test' AND EXISTS (SELECT 1 FROM validation_ab_tests WHERE id = source_id))
    OR source_type != 'ab_test'
  ),
  CONSTRAINT check_source_user_feedback CHECK (
    (source_type = 'user_feedback' AND EXISTS (SELECT 1 FROM validation_user_feedback WHERE id = source_id))
    OR source_type != 'user_feedback'
  ),
  
  -- Constraints to ensure we're referring to valid entities (target)
  CONSTRAINT check_target_hypothesis CHECK (
    (target_type = 'hypothesis' AND EXISTS (SELECT 1 FROM validation_hypotheses WHERE id = target_id))
    OR target_type != 'hypothesis'
  ),
  CONSTRAINT check_target_experiment CHECK (
    (target_type = 'experiment' AND EXISTS (SELECT 1 FROM validation_experiments WHERE id = target_id))
    OR target_type != 'experiment'
  ),
  CONSTRAINT check_target_ab_test CHECK (
    (target_type = 'ab_test' AND EXISTS (SELECT 1 FROM validation_ab_tests WHERE id = target_id))
    OR target_type != 'ab_test'
  ),
  CONSTRAINT check_target_user_feedback CHECK (
    (target_type = 'user_feedback' AND EXISTS (SELECT 1 FROM validation_user_feedback WHERE id = target_id))
    OR target_type != 'user_feedback'
  )
);

-- Add necessary indexes for performance
CREATE INDEX IF NOT EXISTS validation_relationships_source_idx ON validation_relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS validation_relationships_target_idx ON validation_relationships(target_type, target_id);
CREATE INDEX IF NOT EXISTS validation_relationships_project_id_idx ON validation_relationships(project_id);

-- Add validation_insights table to capture key learnings from validation activities
CREATE TABLE IF NOT EXISTS validation_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('hypothesis', 'experiment', 'ab_test', 'user_feedback')),
  source_id UUID NOT NULL,
  actionability TEXT NOT NULL CHECK (actionability IN ('high', 'medium', 'low')),
  business_impact TEXT NOT NULL CHECK (business_impact IN ('high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('new', 'reviewed', 'implemented')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Constraints to ensure we're referring to valid entities
  CONSTRAINT check_insight_source_hypothesis CHECK (
    (source_type = 'hypothesis' AND EXISTS (SELECT 1 FROM validation_hypotheses WHERE id = source_id))
    OR source_type != 'hypothesis'
  ),
  CONSTRAINT check_insight_source_experiment CHECK (
    (source_type = 'experiment' AND EXISTS (SELECT 1 FROM validation_experiments WHERE id = source_id))
    OR source_type != 'experiment'
  ),
  CONSTRAINT check_insight_source_ab_test CHECK (
    (source_type = 'ab_test' AND EXISTS (SELECT 1 FROM validation_ab_tests WHERE id = source_id))
    OR source_type != 'ab_test'
  ),
  CONSTRAINT check_insight_source_user_feedback CHECK (
    (source_type = 'user_feedback' AND EXISTS (SELECT 1 FROM validation_user_feedback WHERE id = source_id))
    OR source_type != 'user_feedback'
  )
);

-- Add indexes for validation_insights
CREATE INDEX IF NOT EXISTS validation_insights_source_idx ON validation_insights(source_type, source_id);
CREATE INDEX IF NOT EXISTS validation_insights_project_id_idx ON validation_insights(project_id);
CREATE INDEX IF NOT EXISTS validation_insights_status_idx ON validation_insights(status);

-- Create join table for insights and decisions (many-to-many)
CREATE TABLE IF NOT EXISTS validation_insight_decision (
  insight_id UUID NOT NULL REFERENCES validation_insights(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL,
  PRIMARY KEY (insight_id, decision_id)
);

-- Add validation_decisions table to record business decisions based on validation
CREATE TABLE IF NOT EXISTS validation_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  decision_type TEXT NOT NULL CHECK (decision_type IN ('pivot', 'persist', 'stop')),
  affected_areas TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);

-- Add constraint to validation_insight_decision for the decision_id foreign key
ALTER TABLE validation_insight_decision
  ADD CONSTRAINT validation_insight_decision_decision_id_fkey
  FOREIGN KEY (decision_id) REFERENCES validation_decisions(id) ON DELETE CASCADE;

-- Add index for validation_decisions
CREATE INDEX IF NOT EXISTS validation_decisions_project_id_idx ON validation_decisions(project_id);
CREATE INDEX IF NOT EXISTS validation_decisions_type_idx ON validation_decisions(decision_type);

-- Add validation_milestones table to track validation progress
CREATE TABLE IF NOT EXISTS validation_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  completion_criteria TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
  dependencies UUID[] DEFAULT '{}'::UUID[], -- Array of other milestone IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);

-- Add index for validation_milestones
CREATE INDEX IF NOT EXISTS validation_milestones_project_id_idx ON validation_milestones(project_id);
CREATE INDEX IF NOT EXISTS validation_milestones_status_idx ON validation_milestones(status);

-- Add RLS policies
ALTER TABLE validation_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_insight_decision ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_milestones ENABLE ROW LEVEL SECURITY;

-- Create policies for validation_relationships
CREATE POLICY "Users can view their project validation relationships"
  ON validation_relationships
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert into their project validation relationships"
  ON validation_relationships
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their project validation relationships"
  ON validation_relationships
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their project validation relationships"
  ON validation_relationships
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Create similar policies for other tables
CREATE POLICY "Users can view their project validation insights"
  ON validation_insights
  FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert into their project validation insights"
  ON validation_insights
  FOR INSERT
  WITH CHECK (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their project validation insights"
  ON validation_insights
  FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their project validation insights"
  ON validation_insights
  FOR DELETE
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Add triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_validation_relationships_updated_at
  BEFORE UPDATE ON validation_relationships
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_validation_insights_updated_at
  BEFORE UPDATE ON validation_insights
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_validation_decisions_updated_at
  BEFORE UPDATE ON validation_decisions
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_validation_milestones_updated_at
  BEFORE UPDATE ON validation_milestones
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column(); 