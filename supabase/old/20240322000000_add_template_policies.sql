-- Allow all authenticated users to view templates
create policy "Anyone can view templates"
  on document_templates for select
  to authenticated
  using (true);

-- Allow template creation only by authenticated users
create policy "Authenticated users can create templates"
  on document_templates for insert
  to authenticated
  with check (true);

-- Add storage policies for templates bucket
create policy "Authenticated users can read templates"
  on storage.objects for select
  using (
    bucket_id = 'templates' 
    and auth.role() = 'authenticated'
  );

create policy "Authenticated users can upload templates"
  on storage.objects for insert
  with check (
    bucket_id = 'templates' 
    and auth.role() = 'authenticated'
  );

-- Make templates bucket public
update storage.buckets
set public = true
where id = 'templates'; 