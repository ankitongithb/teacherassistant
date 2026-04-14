import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Delete", 
  isDanger = true 
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
        <div className={`p-4 rounded-full ${isDanger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'}`}>
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-dark-600 dark:text-dark-300 text-sm px-2">
          {message}
        </p>
      </div>
      <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-700 mt-2">
        <Button variant="ghost" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button variant={isDanger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }} className="flex-1">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
