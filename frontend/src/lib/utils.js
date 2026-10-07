import { clsx } from 'clsx';

export const cn = (...classes) => clsx(...classes);

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const STATUS_LABELS = {
  NOT_STARTED: 'Not Started',
  IN_PROGRESS: 'In Progress',
  COMPLETED:   'Completed',
  PENDING:     'Pending',
};

export const PRIORITY_LABELS = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
};

// Neo-Brutalism badge classes (brut-badge base applied by Badge component)
export const PROJECT_STATUS_COLORS = {
  NOT_STARTED: 'bg-brut-yellow text-brut-black',
  IN_PROGRESS: 'bg-brut-blue   text-white',
  COMPLETED:   'bg-brut-green  text-brut-black',
};

export const TASK_STATUS_COLORS = {
  PENDING:     'bg-brut-yellow text-brut-black',
  IN_PROGRESS: 'bg-brut-blue   text-white',
  COMPLETED:   'bg-brut-green  text-brut-black',
};

export const PRIORITY_COLORS = {
  LOW:    'bg-brut-green  text-brut-black',
  MEDIUM: 'bg-brut-yellow text-brut-black',
  HIGH:   'bg-brut-pink   text-white',
};
