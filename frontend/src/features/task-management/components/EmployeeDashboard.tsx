'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus, TaskPriority } from '../types';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  User,
  Plus,
  ArrowRight,
  Bell,
  Target,
  Award,
  BarChart3,
} from 'lucide-react';

interface EmployeeDashboardProps {
  tasks: Task[];
  currentUserId: string;
  currentUserName: string;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  tasks,
  currentUserId,
  currentUserName,
  onTaskClick,
  onCreateTask,
}) => {
  const employeeData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Filter tasks for current employee
    const myTasks = tasks.filter(task => task.assignedUserId === currentUserId);

    const todayTasks = myTasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime();
    });

    const dueToday = myTasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === today.getTime() && task.status !== 'Completed';
    });

    const dueTomorrow = myTasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() === tomorrow.getTime() && task.status !== 'Completed';
    });

    const overdue = myTasks.filter(task => 
      task.status === 'Overdue' || task.status === 'CompletedLate'
    );

    const upcoming = myTasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      return createdDate.getTime() > today.getTime() && 
             createdDate.getTime() <= nextWeek.getTime() && 
             task.status !== 'Completed';
    });

    const inProgress = myTasks.filter(task => task.status === 'InProgress');
    const completed = myTasks.filter(task => task.status === 'Completed');
    const blocked = myTasks.filter(task => task.status === 'OnHold');

    const completedToday = myTasks.filter(task => {
      const completedAt = task.completedAt ? new Date(task.completedAt) : null;
      if (!completedAt) return false;
      completedAt.setHours(0, 0, 0, 0);
      return completedAt.getTime() === today.getTime();
    });

    const recentlyUpdated = [...myTasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const highPriority = myTasks.filter(task => 
      task.priority === 'Urgent' || task.priority === 'High'
    );

    // Calculate completion rate
    const completionRate = myTasks.length > 0 
      ? Math.round((completed.length / myTasks.length) * 100) 
      : 0;

    // Calculate average progress
    const avgProgress = myTasks.length > 0
      ? Math.round(myTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / myTasks.length)
      : 0;

    // Calculate total incentive
    const totalIncentive = completed.reduce((sum, task) => sum + (task.incentiveValue || 0), 0);

    return {
      myTasks: myTasks.length,
      todayTasks: todayTasks.length,
      dueToday: dueToday.length,
      dueTomorrow: dueTomorrow.length,
      overdue: overdue.length,
      upcoming: upcoming.length,
      inProgress: inProgress.length,
      completed: completed.length,
      blocked: blocked.length,
      completedToday: completedToday.length,
      highPriority: highPriority.length,
      completionRate,
      avgProgress,
      totalIncentive,
      todayTasksList: todayTasks.slice(0, 5),
      dueTodayList: dueToday.slice(0, 5),
      overdueList: overdue.slice(0, 5),
      inProgressList: inProgress.slice(0, 5),
      recentlyUpdatedList: recentlyUpdated,
      highPriorityList: highPriority.slice(0, 5),
    };
  }, [tasks, currentUserId]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'None':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Todo':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'OnHold':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium line-clamp-2 flex-1">{task.title}</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn('text-xs', getPriorityColor(task.priority))}
            >
              {task.priority}
            </Badge>
            <Badge
              variant="outline"
              className={cn('text-xs', getStatusColor(task.status))}
            >
              {task.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="truncate">{task.assignedUserName}</span>
            {task.dueDate && (
              <span className="whitespace-nowrap">
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {task.progress !== undefined && task.progress > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{task.progress}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {currentUserName}!</h2>
          <p className="text-muted-foreground">
            Here&apos;s your task overview for today
          </p>
        </div>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          data={{
            title: 'My Tasks',
            value: employeeData.myTasks.toString(),
            change: 0,
            color: 'text-blue-600',
            icon: <User className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Due Today',
            value: employeeData.dueToday.toString(),
            change: 0,
            color: 'text-orange-600',
            icon: <Clock className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'In Progress',
            value: employeeData.inProgress.toString(),
            change: 0,
            color: 'text-blue-600',
            icon: <TrendingUp className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Completed Today',
            value: employeeData.completedToday.toString(),
            change: 0,
            color: 'text-green-600',
            icon: <CheckCircle className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Completion Rate',
            value: `${employeeData.completionRate}%`,
            change: 0,
            color: 'text-purple-600',
            icon: <Target className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Avg Progress',
            value: `${employeeData.avgProgress}%`,
            change: 0,
            color: 'text-cyan-600',
            icon: <BarChart3 className="h-5 w-5" />,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Due Today */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Due Today
                </CardTitle>
                <Badge variant="secondary">{employeeData.dueToday}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeData.dueTodayList.length > 0 ? (
                  employeeData.dueTodayList.map(renderTaskCard)
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tasks due today
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overdue */}
          {employeeData.overdue > 0 && (
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Overdue
                  </CardTitle>
                  <Badge variant="destructive">{employeeData.overdue}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeeData.overdueList.map(renderTaskCard)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* In Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  In Progress
                </CardTitle>
                <Badge variant="secondary">{employeeData.inProgress}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeData.inProgressList.length > 0 ? (
                  employeeData.inProgressList.map(renderTaskCard)
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No tasks in progress
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recently Updated */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  Recently Updated
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-6">
                  View All
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeData.recentlyUpdatedList.map(renderTaskCard)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Completed</span>
                <Badge variant="outline">{employeeData.completed}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  {employeeData.completionRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Progress</span>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {employeeData.avgProgress}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Earnings</span>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  ₹{employeeData.totalIncentive.toLocaleString()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Tomorrow</span>
                <Badge variant="outline">{employeeData.dueTomorrow}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Upcoming (7 days)</span>
                <Badge variant="outline">{employeeData.upcoming}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Blocked</span>
                <Badge variant="outline" className="text-red-600 border-red-300">
                  {employeeData.blocked}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">High Priority</span>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  {employeeData.highPriority}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={onCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Today&apos;s Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Tasks</span>
                  <span className="font-medium">{employeeData.todayTasks}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-green-600">{employeeData.completedToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-orange-600">
                    {employeeData.todayTasks - employeeData.completedToday}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 transition-all"
                    style={{
                      width: `${employeeData.todayTasks > 0 
                        ? (employeeData.completedToday / employeeData.todayTasks) * 100 
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
