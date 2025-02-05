-- Create module_responses table
CREATE TABLE IF NOT EXISTS module_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    content TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, step_id)
);

-- Add new columns to modules table
ALTER TABLE modules
ADD COLUMN IF NOT EXISTS current_step_id TEXT,
ADD COLUMN IF NOT EXISTS completed_step_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Migrate existing data from metadata
DO $$
DECLARE
    module_record RECORD;
    response_record RECORD;
BEGIN
    FOR module_record IN SELECT id, metadata FROM modules WHERE metadata IS NOT NULL LOOP
        -- Update module fields from metadata
        UPDATE modules
        SET 
            current_step_id = (module_record.metadata->>'currentStepId')::TEXT,
            completed_step_ids = ARRAY(
                SELECT jsonb_array_elements_text(
                    CASE 
                        WHEN module_record.metadata->'completedStepIds' IS NULL THEN '[]'::jsonb
                        ELSE module_record.metadata->'completedStepIds' 
                    END
                )
            ),
            last_updated = COALESCE(
                (module_record.metadata->>'lastUpdated')::TIMESTAMP WITH TIME ZONE,
                NOW()
            )
        WHERE id = module_record.id;

        -- Insert responses
        FOR response_record IN 
            SELECT key as step_id, value->>'content' as content, value->>'lastUpdated' as last_updated
            FROM jsonb_each(COALESCE(module_record.metadata->'responses', '{}'::jsonb))
        LOOP
            INSERT INTO module_responses (module_id, step_id, content, last_updated)
            VALUES (
                module_record.id,
                response_record.step_id,
                response_record.content,
                COALESCE(
                    response_record.last_updated::TIMESTAMP WITH TIME ZONE,
                    NOW()
                )
            )
            ON CONFLICT (module_id, step_id) 
            DO UPDATE SET 
                content = EXCLUDED.content,
                last_updated = EXCLUDED.last_updated;
        END LOOP;
    END LOOP;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_responses_module_id ON module_responses(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_current_step ON modules(current_step_id);

-- Add RLS policies for module_responses
ALTER TABLE module_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own module responses"
    ON module_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN projects p ON m.project_id = p.id
            WHERE module_responses.module_id = m.id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own module responses"
    ON module_responses FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN projects p ON m.project_id = p.id
            WHERE module_responses.module_id = m.id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own module responses"
    ON module_responses FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN projects p ON m.project_id = p.id
            WHERE module_responses.module_id = m.id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own module responses"
    ON module_responses FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM modules m
            JOIN projects p ON m.project_id = p.id
            WHERE module_responses.module_id = m.id
            AND p.owner_id = auth.uid()
        )
    ); 