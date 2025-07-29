'use client';

import Button from '@/app/components/ui/button';
import { HiBriefcase, HiRefresh, HiFilter } from 'react-icons/hi';

interface EmptyStateProps {
  hasFilters: boolean;
  onRefresh: () => void;
  onClearFilters?: () => void;
}

const EmptyState = ({
  hasFilters,
  onRefresh,
  onClearFilters,
}: EmptyStateProps) => {
  return (
    <div className="text-center py-20">
      <div className="bg-card rounded-3xl shadow-lg p-12 border border-border max-w-lg mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
          <HiBriefcase className="w-12 h-12 text-primary" />
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-4">
          {hasFilters ? 'No Jobs Match Your Filters' : 'No Jobs Available'}
        </h3>

        <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          {hasFilters
            ? 'Try adjusting your search criteria or removing some filters to see more job opportunities.'
            : 'There are no job postings at the moment. Check back later for new opportunities or try refreshing the page.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRefresh} size="lg" className="min-w-[140px]">
            <HiRefresh className="w-4 h-4 mr-2" />
            Refresh Jobs
          </Button>

          {hasFilters && onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              size="lg"
              className="min-w-[140px]"
            >
              <HiFilter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Enable notifications to get alerted when
            new jobs matching your skills are posted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
