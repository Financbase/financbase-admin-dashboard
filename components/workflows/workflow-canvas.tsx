"use client";

import { useState, useCallback, useRef } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Play, 
  Settings, 
  Trash2, 
  ArrowRight, 
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'notification' | 'gpt';
  configuration: Record<string, any>;
  parameters: Record<string, any>;
  conditions?: Record<string, any>;
  timeout: number;
  retryCount: number;
  order: number;
  isActive: boolean;
}

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
  onStepSelect: (step: WorkflowStep | null) => void;
  selectedStep: WorkflowStep | null;
  onAddStep: (type: string) => void;
  onDeleteStep: (stepId: string) => void;
  onTestWorkflow: () => void;
  isExecuting?: boolean;
}

const STEP_ICONS = {
  email: CheckCircle,
  notification: AlertTriangle,
  webhook: Zap,
  gpt: Settings,
  delay: Clock,
  condition: ArrowDown,
  action: Play,
};

const STEP_COLORS = {
  email: 'bg-blue-500',
  notification: 'bg-green-500',
  webhook: 'bg-purple-500',
  gpt: 'bg-orange-500',
  delay: 'bg-yellow-500',
  condition: 'bg-red-500',
  action: 'bg-gray-500',
};

function SortableStep({ step, isSelected, onSelect, onDelete }: {
  step: WorkflowStep;
  isSelected: boolean;
  onSelect: (step: WorkflowStep) => void;
  onDelete: (stepId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = STEP_ICONS[step.type];
  const colorClass = STEP_COLORS[step.type];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50"
      )}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary shadow-lg",
          !step.isActive && "opacity-60"
        )}
        onClick={() => onSelect(step)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div 
              className={cn("p-2 rounded-lg", colorClass)}
              {...attributes}
              {...listeners}
            >
              <Icon className="h-4 w-4 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{step.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {step.type}
                </Badge>
                {!step.isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Order: {step.order} | Timeout: {step.timeout}s | Retries: {step.retryCount}
              </p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(step.id);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Arrow */}
      <div className="flex justify-center py-2">
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function WorkflowCanvas({
  steps,
  onStepsChange,
  onStepSelect,
  selectedStep,
  onAddStep,
  onDeleteStep,
  onTestWorkflow,
  isExecuting = false
}: WorkflowCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    setDragOverId(event.over?.id as string || null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex(step => step.id === active.id);
      const newIndex = steps.findIndex(step => step.id === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSteps = arrayMove(steps, oldIndex, newIndex);
        // Update order values
        const updatedSteps = newSteps.map((step, index) => ({
          ...step,
          order: index
        }));
        onStepsChange(updatedSteps);
      }
    }
    
    setActiveId(null);
    setDragOverId(null);
  }, [steps, onStepsChange]);

  const handleStepSelect = useCallback((step: WorkflowStep) => {
    onStepSelect(step);
  }, [onStepSelect]);

  const handleDeleteStep = useCallback((stepId: string) => {
    onDeleteStep(stepId);
  }, [onDeleteStep]);

  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Canvas</h3>
          <p className="text-sm text-muted-foreground">
            Drag and drop to reorder steps, click to configure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTestWorkflow}
            disabled={isExecuting || steps.length === 0}
          >
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? 'Testing...' : 'Test Workflow'}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="min-h-[400px] border-2 border-dashed border-muted rounded-lg p-4">
          {sortedSteps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <h4 className="text-lg font-medium mb-2">No Steps Yet</h4>
              <p className="text-muted-foreground mb-4">
                Add steps from the palette to build your workflow
              </p>
              <Button onClick={() => onAddStep('action')}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Step
              </Button>
            </div>
          ) : (
            <SortableContext items={sortedSteps.map(step => step.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedSteps.map((step, index) => (
                  <SortableStep
                    key={step.id}
                    step={step}
                    isSelected={selectedStep?.id === step.id}
                    onSelect={handleStepSelect}
                    onDelete={handleDeleteStep}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        <DragOverlay>
          {activeId ? (
            <SortableStep
              step={sortedSteps.find(step => step.id === activeId)!}
              isSelected={false}
              onSelect={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Step Summary */}
      {sortedSteps.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{sortedSteps.length}</span> steps
              </div>
              <div className="text-sm">
                <span className="font-medium">
                  {sortedSteps.filter(step => step.isActive).length}
                </span> active
              </div>
              <div className="text-sm">
                <span className="font-medium">
                  {sortedSteps.filter(step => !step.isActive).length}
                </span> inactive
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Estimated execution time: {sortedSteps.reduce((total, step) => total + step.timeout, 0)}s
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
