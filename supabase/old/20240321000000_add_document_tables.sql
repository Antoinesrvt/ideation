CREATE TABLE project_members (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL, -- You can define a role for the member (e.g., 'admin', 'member')
  created_at timestamp with time zone DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE document_templates (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_type text NOT NULL,
  name text NOT NULL,
  description text,
  template_path text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  tags text[] DEFAULT array[]::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(module_type, version)
);

CREATE TABLE documents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  module_id uuid NOT NULL REFERENCES modules(id),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('pdf', 'docx', 'md')),
  storage_path text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  template_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tags text[] DEFAULT array[]::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
create index documents_project_id_idx on documents(project_id);
create index documents_module_id_idx on documents(module_id);
create index documents_status_idx on documents(status);
create index documents_version_idx on documents(version);

-- Create storage buckets
insert into storage.buckets (id, name, public) values ('documents', 'documents', true);
insert into storage.buckets (id, name, public) values ('templates', 'templates', false);



-- Create storage policies
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'documents' );

create policy "Auth Users Only"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id in ('documents', 'templates') );

-- Create RLS policies
alter table documents enable row level security;
alter table document_templates enable row level security;

create policy "Users can view their project documents"
  on documents for select
  to authenticated
  using (
    project_id in (
      select id from projects
      where id = documents.project_id
      and (
        created_by = auth.uid() 
        or id in (
          select project_id from project_members 
          where user_id = auth.uid()
        )
      )
    )
  );

create policy "Users can create documents for their projects"
  on documents for insert
  to authenticated
  with check (
    project_id in (
      select id from projects
      where id = documents.project_id
      and (
        created_by = auth.uid() 
        or id in (
          select project_id from project_members 
          where user_id = auth.uid()
        )
      )
    )
  );

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_documents 
BEFORE UPDATE ON documents
FOR EACH ROW 
EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER handle_updated_at_document_templates 
BEFORE UPDATE ON document_templates
FOR EACH ROW 
EXECUTE PROCEDURE handle_updated_at();