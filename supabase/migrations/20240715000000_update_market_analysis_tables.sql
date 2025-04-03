-- Update market_personas table
ALTER TABLE market_personas 
ADD COLUMN IF NOT EXISTS persona_segments TEXT[];
COMMENT ON COLUMN market_personas.persona_segments IS 'Market segments this persona belongs to';

ALTER TABLE market_personas 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
COMMENT ON COLUMN market_personas.avatar_url IS 'URL to the avatar image for this persona';

ALTER TABLE market_personas 
ADD COLUMN IF NOT EXISTS empathy_map JSONB;
COMMENT ON COLUMN market_personas.empathy_map IS 'Empathy map data for this persona (thinks, sees, hears, feels)';

ALTER TABLE market_personas 
ADD COLUMN IF NOT EXISTS influence_score SMALLINT;
COMMENT ON COLUMN market_personas.influence_score IS 'Score representing how influential this persona is in the decision-making process (1-10)';

ALTER TABLE market_personas 
ADD COLUMN IF NOT EXISTS priority TEXT;
COMMENT ON COLUMN market_personas.priority IS 'Priority level of this persona (primary, secondary, tertiary)';

-- Update market_interviews table
ALTER TABLE market_interviews 
ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES market_personas(id) ON DELETE SET NULL;
COMMENT ON COLUMN market_interviews.persona_id IS 'Reference to associated persona';

CREATE INDEX IF NOT EXISTS market_interviews_persona_id_idx ON market_interviews(persona_id);
COMMENT ON INDEX market_interviews_persona_id_idx IS 'For faster lookups of interviews by persona';

ALTER TABLE market_interviews 
ADD COLUMN IF NOT EXISTS sentiment TEXT;
COMMENT ON COLUMN market_interviews.sentiment IS 'Overall sentiment of the interview (positive, neutral, negative)';

ALTER TABLE market_interviews 
ADD COLUMN IF NOT EXISTS tags TEXT[];
COMMENT ON COLUMN market_interviews.tags IS 'Categorization tags for this interview';

ALTER TABLE market_interviews 
ADD COLUMN IF NOT EXISTS interview_guide_url TEXT;
COMMENT ON COLUMN market_interviews.interview_guide_url IS 'URL to the interview guide document';

ALTER TABLE market_interviews 
ADD COLUMN IF NOT EXISTS recording_url TEXT;
COMMENT ON COLUMN market_interviews.recording_url IS 'URL to the interview recording'; 