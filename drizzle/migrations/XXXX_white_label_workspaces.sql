-- Migration: Create workspaces table and add white label fields to organizations
-- Created: 2025-01-XX
-- Description: Adds workspaces table for white label support and missing fields to organizations

-- Add missing fields to organizations table for white label support
DO $$ 
BEGIN
  -- Add slug column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN slug text UNIQUE;
  END IF;

  -- Add settings column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'settings'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN settings text;
  END IF;

  -- Add owner_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE public.organizations ADD COLUMN owner_id uuid REFERENCES public.users(id);
  END IF;
END $$;

-- Create workspaces table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspaces (
  id serial PRIMARY KEY,
  workspace_id text UNIQUE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  logo text,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  domain text,
  settings text,
  owner_id text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  is_default boolean DEFAULT false,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Create workspace_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id serial PRIMARY KEY,
  workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions text,
  is_active boolean DEFAULT true,
  joined_at timestamp DEFAULT now()
);

-- Create workspace_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id serial PRIMARY KEY,
  workspace_id integer REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  invited_by text NOT NULL,
  expires_at timestamp,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_workspace_id ON public.workspaces(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_domain ON public.workspaces(domain) WHERE domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspaces_plan ON public.workspaces(plan);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug) WHERE slug IS NOT NULL;

