/**
 * Static UI defaults for task saved-views and construction templates.
 * Not mock API data — local schema defaults for pending task UI helpers.
 */
import type { SavedView, TaskTemplate } from '../types';

export const DEFAULT_SAVED_VIEWS: SavedView[] = [
  { id: 'default', name: 'All Tasks', scope: 'default', isPinned: true },
  { id: 'my-open', name: 'My Open Tasks', scope: 'personal' },
  { id: 'overdue', name: 'Overdue', scope: 'personal' },
  { id: 'team-review', name: 'Pending Review', scope: 'team' },
  { id: 'critical', name: 'Critical Priority', scope: 'public' },
];

export const CONSTRUCTION_TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'tpl-installation',
    name: 'Installation',
    description: 'Structure installation at site',
    category: 'Installation',
    defaultPriority: 'High',
    checklist: [
      'Verify site readiness',
      'Stage materials',
      'Install primary frame',
      'Install secondary members',
      'Safety check',
    ],
  },
  {
    id: 'tpl-inspection',
    name: 'Inspection',
    description: 'Quality inspection of completed work',
    category: 'Inspection',
    defaultPriority: 'Medium',
    checklist: ['Review specifications', 'Inspect welds/joints', 'Capture photos', 'Record findings'],
  },
  {
    id: 'tpl-fabrication',
    name: 'Fabrication',
    description: 'Steel fabrication work order',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Cut members', 'Weld assembly', 'Surface prep', 'Apply primer'],
  },
  {
    id: 'tpl-painting',
    name: 'Painting',
    description: 'Surface painting and finishing',
    category: 'Field Work',
    defaultPriority: 'Low',
    checklist: ['Surface cleaning', 'Primer coat', 'Final coat', 'Cure & inspect'],
  },
  {
    id: 'tpl-quality-check',
    name: 'Quality Check',
    description: 'Quality assurance checkpoint',
    category: 'Inspection',
    defaultPriority: 'High',
    checklist: ['Dimensional check', 'Material verification', 'Documentation'],
  },
  {
    id: 'tpl-dispatch',
    name: 'Dispatch',
    description: 'Material dispatch to site',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Verify load list', 'Load vehicle', 'Generate challan', 'Confirm delivery'],
  },
  {
    id: 'tpl-site-visit',
    name: 'Site Visit',
    description: 'Site survey or coordination visit',
    category: 'Field Work',
    defaultPriority: 'Medium',
    checklist: ['Site measurement', 'Photograph site', 'Coordinate with client'],
  },
  {
    id: 'tpl-maintenance',
    name: 'Maintenance',
    description: 'Preventive or breakdown maintenance',
    category: 'Maintenance',
    defaultPriority: 'High',
    checklist: ['Inspect equipment', 'Replace parts', 'Test operation'],
  },
];
