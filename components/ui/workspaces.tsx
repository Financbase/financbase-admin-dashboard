"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Plus, Search } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  logo?: string;
  plan?: string;
  slug?: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  currentWorkspace: null,
  setCurrentWorkspace: () => {},
});

export function useWorkspaces() {
  return useContext(WorkspaceContext);
}

export function Workspaces({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    // Simulate fetching workspaces from API
    const mockWorkspaces: Workspace[] = [
      {
        id: '1',
        name: 'Personal Workspace',
        logo: '🏠',
        plan: 'Free',
        slug: 'personal',
      },
      {
        id: '2',
        name: 'Team Workspace',
        logo: '👥',
        plan: 'Pro',
        slug: 'team',
      },
    ];
    setWorkspaces(mockWorkspaces);
    setCurrentWorkspace(mockWorkspaces[0]);
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, setCurrentWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function WorkspaceTrigger({ className }: { className?: string }) {
  const { currentWorkspace } = useWorkspaces();

  return (
    <PopoverTrigger asChild>
      <Button variant="outline" className={className}>
        {currentWorkspace?.logo && (
          <span className="mr-2">{currentWorkspace.logo}</span>
        )}
        {currentWorkspace?.name || 'Select Workspace'}
        <ChevronDown className="ml-2 h-4 w-4" />
      </Button>
    </PopoverTrigger>
  );
}

interface WorkspaceContentProps {
  title: string;
  searchable?: boolean;
  showCreateButton?: boolean;
  children?: React.ReactNode;
}

export function WorkspaceContent({
  title,
  searchable = false,
  showCreateButton = false,
  children
}: WorkspaceContentProps) {
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useWorkspaces();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PopoverContent className="w-80">
      <div className="space-y-4">
        <h3 className="font-semibold">{title}</h3>

        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filteredWorkspaces.map((workspace) => (
            <Button
              key={workspace.id}
              variant={currentWorkspace?.id === workspace.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentWorkspace(workspace)}
            >
              {workspace.logo && (
                <span className="mr-2">{workspace.logo}</span>
              )}
              <div className="flex-1 text-left">
                <div className="font-medium">{workspace.name}</div>
                {workspace.plan && (
                  <div className="text-sm text-muted-foreground">{workspace.plan}</div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {showCreateButton && children}
      </div>
    </PopoverContent>
  );
}
