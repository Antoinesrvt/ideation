-- Update the modules table metadata structure
ALTER TABLE public.modules
DROP CONSTRAINT IF EXISTS valid_metadata;

-- Add constraint to ensure metadata follows the new structure
ALTER TABLE public.modules
ADD CONSTRAINT valid_metadata CHECK (
  jsonb_typeof(metadata->'responses') = 'object' AND
  (
    metadata->'responses' = '{}'::jsonb OR
    (
      SELECT bool_and(
        jsonb_typeof(value->'content') = 'string' AND
        jsonb_typeof(value->'lastUpdated') = 'string' AND
        (value->>'aiSuggestion' IS NULL OR jsonb_typeof(value->'aiSuggestion') = 'string')
      )
      FROM jsonb_each(metadata->'responses')
    )
  ) AND
  (metadata->>'currentStepId' IS NULL OR jsonb_typeof(metadata->'currentStepId') = 'string') AND
  jsonb_typeof(metadata->'completedStepIds') = 'array' AND
  jsonb_typeof(metadata->>'lastUpdated') = 'string'
);

-- Function to migrate existing metadata to new structure
CREATE OR REPLACE FUNCTION migrate_module_metadata()
RETURNS void AS $$
DECLARE
  module_record RECORD;
BEGIN
  FOR module_record IN SELECT id, metadata FROM public.modules
  LOOP
    -- Convert existing metadata to new structure
    UPDATE public.modules
    SET metadata = jsonb_build_object(
      'responses', COALESCE(
        (
          SELECT jsonb_object_agg(
            key,
            jsonb_build_object(
              'content', value->>'content',
              'lastUpdated', COALESCE(value->>'lastUpdated', now()::text),
              'aiSuggestion', value->>'aiSuggestion'
            )
          )
          FROM jsonb_each(module_record.metadata->'responses')
        ),
        '{}'::jsonb
      ),
      'currentStepId', COALESCE(module_record.metadata->>'currentStep', NULL),
      'completedStepIds', COALESCE(
        (
          SELECT jsonb_agg(step->>'id')
          FROM jsonb_array_elements(module_record.metadata->'steps') step
          WHERE (step->>'completed')::boolean = true
        ),
        '[]'::jsonb
      ),
      'lastUpdated', COALESCE(module_record.metadata->>'lastUpdated', now()::text)
    )
    WHERE id = module_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 