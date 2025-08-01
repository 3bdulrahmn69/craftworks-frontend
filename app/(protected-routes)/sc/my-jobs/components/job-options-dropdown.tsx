'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/app/components/ui/button';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import { FaEllipsisV, FaEdit, FaTrash, FaBan } from 'react-icons/fa';

interface JobOptionsDropdownProps {
  job: any;
  isRTL: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
  deleteLoading: boolean;
  cancelLoading: boolean;
}

const JobOptionsDropdown = ({
  job,
  isRTL,
  onEdit,
  onDelete,
  onCancel,
  deleteLoading,
  cancelLoading,
}: JobOptionsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('myJobs');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const canEdit = job.status === 'Posted';
  const canCancel = ['Posted', 'Hired', 'In Progress'].includes(job.status);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 hover:bg-muted rounded-lg transition-colors"
        aria-label="Job options"
      >
        <FaEllipsisV className="w-4 h-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div
          className={`absolute top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-2 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          {/* Edit Job */}
          {canEdit && (
            <button
              onClick={() => handleAction(onEdit)}
              className={`w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-3 ${
                isRTL ? 'flex-row-reverse text-right' : 'text-left'
              }`}
            >
              <FaEdit className="w-4 h-4 text-blue-600" />
              {t('buttons.edit')}
            </button>
          )}

          {/* Divider */}
          {canCancel && <div className="my-1 border-t border-border" />}

          {/* Cancel Job */}
          {canCancel && (
            <button
              onClick={() => handleAction(onCancel)}
              disabled={cancelLoading}
              className={`w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-3 text-orange-600 hover:text-orange-700 disabled:opacity-50 ${
                isRTL ? 'flex-row-reverse text-right' : 'text-left'
              }`}
            >
              {cancelLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <FaBan className="w-4 h-4" />
              )}
              {cancelLoading ? t('buttons.canceling') : t('buttons.cancel')}
            </button>
          )}

          {/* Delete Job */}
          <button
            onClick={() => handleAction(onDelete)}
            disabled={deleteLoading}
            className={`w-full px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-3 text-destructive hover:text-destructive/80 disabled:opacity-50 ${
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            }`}
          >
            {deleteLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <FaTrash className="w-4 h-4" />
            )}
            {deleteLoading ? t('buttons.deleting') : t('buttons.delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default JobOptionsDropdown;
