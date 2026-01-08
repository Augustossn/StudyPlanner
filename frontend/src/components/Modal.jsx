import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ title, isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center p-5 border-b border-border">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
