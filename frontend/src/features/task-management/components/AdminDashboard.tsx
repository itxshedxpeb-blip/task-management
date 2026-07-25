'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus, TaskPriority } from '../types';
import { cn } from '@/lib/utils';
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  Award,
  ArrowRight,
  Filter,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface AdminDashboardProps {
  tasks: Task[];
  employees: Array<{ id: string; name: string }>;
  onTaskClick: (task: Task) => void;
  onEmployeeClick: (employeeId: string) => void;
}

const COLORS = {
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#a855f7',
  orange: '#f97316',
  cyan: '#06b6d4',
  gray: '#6b7280',
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tasks,
  employees,
  onTaskClick,
  onEmployeeClick,
}) => {
  const adminData = useMemo(() => {
    // Overall stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'InProgress').length;
    const overdueTasks = tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() < today.getTime() && t.status !== 'Completed';
    }).length;
    const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;

    // Status distribution
    const statusDistribution = [
      { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length, color: COLORS.gray },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'InProgress').length, color: COLORS.blue },
      { name: 'Review', value: tasks.filter(t => t.status === 'Review').length, color: COLORS.purple },
      { name: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, color: COLORS.green },
      { name: 'Blocked', value: tasks.filter(t => t.status === 'Blocked').length, color: COLORS.red },
      { name: 'Cancelled', value: tasks.filter(t => t.status === 'Cancelled').length, color: COLORS.gray },
    ].filter(item => item.value > 0);

    // Priority distribution
    const priorityDistribution = [
      { name: 'Urgent', value: tasks.filter(t => t.priority === 'Urgent').length, color: COLORS.red },
      { name: 'High', value: tasks.filter(t => t.priority === 'High').length, color: COLORS.orange },
      { name: 'Medium', value: tasks.filter(t => t.priority === 'Medium').length, color: COLORS.yellow },
      { name: 'Low', value: tasks.filter(t => t.priority === 'Low').length, color: COLORS.gray },
      { name: 'None', value: tasks.filter(t => t.priority === 'None').length, color: COLORS.gray },
    ].filter(item => item.value > 0);

    // Employee workload
    const employeeWorkload = employees.map(employee => {
      const employeeTasks = tasks.filter(t => t.assignedUserId === employee.id);
      const completed = employeeTasks.filter(t => t.status === 'Completed').length;
      const inProgress = employeeTasks.filter(t => t.status === 'InProgress').length;
      const overdue = employeeTasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() < today.getTime() && t.status !== 'Completed';
      }).length;

      return {
        name: employee.name,
        total: employeeTasks.length,
        completed,
        inProgress,
        overdue,
        completionRate: employeeTasks.length > 0 ? Math.round((completed / employeeTasks.length) * 100) : 0,
      };
    }).filter(emp => emp.total > 0);

    // Completion rate over time (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const completedOnDay = tasks.filter(t => {
        if (!t.completedAt) return false;
        const completedDate = new Date(t.completedAt);
        completedDate.setHours(0, 0, 0, 0);
        return completedDate.getTime() === date.getTime();
      }).length;

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: completedOnDay,
      });
    }

    // Total incentive earned
    const totalIncentive = tasks
      .filter(t => t.status === 'Completed')
      .reduce((sum, task) => sum + (task.incentiveValue || 0), 0);

    // Top performers
    const topPerformers = [...employeeWorkload]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5);

    // Recent activity
    const recentActivity = [...tasks]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      blockedTasks,
      statusDistribution,
      priorityDistribution,
      employeeWorkload,
      last7Days,
      totalIncentive,
      topPerformers,
      recentActivity,
    };
  }, [tasks, employees]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of all tasks and team performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard
          data={{
            title: 'Total Tasks',
            value: adminData.totalTasks.toString(),
            change: 0,
            color: 'text-blue-600',
            icon: <BarChart3 className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Completed',
            value: adminData.completedTasks.toString(),
            change: 0,
            color: 'text-green-600',
            icon: <CheckCircle className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'In Progress',
            value: adminData.inProgressTasks.toString(),
            change: 0,
            color: 'text-blue-600',
            icon: <TrendingUp className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Overdue',
            value: adminData.overdueTasks.toString(),
            change: 0,
            color: 'text-red-600',
            icon: <AlertCircle className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Blocked',
            value: adminData.blockedTasks.toString(),
            change: 0,
            color: 'text-orange-600',
            icon: <Clock className="h-5 w-5" />,
          }}
        />
        <KPICard
          data={{
            title: 'Total Earnings',
            value: `₹${adminData.totalIncentive.toLocaleString()}`,
            change: 0,
            color: 'text-green-600',
            icon: <DollarSign className="h-5 w-5" />,
          }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={adminData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {adminData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={adminData.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Completion Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Completion Trend (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={adminData.last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Workload & Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employee Workload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adminData.employeeWorkload.map((employee) => (
                <div
                  key={employee.name}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => onEmployeeClick(employee.name)}
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{employee.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {employee.total} tasks
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="text-green-600">{employee.completed} completed</span>
                      <span className="text-blue-600">{employee.inProgress} in progress</span>
                      {employee.overdue > 0 && (
                        <span className="text-red-600">{employee.overdue} overdue</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{employee.completionRate}%</div>
                    <div className="text-xs text-muted-foreground">completion</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminData.topPerformers.map((performer, index) => (
                <div
                  key={performer.name}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold',
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-muted'
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {performer.completed} / {performer.total} tasks completed
                    </p>
                  </div>
                  <Badge variant={performer.completionRate >= 80 ? 'default' : 'secondary'}>
                    {performer.completionRate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminData.recentActivity.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => onTaskClick(task)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{task.assignedUserName}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {task.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {new Date(task.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
