import { cn } from '@/lib/utils';

type StatusType = 'draft' | 'pending' | 'batched' | 'in_transit' | 'delivered' | 'skipped' | 'scheduled' | 'in_progress' | 'completed' | 'active' | 'inactive' | 'partial' | 'approved' | 'rejected' | 'fulfilled';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  batched: {
    label: 'Batched',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_transit: {
    label: 'In Transit',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  skipped: {
    label: 'Skipped',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  inactive: {
    label: 'Inactive',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
  },
  partial: {
    label: 'Partial',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
  fulfilled: {
    label: 'Fulfilled',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
