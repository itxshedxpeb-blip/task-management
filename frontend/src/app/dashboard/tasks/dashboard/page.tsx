'use client';

import { MainLayout } from '@/layouts/MainLayout';
import { TaskDashboardWorkspace } from '@/features/task-management/components/workspace-dashboard';

export default function TaskDashboardPage() {
  return (
    <MainLayout
      title="Task Dashboard"
      subtitle="Overview of work, verification and team activity"
    >
      <TaskDashboardWorkspace />
    </MainLayout>
  );
}
