-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE module_type AS ENUM (
        'business_model',
        'market_analysis',
        'financial_projections',
        'risk_assessment',
        'implementation_timeline',
        'pitch_deck'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_analysis_type AS ENUM (
        'content',
        'context',
        'research'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users primary key,
    full_name text,
    avatar_url text,
    metadata jsonb default jsonb_build_object(
        'bio', '',
        'company', '',
        'role', '',
        'location', '',
        'website', '',
        'social_links', jsonb_build_object(
            'twitter', '',
            'linkedin', '',
            'github', ''
        )
    ),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint valid_metadata check (
        jsonb_typeof(metadata->'bio') = 'string' and
        jsonb_typeof(metadata->'company') = 'string' and
        jsonb_typeof(metadata->'role') = 'string' and
        jsonb_typeof(metadata->'location') = 'string' and
        jsonb_typeof(metadata->'website') = 'string' and
        jsonb_typeof(metadata->'social_links') = 'object'
    )
);

-- Create projects table
create table if not exists public.projects (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text,
    industry text,
    stage text check (stage in ('idea', 'mvp', 'growth')),
    owner_id uuid references public.profiles(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    is_archived boolean default false,
    metadata jsonb default '{}'::jsonb
);

-- Create modules table
create table if not exists public.modules (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    type module_type not null,
    title text not null,
    description text,
    order_index integer not null,
    completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb
);

-- Create steps table
create table if not exists public.steps (
    id uuid default uuid_generate_v4() primary key,
    module_id uuid references public.modules(id) on delete cascade not null,
    title text not null,
    content text,
    order_index integer not null,
    completed boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    metadata jsonb default '{}'::jsonb
);

-- Create AI interactions table
create table if not exists public.ai_interactions (
    id uuid default uuid_generate_v4() primary key,
    project_id uuid references public.projects(id) on delete cascade not null,
    module_id uuid references public.modules(id) on delete cascade,
    step_id uuid references public.steps(id) on delete cascade,
    type ai_analysis_type not null,
    prompt text not null,
    response jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.modules enable row level security;
alter table public.steps enable row level security;
alter table public.ai_interactions enable row level security;

-- Create RLS Policies
create policy "Users can view own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Users can view own projects"
    on public.projects for select
    using (auth.uid() = owner_id);

create policy "Users can create own projects"
    on public.projects for insert
    with check (auth.uid() = owner_id);

create policy "Users can update own projects"
    on public.projects for update
    using (auth.uid() = owner_id);

create policy "Users can delete own projects"
    on public.projects for delete
    using (auth.uid() = owner_id);

create policy "Users can view project modules"
    on public.modules for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage project modules"
    on public.modules for all
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can view module steps"
    on public.steps for select
    using (
        exists (
            select 1 from public.modules
            join public.projects on modules.project_id = projects.id
            where modules.id = module_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can manage module steps"
    on public.steps for all
    using (
        exists (
            select 1 from public.modules
            join public.projects on modules.project_id = projects.id
            where modules.id = module_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can view own AI interactions"
    on public.ai_interactions for select
    using (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

create policy "Users can create own AI interactions"
    on public.ai_interactions for insert
    with check (
        exists (
            select 1 from public.projects
            where projects.id = project_id
            and projects.owner_id = auth.uid()
        )
    );

-- Create functions for managing projects
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, avatar_url)
    values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.profiles
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.projects
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.modules
    for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.steps
    for each row execute procedure public.handle_updated_at(); 