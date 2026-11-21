import React, { useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface DocumentModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-pop bg-[var(--bg-surface)] rounded-[28px] w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl border border-[var(--border-hairline)] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-soft)] text-[var(--accent)] rounded-xl flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] active:scale-90 transition-transform hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-[var(--bg-subtle)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
