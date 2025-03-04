-- Migration to enhance existing document tables

-- Add additional fields and indexes to the documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS visibility text CHECK (visibility IN ('public', 'private', 'team')) DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS document_data jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS content_preview text,
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS related_features jsonb DEFAULT '[]'::jsonb;


ALTER TABLE documents ENABLE ROW LEVEL SECURITY;


-- Create index for document tags for faster search
CREATE INDEX IF NOT EXISTS documents_tags_idx ON documents USING gin (tags);

-- Create index for document metadata for JSON search
CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING gin (metadata jsonb_path_ops);

-- Create index for document visibility
CREATE INDEX IF NOT EXISTS documents_visibility_idx ON documents(visibility);

-- Create a function to update last_viewed_at timestamp
CREATE OR REPLACE FUNCTION update_document_last_viewed()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_viewed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update last_viewed_at when a document is accessed
CREATE TRIGGER update_document_last_viewed_trigger
  BEFORE UPDATE ON documents
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE PROCEDURE update_document_last_viewed();

-- Create a new table for document collaborators
CREATE TABLE IF NOT EXISTS document_collaborators (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permission text CHECK (permission IN ('view', 'edit', 'comment')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (document_id, user_id)
);

-- Add indexes for document collaborators
CREATE INDEX IF NOT EXISTS document_collaborators_document_id_idx ON document_collaborators(document_id);
CREATE INDEX IF NOT EXISTS document_collaborators_user_id_idx ON document_collaborators(user_id);

-- Enable RLS on the document_collaborators table
ALTER TABLE document_collaborators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document_collaborators
CREATE POLICY "Users can view their document collaborations"
  ON document_collaborators FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_collaborators.document_id
      AND documents.created_by = auth.uid()
    )
  );

CREATE POLICY "Document owners can manage collaborators"
  ON document_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_collaborators.document_id
      AND documents.created_by = auth.uid()
    )
  );

-- Add trigger for auto-updating updated_at field
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON document_collaborators
  FOR EACH ROW
  EXECUTE PROCEDURE trigger_set_timestamp();

-- Create a function to create document notifications
CREATE OR REPLACE FUNCTION create_document_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Add notification logic here if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for document notifications on new collaborator
CREATE TRIGGER document_collaborator_notification
  AFTER INSERT ON document_collaborators
  FOR EACH ROW
  EXECUTE PROCEDURE create_document_notification();


// MAY HAVE ERRORS HERE:
-- Update document policies to include collaborators
CREATE OR REPLACE POLICY "Users can view documents they created or are collaborators on"
  ON documents FOR SELECT
  USING (
    documents.created_by = auth.uid() OR
    documents.visibility = 'public' OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_collaborators.document_id = documents.id
      AND document_collaborators.user_id = auth.uid()
    )
  );

CREATE OR REPLACE POLICY "Users can update documents they created or are editors on"
  ON documents FOR UPDATE
  USING (
    documents.created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_collaborators
      WHERE document_collaborators.document_id = documents.id
      AND document_collaborators.user_id = auth.uid()
      AND document_collaborators.permission = 'edit'
    )
  );

-- Add an audit log for document operations
CREATE TABLE IF NOT EXISTS document_audit_log (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add index for document audit log
CREATE INDEX IF NOT EXISTS document_audit_log_document_id_idx ON document_audit_log(document_id);
CREATE INDEX IF NOT EXISTS document_audit_log_user_id_idx ON document_audit_log(user_id);
CREATE INDEX IF NOT EXISTS document_audit_log_created_at_idx ON document_audit_log(created_at);

-- Enable RLS on document audit log
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for document audit log
CREATE POLICY "Document owners can view audit logs"
  ON document_audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_audit_log.document_id
      AND documents.created_by = auth.uid()
    )
  );

-- Function to add audit log entries
CREATE OR REPLACE FUNCTION add_document_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO document_audit_log (document_id, user_id, action, details)
  VALUES (
    NEW.id, 
    auth.uid(), 
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
      ELSE TG_OP
    END,
    CASE
      WHEN TG_OP = 'INSERT' THEN jsonb_build_object('name', NEW.name, 'type', NEW.type)
      WHEN TG_OP = 'UPDATE' THEN 
        jsonb_build_object(
          'old', jsonb_build_object('name', OLD.name, 'type', OLD.type, 'status', OLD.status),
          'new', jsonb_build_object('name', NEW.name, 'type', NEW.type, 'status', NEW.status)
        )
      WHEN TG_OP = 'DELETE' THEN jsonb_build_object('name', OLD.name, 'type', OLD.type)
      ELSE '{}'::jsonb
    END
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for document audit logging
CREATE TRIGGER document_audit_insert
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE PROCEDURE add_document_audit_log();

CREATE TRIGGER document_audit_update
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE PROCEDURE add_document_audit_log();

CREATE TRIGGER document_audit_delete
  AFTER DELETE ON documents
  FOR EACH ROW
  EXECUTE PROCEDURE add_document_audit_log(); 