export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-dark-600 dark:text-dark-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`input-base ${Icon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
