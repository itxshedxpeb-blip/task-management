-- Fix tasks created by admin but incorrectly assigned to admin instead of employee
-- This migration updates tasks where createdById is admin but assignedUserId is also admin
-- It sets assignedUserId to match the intended employee based on context or marks them for reassignment

-- First, let's identify problematic tasks
SELECT id, taskId, title, assignedUserId, createdById, assignedUserName, createdByName
FROM "Task"
WHERE "assignedUserId" = "createdById"
AND "createdById" IN (SELECT id FROM "User" WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER'));

-- For tasks that need to be reassigned to specific employees, you would update them like:
-- UPDATE "Task"
-- SET "assignedUserId" = 'target-employee-id',
--     "assignedUserName" = 'Employee Name'
-- WHERE id = 'task-id';

-- Note: This is a manual migration script. You need to identify which admin-created tasks
-- should be assigned to which employees and update the assignedUserId accordingly.
