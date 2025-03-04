-- Migration to add AI Assistant tables

-- Create AI Assistant tables
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('ideation', 'market', 'product', 'business', 'user', 'content', 'technical', 'custom')),
  prompt_text text NOT NULL,
  is_favorite boolean DEFAULT false,
  is_system boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  context text,
  feature_context text CHECK (feature_context IN ('general', 'canvas', 'grp', 'market', 'product_design', 'validation', 'financials', 'team', 'documents')),
  pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversation_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  is_pinned boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_generated_content (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content_type text CHECK (content_type IN ('text', 'json', 'markdown', 'html', 'code')),
  content text NOT NULL,
  prompt_used text,
  feature_context text CHECK (feature_context IN ('general', 'canvas', 'grp', 'market', 'product_design', 'validation', 'financials', 'team', 'documents')),
  has_been_applied boolean DEFAULT false,
  tags text[] DEFAULT '{}',
  feedback jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  model_preference text DEFAULT 'default',
  temperature float DEFAULT 0.7,
  max_tokens integer DEFAULT 2000,
  persona text DEFAULT 'standard',
  custom_instructions text,
  preferred_output_format text DEFAULT 'markdown',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX ai_prompts_project_id_idx ON ai_prompts(project_id);
CREATE INDEX ai_prompts_tags_idx ON ai_prompts USING gin (tags);
CREATE INDEX ai_prompts_category_idx ON ai_prompts(category);

CREATE INDEX ai_conversations_project_id_idx ON ai_conversations(project_id);
CREATE INDEX ai_conversations_feature_context_idx ON ai_conversations(feature_context);
CREATE INDEX ai_conversations_pinned_idx ON ai_conversations(pinned) WHERE pinned = true;

CREATE INDEX ai_conversation_messages_conversation_id_idx ON ai_conversation_messages(conversation_id);
CREATE INDEX ai_conversation_messages_role_idx ON ai_conversation_messages(role);
CREATE INDEX ai_conversation_messages_is_pinned_idx ON ai_conversation_messages(is_pinned) WHERE is_pinned = true;

CREATE INDEX ai_generated_content_project_id_idx ON ai_generated_content(project_id);
CREATE INDEX ai_generated_content_feature_context_idx ON ai_generated_content(feature_context);
CREATE INDEX ai_generated_content_content_type_idx ON ai_generated_content(content_type);
CREATE INDEX ai_generated_content_tags_idx ON ai_generated_content USING gin (tags);

-- Enable RLS on the tables
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to create standard policies
CREATE OR REPLACE FUNCTION create_ai_assistant_policies(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('
    CREATE POLICY "Users can view own project''s %1$s"
      ON %1$s FOR SELECT
      USING (
        (
          EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = %1$s.project_id
            AND projects.owner_id = auth.uid()
          )
        ) OR (
          %1$s.created_by = auth.uid()
        )
      );
    
    CREATE POLICY "Users can insert own project''s %1$s"
      ON %1$s FOR INSERT
      WITH CHECK (
        (
          EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = %1$s.project_id
            AND projects.owner_id = auth.uid()
          )
        ) OR (
          %1$s.created_by = auth.uid()
        )
      );
    
    CREATE POLICY "Users can update own project''s %1$s"
      ON %1$s FOR UPDATE
      USING (
        (
          EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = %1$s.project_id
            AND projects.owner_id = auth.uid()
          )
        ) OR (
          %1$s.created_by = auth.uid()
        )
      );
    
    CREATE POLICY "Users can delete own project''s %1$s"
      ON %1$s FOR DELETE
      USING (
        (
          EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = %1$s.project_id
            AND projects.owner_id = auth.uid()
          )
        ) OR (
          %1$s.created_by = auth.uid()
        )
      );
  ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply policies to AI assistant tables
SELECT create_ai_assistant_policies('ai_prompts');
SELECT create_ai_assistant_policies('ai_conversations');
SELECT create_ai_assistant_policies('ai_generated_content');

-- Special policy for conversation messages based on conversation ownership
CREATE POLICY "Users can view conversation messages they have access to"
  ON ai_conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_conversation_messages.conversation_id
      AND (
        ai_conversations.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = ai_conversations.project_id
          AND projects.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can insert conversation messages they have access to"
  ON ai_conversation_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_conversation_messages.conversation_id
      AND (
        ai_conversations.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = ai_conversations.project_id
          AND projects.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update conversation messages they have access to"
  ON ai_conversation_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_conversation_messages.conversation_id
      AND (
        ai_conversations.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = ai_conversations.project_id
          AND projects.owner_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete conversation messages they have access to"
  ON ai_conversation_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM ai_conversations
      WHERE ai_conversations.id = ai_conversation_messages.conversation_id
      AND (
        ai_conversations.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM projects
          WHERE projects.id = ai_conversations.project_id
          AND projects.owner_id = auth.uid()
        )
      )
    )
  );

-- Special policy for AI settings (users can only see and edit their own settings)
CREATE POLICY "Users can only view their own AI settings"
  ON ai_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own AI settings"
  ON ai_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can only update their own AI settings"
  ON ai_settings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can only delete their own AI settings"
  ON ai_settings FOR DELETE
  USING (user_id = auth.uid());

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_conversations
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_conversation_messages
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_generated_content
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Function to create default system prompts
CREATE OR REPLACE FUNCTION create_default_system_prompts()
RETURNS void AS $$
DECLARE
  system_prompts jsonb[] := ARRAY[
    jsonb_build_object(
      'title', 'Business Model Canvas Assistant',
      'description', 'Helps you build a comprehensive business model canvas',
      'category', 'business',
      'prompt_text', 'You are a Business Model Canvas expert. Help me fill out my canvas with creative and strategic ideas. Focus on unique value propositions and innovative revenue streams.'
    ),
    jsonb_build_object(
      'title', 'Market Analysis Helper',
      'description', 'Helps analyze markets and identify opportunities',
      'category', 'market',
      'prompt_text', 'You are a Market Research specialist. Help me analyze my target market, identify key competitors, and find market gaps to exploit. Focus on actionable insights.'
    ),
    jsonb_build_object(
      'title', 'Product Feature Brainstormer',
      'description', 'Helps generate innovative product features',
      'category', 'product',
      'prompt_text', 'You are a Product Design expert. Help me brainstorm innovative features for my product that solve real user problems. Consider user experience, technical feasibility, and market differentiation.'
    ),
    jsonb_build_object(
      'title', 'Financial Projections Creator',
      'description', 'Helps create realistic financial projections',
      'category', 'business',
      'prompt_text', 'You are a Financial Modeling expert. Help me create realistic financial projections for my startup, focusing on revenue streams, cost structure, and break-even analysis.'
    ),
    jsonb_build_object(
      'title', 'Validation Experiment Designer',
      'description', 'Helps design experiments to validate assumptions',
      'category', 'ideation',
      'prompt_text', 'You are a Validation and Testing expert. Help me design experiments to validate my business assumptions with minimal resources. Focus on creating clear hypotheses and measurable outcomes.'
    ),
    jsonb_build_object(
      'title', 'User Persona Generator',
      'description', 'Helps create detailed user personas',
      'category', 'user',
      'prompt_text', 'You are a User Research expert. Help me create detailed and realistic user personas for my product, including demographics, goals, pain points, and behaviors.'
    ),
    jsonb_build_object(
      'title', 'Marketing Copy Writer',
      'description', 'Helps write compelling marketing copy',
      'category', 'content',
      'prompt_text', 'You are a Marketing Copywriter. Help me create compelling marketing copy for my product that resonates with my target audience and highlights my unique value proposition.'
    ),
    jsonb_build_object(
      'title', 'Technical Architecture Advisor',
      'description', 'Helps plan technical architecture',
      'category', 'technical',
      'prompt_text', 'You are a Technical Architect. Help me plan the technical implementation of my product, focusing on scalability, security, and maintainability. Suggest appropriate technologies and frameworks.'
    )
  ];
  prompt_data jsonb;
BEGIN
  FOREACH prompt_data IN ARRAY system_prompts
  LOOP
    INSERT INTO ai_prompts (
      title,
      description,
      category,
      prompt_text,
      is_system,
      tags,
      created_at
    )
    VALUES (
      prompt_data->>'title',
      prompt_data->>'description',
      prompt_data->>'category',
      prompt_data->>'prompt_text',
      true,
      ARRAY['system', prompt_data->>'category'],
      now()
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing AI interactions to new structure
CREATE OR REPLACE FUNCTION migrate_ai_interactions()
RETURNS void AS $$
DECLARE
  interaction_record RECORD;
  conversation_id uuid;
  created_by_id uuid;
BEGIN
  FOR interaction_record IN 
    SELECT * FROM ai_interactions
  LOOP
    -- Get the created_by user ID
    created_by_id := interaction_record.created_by;
    
    -- Create a conversation for this interaction
    INSERT INTO ai_conversations (
      project_id,
      title,
      feature_context,
      created_by,
      created_at
    )
    VALUES (
      interaction_record.project_id,
      COALESCE(
        CASE 
          WHEN interaction_record.metadata ? 'title' THEN interaction_record.metadata->>'title'
          ELSE NULL
        END,
        'Conversation from ' || to_char(interaction_record.created_at, 'YYYY-MM-DD HH:MI')
      ),
      CASE
        WHEN interaction_record.module_id IS NOT NULL THEN 
          CASE
            WHEN EXISTS (
              SELECT 1 FROM modules 
              WHERE id = interaction_record.module_id AND type = 'business-model'
            ) THEN 'canvas'
            WHEN EXISTS (
              SELECT 1 FROM modules 
              WHERE id = interaction_record.module_id AND type = 'vision-problem'
            ) THEN 'grp'
            WHEN EXISTS (
              SELECT 1 FROM modules 
              WHERE id = interaction_record.module_id AND type = 'market-analysis'
            ) THEN 'market'
            WHEN EXISTS (
              SELECT 1 FROM modules 
              WHERE id = interaction_record.module_id AND type = 'go-to-market'
            ) THEN 'product_design'
            ELSE 'general'
          END
        ELSE 'general'
      END,
      created_by_id,
      interaction_record.created_at
    )
    RETURNING id INTO conversation_id;
    
    -- Add the user prompt as a message
    INSERT INTO ai_conversation_messages (
      conversation_id,
      role,
      content,
      created_at
    )
    VALUES (
      conversation_id,
      'user',
      interaction_record.prompt,
      interaction_record.created_at
    );
    
    -- Add the assistant response as a message
    INSERT INTO ai_conversation_messages (
      conversation_id,
      role,
      content,
      metadata,
      created_at
    )
    VALUES (
      conversation_id,
      'assistant',
      CASE 
        WHEN jsonb_typeof(interaction_record.response) = 'string' THEN interaction_record.response#>>'{}' 
        WHEN interaction_record.response ? 'text' THEN interaction_record.response->>'text'
        WHEN interaction_record.response ? 'content' THEN interaction_record.response->>'content'
        ELSE jsonb_pretty(interaction_record.response)
      END,
      jsonb_build_object(
        'original_response', interaction_record.response,
        'has_been_applied', interaction_record.has_been_applied
      ),
      interaction_record.created_at + interval '1 second'
    );
    
    -- If it was applied content, add it to the generated content table
    IF interaction_record.has_been_applied THEN
      INSERT INTO ai_generated_content (
        project_id,
        title,
        content_type,
        content,
        prompt_used,
        feature_context,
        has_been_applied,
        created_by,
        created_at
      )
      VALUES (
        interaction_record.project_id,
        COALESCE(
          CASE 
            WHEN interaction_record.metadata ? 'title' THEN interaction_record.metadata->>'title'
            ELSE NULL
          END,
          'Generated content from ' || to_char(interaction_record.created_at, 'YYYY-MM-DD HH:MI')
        ),
        CASE
          WHEN interaction_record.response ? 'format' AND interaction_record.response->>'format' = 'markdown' THEN 'markdown'
          WHEN interaction_record.response ? 'format' AND interaction_record.response->>'format' = 'html' THEN 'html'
          WHEN interaction_record.response ? 'format' AND interaction_record.response->>'format' = 'json' THEN 'json'
          ELSE 'text'
        END,
        CASE 
          WHEN jsonb_typeof(interaction_record.response) = 'string' THEN interaction_record.response#>>'{}' 
          WHEN interaction_record.response ? 'text' THEN interaction_record.response->>'text'
          WHEN interaction_record.response ? 'content' THEN interaction_record.response->>'content'
          ELSE jsonb_pretty(interaction_record.response)
        END,
        interaction_record.prompt,
        CASE
          WHEN interaction_record.module_id IS NOT NULL THEN 
            CASE
              WHEN EXISTS (
                SELECT 1 FROM modules 
                WHERE id = interaction_record.module_id AND type = 'business-model'
              ) THEN 'canvas'
              WHEN EXISTS (
                SELECT 1 FROM modules 
                WHERE id = interaction_record.module_id AND type = 'vision-problem'
              ) THEN 'grp'
              WHEN EXISTS (
                SELECT 1 FROM modules 
                WHERE id = interaction_record.module_id AND type = 'market-analysis'
              ) THEN 'market'
              WHEN EXISTS (
                SELECT 1 FROM modules 
                WHERE id = interaction_record.module_id AND type = 'go-to-market'
              ) THEN 'product_design'
              ELSE 'general'
            END
          ELSE 'general'
        END,
        true,
        created_by_id,
        interaction_record.created_at
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Add default AI settings for existing users
CREATE OR REPLACE FUNCTION create_default_ai_settings()
RETURNS void AS $$
BEGIN
  INSERT INTO ai_settings (user_id, created_at)
  SELECT id, now() FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Run the setup functions
SELECT create_default_system_prompts();
SELECT migrate_ai_interactions();
SELECT create_default_ai_settings();

-- Drop the helper functions
DROP FUNCTION create_ai_assistant_policies(text);
DROP FUNCTION create_default_system_prompts();
DROP FUNCTION migrate_ai_interactions();
DROP FUNCTION create_default_ai_settings(); 