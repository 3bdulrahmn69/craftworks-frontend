import React, { memo } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import Button from './button';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  page?: number; // Alternative naming from API
  hasNextPage?: boolean; // Alternative naming from API
  hasPrevPage?: boolean; // Alternative naming from API
}

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  className?: string;
}

const PaginationComponent = memo(function Pagination({
  pagination,
  onPageChange,
  isLoading = false,
  className = '',
}: PaginationProps) {
  // Normalize pagination data to handle different API response formats
  const currentPage = pagination.currentPage || pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.totalItems || 0;
  const hasNext = pagination.hasNext || pagination.hasNextPage || false;
  const hasPrev = pagination.hasPrev || pagination.hasPrevPage || false;

  // Don't render if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }

  const handlePreviousPage = () => {
    if (hasPrev && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`flex justify-center items-center gap-6 mt-12 ${className}`}
    >
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={!hasPrev || isLoading}
          className="px-4 py-2"
        >
          <HiChevronLeft className="w-4 h-4 mr-2" />
        </Button>

        <div className="flex items-center gap-4 px-4">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={!hasNext || isLoading}
          className="px-4 py-2"
        >
          <HiChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
});

export default PaginationComponent;
