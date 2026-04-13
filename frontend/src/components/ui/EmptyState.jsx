import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'No data yet', description = 'Get started by adding your first item.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary-400" />
      </div>
      <h3 className="text-lg font-semibold text-dark-700 dark:text-dark-200">{title}</h3>
      <p className="text-sm text-dark-400 dark:text-dark-500 mt-1 max-w-sm text-center">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
