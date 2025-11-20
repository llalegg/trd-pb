import { Task } from "@shared/schema";
import { prototypeTasks, getCoaches, getAthletes } from "@/data/prototypeData";
import { DatePicker } from "@/components/ui/date-picker";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowUpDown, ArrowUp, ArrowDown, GripVertical, List as ListIcon } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import React from "react";
import DeadlineBadge from "./DeadlineBadge";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import UserAvatar from "./UserAvatar";
import { TypeBadge } from "@/components/ui/type-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { ActionButton } from "@/components/ui/action-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { getPriorityColor, getStatusColor, formatDeadline, getPriorityOrder } from "@/lib/statusUtils";

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusUpdate?: (taskId: string, newStatus: Task['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  onManualOrderChange?: (taskIds: string[]) => void;
  onActionClick?: (task: Task, actionType: string) => void;
  viewMode?: 'list' | 'cards';
  isMobile?: boolean;
}

type SortField = 'deadline' | 'type' | 'name' | 'status' | 'priority';
type SortDirection = 'asc' | 'desc';

// Priority Indicator Component - Icon and Text for Table
const PriorityIndicator = ({ priority }: { priority: string }) => {
  return <PriorityBadge priority={priority as Task['priority']} showText={true} />;
};

// Mobile Task Card Component
const MobileTaskCard = React.memo(({ task, users, athletes, onTaskClick }: { 
  task: Task; 
  users: any[]; 
  athletes: any[]; 
  onTaskClick: (task: Task) => void; 
}) => {
  const assignee = users.find((u: any) => u.id === task.assigneeId);
  const relatedAthletes = (task as any).relatedAthleteIds ? 
    (task as any).relatedAthleteIds.map((id: string) => athletes.find((a: any) => a.id === id)).filter(Boolean) : [];


  return (
    <div 
      onClick={() => onTaskClick(task)}
      className="bg-[#1C1C1B] border border-[#292928] rounded-xl p-4 cursor-pointer hover:bg-[#2C2C2B] transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <h3 className="text-[#F7F6F2] text-sm font-semibold leading-[1.46] mb-1 line-clamp-2">
            {task.name}
          </h3>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStatusColor(task.status) }}
            />
            <span className="text-xs text-[#979795] capitalize">
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Assignee & Athletes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assignee ? (
              <div className="flex items-center gap-2">
                <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                <span className="text-xs text-[#979795]">{assignee.name}</span>
              </div>
            ) : (
              <span className="text-xs text-[#979795]">Unassigned</span>
            )}
          </div>
          
          {relatedAthletes.length > 0 && (
            <div className="flex items-center">
              {relatedAthletes.slice(0, 3).map((athlete: any, index: number) => (
                <div
                  key={athlete?.id}
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 ${index > 0 ? '-ml-1' : ''}`}
                  style={{
                    backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b'][index % 3]
                  }}
                >
                  {athlete?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
              ))}
              {relatedAthletes.length > 3 && (
                <div className="w-5 h-5 rounded-full bg-[#3d3d3c] flex items-center justify-center text-xs font-semibold text-[#979795] -ml-1">
                  +{relatedAthletes.length - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#979795]">Deadline</span>
            <span className="text-xs text-[#f7f6f2]">{formatDeadline(task.deadline)}</span>
          </div>
        )}
      </div>
    </div>
  );
});


// Sortable Task Row Component
interface SortableTaskRowProps {
  task: Task;
  users: any[];
  athletes: any[];
  onTaskClick: (task: Task) => void;
  openDropdowns: {[key: string]: 'priority' | 'status' | 'deadline' | 'assignee' | null};
  onToggleDropdown: (taskId: string, type: 'priority' | 'status' | 'deadline' | 'assignee') => void;
  onUpdatePriority: (taskId: string, priority: 'low' | 'medium' | 'high') => void;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onUpdateDeadline: (taskId: string, deadline: Date | null | undefined) => void;
  onUpdateAssignee: (taskId: string, assigneeId: string) => void;
  onActionClick?: (task: Task, actionType: string) => void;
}

const SortableTaskRow = React.memo(function SortableTaskRow({ task, users, athletes, onTaskClick, openDropdowns, onToggleDropdown, onUpdatePriority, onUpdateStatus, onUpdateDeadline, onUpdateAssignee, onActionClick }: SortableTaskRowProps) {
  // Default action handler for automatic task types
  const handleDefaultAction = (task: Task) => {
    switch (task.type) {
      case 'injury_call':
      case 'onboarding_call':
        console.log(`Scheduling call for task: ${task.name}`);
        // In a real app, this would open a call scheduling modal or redirect to scheduling page
        alert(`Scheduling call for: ${task.name}`);
        break;
      case 'coach_assignment':
        console.log(`Opening coach assignment document for task: ${task.name}`);
        // In a real app, this would open the assignment document or redirect to assignment page
        alert(`Opening coach assignment document for: ${task.name}`);
        break;
      case 'assessment_review':
        console.log(`Opening assessment review for task: ${task.name}`);
        // In a real app, this would open the assessment review or redirect to assessment page
        alert(`Opening assessment review for: ${task.name}`);
        break;
      default:
        console.log(`No action defined for task type: ${task.type}`);
    }
  };

  // Function to get comment count for a task
  const getCommentCount = (task: Task) => {
    // For prototype data, return mock comment counts based on task ID
    if (task.name === 'New Task' && task.description === 'Task description') {
      return 0; // New tasks have no comments
    }
    
    // Return mock comment counts for existing tasks
    const mockCounts: { [key: string]: number } = {
      'task1': 2,
      'task2': 1,
      'task3': 3,
      'task4': 0,
      'task5': 1,
      'task6': 2,
      'task7': 0,
      'task8': 1,
      'task9': 2,
      'task10': 0,
      'task11': 4,
      'task12': 1,
      'task13': 3,
      'task14': 2,
      'task15': 1
    };
    
    return mockCounts[task.id] || 0;
  };
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const assignee = users.find((u: any) => u.id === task.assigneeId);
  const relatedAthletes = (task as any).relatedAthleteIds ? 
    (task as any).relatedAthleteIds.map((id: string) => athletes.find((a: any) => a.id === id)).filter(Boolean) : [];

  return (
    <div
      ref={setNodeRef}
      style={{...style, position: 'relative'}}
      className={`group flex items-center border-b border-[#292928] h-12 bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer ${
        isDragging ? 'z-50 shadow-2xl' : ''
      }`}
      onClick={() => onTaskClick(task)}
    >

      {/* Task Name Column */}
      <div className="flex gap-[8px] items-center pl-[8px] pr-[16px] py-0 w-[360px] min-w-[360px] flex-shrink-0 border-r border-[#292928]">
        <div 
          {...attributes}
          {...listeners}
          className="overflow-clip relative shrink-0 size-[24px] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-[#979795]" />
        </div>
        <div className="basis-0 font-['Montserrat:SemiBold',_sans-serif] grow leading-[0] min-h-px min-w-px not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#f7f6f2] text-[14px] text-nowrap">
          <p className="[white-space-collapse:collapse] leading-[1.46] overflow-ellipsis overflow-hidden">{task.name}</p>
        </div>
        {/* Comment indicator */}
        {getCommentCount(task) > 0 && (
          <div className="box-border content-stretch flex gap-[4px] items-center justify-center px-[8px] py-[2px] relative rounded-[9999px] shrink-0 bg-[#292928]">
            <div className="relative shrink-0 size-[16px]">
              <svg className="w-4 h-4 text-[#f7f6f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="content-stretch flex font-['Montserrat:Medium',_sans-serif] gap-[4px] items-center leading-[0] not-italic relative shrink-0 text-[#f7f6f2] text-[12px] text-nowrap">
              <div className="relative shrink-0">
                <p className="leading-[1.32] text-nowrap whitespace-pre">•</p>
              </div>
              <div className="relative shrink-0">
                <p className="leading-[1.32] text-nowrap whitespace-pre">{getCommentCount(task)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Columns Container */}
      <div className="flex items-center h-full" style={{ minWidth: '1280px' }}>
          {/* Type */}
          <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <TypeBadge type={task.type} />
      </div>

      {/* Assignee */}
      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'assignee'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'assignee')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'assignee');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors flex items-center gap-2"
            >
              {assignee ? (
                <>
                  <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                  <span className="text-[#f7f6f2] text-sm truncate">{assignee.name}</span>
                </>
              ) : (
                <span className="text-[#979795] text-sm">Unassigned</span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            {users.map((user: any) => (
              <DropdownMenuItem 
                key={user.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateAssignee(task.id, user.id);
                }}
                className="text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70"
                    style={{ backgroundColor: '#f59e0b' }}
                  >
                          {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                  {user.name}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateAssignee(task.id, '');
              }}
              className="text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer"
            >
              <span className="text-[#979795]">Unassigned</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Priority */}
      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'priority'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'priority')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'priority');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors"
            >
              <PriorityIndicator priority={task.priority || 'medium'} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'high');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'high' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              High
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'medium');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'medium' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Medium
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdatePriority(task.id, 'low');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.priority === 'low' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Low
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Related Athletes */}
      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <div className="flex items-center">
          {relatedAthletes.length > 0 ? (
            <div className="flex">
              {relatedAthletes.slice(0, 4).map((athlete: any, avatarIndex: number) => (
                <div
                  key={athlete?.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white border border-black border-opacity-70 ${avatarIndex > 0 ? '-ml-2' : ''}`}
                  style={{
                    backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][avatarIndex % 5]
                  }}
                >
                  {athlete?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </div>
              ))}
            </div>
          ) : (
            <span className="text-[#979795] text-sm">–</span>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <div
          onClick={(e) => e.stopPropagation()}
        >
          <DatePicker
            value={task.deadline ? (task.deadline instanceof Date ? task.deadline : new Date(task.deadline)) : null}
            onChange={(date) => {
              onUpdateDeadline(task.id, date);
            }}
            placeholder="–"
            variant="badge"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
        <DropdownMenu 
          open={openDropdowns[task.id] === 'status'} 
          onOpenChange={(open) => !open && onToggleDropdown(task.id, 'status')}
        >
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDropdown(task.id, 'status');
              }}
              className="hover:bg-[rgba(255,255,255,0.05)] rounded p-1 transition-colors"
            >
              <StatusBadge status={task.status} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#292928] border-[#3d3d3c]">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'new');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'new' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              New
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'in_progress');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'in_progress' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              In progress
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'blocked');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'blocked' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Blocked
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(task.id, 'completed');
              }}
              className={`text-[#f7f6f2] focus:bg-[#3a3a38] cursor-pointer ${
                task.status === 'completed' ? 'bg-[#3a3a38]' : ''
              }`}
            >
              Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center pl-4 pr-0 w-[80px] min-w-[80px]">
        <div onClick={(e) => e.stopPropagation()}>
          <ActionButton
            taskType={task.type}
            onClick={() => {
              if (onActionClick) {
                onActionClick(task, task.type);
              } else {
                // Default action handling
                handleDefaultAction(task);
              }
            }}
          />
        </div>
      </div>
      </div>
    </div>
  );
});

export default function TaskList({ tasks, onTaskClick, onStatusUpdate, onDeleteTask, onManualOrderChange, onActionClick, viewMode = 'list', isMobile = false }: TaskListProps) {
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [orderedTasks, setOrderedTasks] = useState<Task[]>(tasks);
  const [isManualOrdering, setIsManualOrdering] = useState<boolean>(false);
  const [manualOrderIds, setManualOrderIds] = useState<string[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<{[key: string]: 'priority' | 'status' | 'deadline' | 'assignee' | null}>({});
  const [hoveredSortField, setHoveredSortField] = useState<SortField | null>(null);

  // Removed fixed column functionality

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update ordered tasks when tasks change
  React.useEffect(() => {
    setOrderedTasks(tasks);
  }, [tasks]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      // Enable manual ordering and reset column sorting
      setIsManualOrdering(true);
      
      setOrderedTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        const newOrderIds = newOrder.map(task => task.id);
        
        // Save manual order
        setManualOrderIds(newOrderIds);
        
        // Notify parent component of manual order change
        if (onManualOrderChange) {
          onManualOrderChange(newOrderIds);
        }
        
        console.log('Task reordered:', { 
          taskId: active.id, 
          fromIndex: oldIndex, 
          toIndex: newIndex,
          newOrder: newOrderIds
        });
        
        return newOrder;
      });
    }
  };

  // Handle manual ordering toggle
  const handleManualOrderingToggle = () => {
    if (isManualOrdering) {
      // Disable manual ordering and restore default sorting
      setIsManualOrdering(false);
      setManualOrderIds([]);
      setOrderedTasks(tasks);
    } else {
      // Enable manual ordering and restore saved order
      if (manualOrderIds.length > 0) {
        // Restore the saved manual order
        const restoredOrder = manualOrderIds
          .map(id => tasks.find(task => task.id === id))
          .filter(Boolean) as Task[];
        
        // Add any new tasks that weren't in the manual order
        const newTasks = tasks.filter(task => !manualOrderIds.includes(task.id));
        const finalOrder = [...restoredOrder, ...newTasks];
        
        setOrderedTasks(finalOrder);
      }
      setIsManualOrdering(true);
    }
  };

  // Use prototype data - memoized to prevent unnecessary re-computation
  const users = useMemo(() => getCoaches(), []); // Coaches act as users/assignees
  const athletes = useMemo(() => getAthletes(), []); // Athletes for task relationships

  // Simple update functions for prototype - memoized to prevent unnecessary re-creation
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    // In prototype mode, just console log the update
    console.log('Task update:', taskId, updates);
  }, []);


  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusVariant = (status: Task['status']) => {
    switch (status) {
      case 'new': return 'secondary';
      case 'in_progress': return 'default';
      case 'blocked': return 'outline';
      case 'completed': return 'secondary';
      default: return 'secondary';
    }
  };

  // Inline update handlers - memoized to prevent unnecessary re-creation
  const handleUpdatePriority = useCallback((taskId: string, priority: 'low' | 'medium' | 'high') => {
    updateTask(taskId, { priority });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  }, [updateTask]);

  const handleUpdateStatus = useCallback((taskId: string, status: Task['status']) => {
    updateTask(taskId, { status });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
    if (onStatusUpdate) {
      onStatusUpdate(taskId, status);
    }
  }, [updateTask, onStatusUpdate]);

  const handleUpdateDeadline = useCallback((taskId: string, deadline: Date | null | undefined) => {
    updateTask(taskId, { deadline });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  }, [updateTask]);

  const handleUpdateAssignee = useCallback((taskId: string, assigneeId: string) => {
    updateTask(taskId, { assigneeId });
    setOpenDropdowns(prev => ({ ...prev, [taskId]: null }));
  }, [updateTask]);

  const toggleDropdown = useCallback((taskId: string, type: 'priority' | 'status' | 'deadline' | 'assignee') => {
    setOpenDropdowns(prev => ({
      ...prev,
      [taskId]: prev[taskId] === type ? null : type
    }));
  }, []);

  const handleSort = (field: SortField) => {
    // Reset manual ordering when using column sorting
    setIsManualOrdering(false);
    
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField, isHovered: boolean = false) => {
    if (!isHovered) return null;
    
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-[#bcbbb7]" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 ml-1 text-[#bcbbb7]" /> : 
      <ArrowDown className="w-4 h-4 ml-1 text-[#bcbbb7]" />;
  };


  const sortedTasks = useMemo(() => {
    return [...orderedTasks].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'deadline':
          aValue = a.deadline ? new Date(a.deadline).getTime() : 0;
          bValue = b.deadline ? new Date(b.deadline).getTime() : 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type?.toLowerCase() || '';
          bValue = b.type?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'priority':
          aValue = getPriorityOrder(a.priority);
          bValue = getPriorityOrder(b.priority);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orderedTasks, sortField, sortDirection]);

  // Mobile card view
  if (isMobile && viewMode === 'cards') {
    return (
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(isManualOrdering ? orderedTasks : sortedTasks).map((task) => (
            <MobileTaskCard
              key={task.id}
              task={task}
              users={users}
              athletes={athletes}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-[#979795] text-sm mb-2">No tasks found</div>
            <div className="text-[#585856] text-xs">Create a new task to get started</div>
          </div>
        )}
      </div>
    );
  }

  // Desktop table view or mobile list view
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full overflow-x-auto scrollbar-thin">
        <div className="bg-[#121210] rounded-2xl overflow-hidden relative" style={{ minWidth: '1640px' }}>
              {/* Table Header - Hidden on mobile list view */}
              {!isMobile && (
                <div className="flex h-10 bg-[#121210] text-[#bcbbb7] text-xs font-medium relative">
                    {/* Task Name Column */}
                    <div className="flex items-center pl-[8px] pr-[16px] w-[360px] min-w-[360px] flex-shrink-0 border-r border-[#292928]">
                    {/* List Icon */}
                    <div className="flex items-center justify-between pl-[12px] pr-0 py-0 relative shrink-0 size-[40px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleManualOrderingToggle();
                              }}
                              className="overflow-clip relative shrink-0 size-[16px] hover:bg-[#3a3a38] rounded transition-colors"
                            >
                              <ListIcon 
                                className="w-4 h-4" 
                                style={{ 
                                  color: isManualOrdering ? '#f7f6f2' : '#585856' 
                                }} 
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{isManualOrdering ? 'Disable manual ordering' : 'Enable manual ordering'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="bg-[#292928] h-[20px] shrink-0 w-px" />
                    </div>
                    
                    {/* Name Header */}
                    <div className="flex items-center justify-between pl-[16px] pr-0 flex-1">
                      <button 
                        onClick={() => !isManualOrdering && handleSort('name')}
                        onMouseEnter={() => !isManualOrdering && setHoveredSortField('name')}
                        onMouseLeave={() => !isManualOrdering && setHoveredSortField(null)}
                        className="flex gap-[4px] items-center flex-1 hover:text-[#f7f6f2] transition-colors"
                        disabled={isManualOrdering}
                      >
                        <span className="font-['Montserrat:Medium',_sans-serif] text-[12px] leading-[1.32] text-[#bcbbb7] whitespace-nowrap overflow-hidden text-ellipsis">
                          Name
                        </span>
                        {!isManualOrdering && getSortIcon('name', hoveredSortField === 'name')}
                      </button>
                    </div>
                  </div>
              
                  {/* Scrollable Columns Header */}
                  <div className="flex items-center h-full" style={{ minWidth: '1280px' }}>
                  
                      {/* Type */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <button 
                          onClick={() => handleSort('type')}
                          onMouseEnter={() => setHoveredSortField('type')}
                          onMouseLeave={() => setHoveredSortField(null)}
                          className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                        >
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Type</span>
                          {getSortIcon('type', hoveredSortField === 'type')}
                        </button>
                      </div>
                      
                      {/* Assignee */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Assignee</span>
                      </div>
                      
                      {/* Priority */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <button 
                          onClick={() => handleSort('priority')}
                          onMouseEnter={() => setHoveredSortField('priority')}
                          onMouseLeave={() => setHoveredSortField(null)}
                          className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                        >
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Priority</span>
                          {getSortIcon('priority', hoveredSortField === 'priority')}
                        </button>
                      </div>
                      
                      {/* Related Athletes */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Related athlete(s)</span>
                      </div>
                      
                      {/* Deadline */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <button 
                          onClick={() => handleSort('deadline')}
                          onMouseEnter={() => setHoveredSortField('deadline')}
                          onMouseLeave={() => setHoveredSortField(null)}
                          className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                        >
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Deadline</span>
                          {getSortIcon('deadline', hoveredSortField === 'deadline')}
                        </button>
                      </div>
                      
                      {/* Status */}
                      <div className="flex items-center pl-4 pr-0 w-[200px] min-w-[200px]">
                        <button 
                          onClick={() => handleSort('status')}
                          onMouseEnter={() => setHoveredSortField('status')}
                          onMouseLeave={() => setHoveredSortField(null)}
                          className="flex items-center gap-1 hover:text-[#f7f6f2] transition-colors"
                        >
                          <span className="whitespace-nowrap overflow-hidden text-ellipsis">Status</span>
                          {getSortIcon('status', hoveredSortField === 'status')}
                        </button>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-center pl-4 pr-0 w-[80px] min-w-[80px]">
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">Actions</span>
                      </div>
                    </div>
                </div>
              )}

              {/* Table Body */}
              <div>
                  <SortableContext 
                    items={isManualOrdering ? orderedTasks.map(t => t.id) : sortedTasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {(isManualOrdering ? orderedTasks : sortedTasks).map((task) => (
                    isMobile ? (
                      // Mobile simplified row
                      <div
                        key={task.id}
                        onClick={() => onTaskClick(task)}
                        className="flex items-center justify-between p-4 border-b border-[#292928] bg-[#1C1C1B] hover:bg-[#2C2C2B] transition-colors cursor-pointer"
                      >
                        <div className="flex-1">
                          <div className="text-[#F7F6F2] text-sm font-semibold mb-1">{task.name}</div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ 
                                backgroundColor: task.status === 'new' ? '#ff8254' : 
                                               task.status === 'in_progress' ? '#3f83f8' : 
                                               task.status === 'blocked' ? '#f87171' : 
                                               task.status === 'completed' ? '#4ade80' : '#ff8254'
                              }}
                            />
                            <span className="text-xs text-[#979795] capitalize">
                              {task.status.replace('_', ' ')}
                            </span>
                            {task.deadline && (
                              <>
                                <span className="text-xs text-[#585856]">•</span>
                                <span className="text-xs text-[#979795]">
                                  {(() => {
                                    const date = new Date(task.deadline);
                                    const today = new Date();
                                    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    if (diffDays === 0) return 'Today';
                                    if (diffDays === 1) return 'Tomorrow';
                                    if (diffDays === -1) return 'Yesterday';
                                    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
                                    if (diffDays <= 7) return `${diffDays}d`;
                                    
                                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                  })()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const assignee = users.find((u: any) => u.id === task.assigneeId);
                            return assignee ? (
                              <UserAvatar userId={assignee.id} name={assignee.name} size="xs" />
                            ) : null;
                          })()}
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: task.priority === 'high' ? '#f87171' : 
                                             task.priority === 'medium' ? '#3f83f8' : '#979795'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <SortableTaskRow
                        key={task.id}
                        task={task}
                        users={users}
                        athletes={athletes}
                        onTaskClick={onTaskClick}
                        openDropdowns={openDropdowns}
                        onToggleDropdown={toggleDropdown}
                        onUpdatePriority={handleUpdatePriority}
                        onUpdateStatus={handleUpdateStatus}
                        onUpdateDeadline={handleUpdateDeadline}
                        onUpdateAssignee={handleUpdateAssignee}
                        onActionClick={onActionClick}
                      />
                    )
                  ))}
                  </SortableContext>
              </div>
          </div>
        </div>
    </DndContext>
  );
}
