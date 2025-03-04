-- Add policy to allow users to insert their own profile
create policy "Users can insert own profile"
    on public.profiles for insert
    with check (auth.uid() = id);

-- Add policy to allow users to read their own profile during insert
create policy "Users can read own profile during insert"
    on public.profiles for select
    using (auth.uid() = id); 