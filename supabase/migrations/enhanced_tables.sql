-- Create custom types
CREATE TYPE module_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE step_status AS ENUM ('not_started', 'in_progress', 'completed');
-- Modules table - Core module information
CREATE TABLE modules (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  type module_type NOT NULL,
  title text NOT NULL,
  status module_status DEFAULT 'draft',
  current_step_id uuid, -- References module_steps(id)
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

-- Module steps table - Instance of steps for each module
CREATE TABLE module_steps (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  step_type text NOT NULL, -- Matches the step types from frontend config
  order_index integer NOT NULL,
  status step_status DEFAULT 'not_started',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  completed_by uuid REFERENCES auth.users(id)
);

-- Step responses table - Tracks response history
CREATE TABLE step_responses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  step_id uuid REFERENCES module_steps(id) ON DELETE CASCADE,
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_latest boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- AI interactions table (keeping existing structure with minor improvements)
CREATE TABLE ai_interactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  step_id uuid REFERENCES module_steps(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('content', 'context', 'research')),
  prompt text NOT NULL,
  response jsonb NOT NULL,
  has_been_applied boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX module_steps_module_id_idx ON module_steps(module_id);
CREATE INDEX step_responses_step_id_idx ON step_responses(step_id);
CREATE INDEX ai_interactions_module_id_idx ON ai_interactions(module_id);
CREATE INDEX ai_interactions_step_id_idx ON ai_interactions(step_id);

-- Add RLS policies (example)
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- Add cleanup policy for historical data
CREATE POLICY "Cleanup old responses after X days"
  ON step_responses
  FOR DELETE
  USING (
    created_at < now() - interval '90 days'
    AND NOT is_latest
  );

CREATE POLICY "Cleanup old AI interactions after X days"
  ON ai_interactions
  FOR DELETE
  USING (
    created_at < now() - interval '90 days'
  );

  CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON modules
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON module_steps
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();