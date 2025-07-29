'use client';

import { useState } from 'react';
import { Service } from '@/app/types/jobs';
import Button from '@/app/components/ui/button';
import DropdownSelector from '@/app/components/ui/dropdown-selector';
import {
  HiSearch,
  HiX,
  HiAdjustments,
  HiChevronDown,
  HiChevronUp,
} from 'react-icons/hi';

interface JobFiltersProps {
  searchQuery: string;
  selectedService: string;
  selectedState: string;
  services: Service[];
  servicesLoading: boolean;
  hasActiveFilters: boolean;
  hasUnappliedChanges: boolean;
  onSearchChange: (query: string) => void;
  onServiceChange: (serviceId: string) => void;
  onStateChange: (state: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

const egyptianStates = [
  { id: 'Cairo', label: 'Cairo' },
  { id: 'Alexandria', label: 'Alexandria' },
  { id: 'Giza', label: 'Giza' },
  { id: 'Dakahlia', label: 'Dakahlia' },
  { id: 'Sharqia', label: 'Sharqia' },
  { id: 'Qalyubia', label: 'Qalyubia' },
  { id: 'Kafr el-Sheikh', label: 'Kafr el-Sheikh' },
  { id: 'Gharbia', label: 'Gharbia' },
  { id: 'Monufia', label: 'Monufia' },
  { id: 'Beheira', label: 'Beheira' },
  { id: 'Minya', label: 'Minya' },
  { id: 'Assiut', label: 'Assiut' },
  { id: 'Sohag', label: 'Sohag' },
  { id: 'Qena', label: 'Qena' },
  { id: 'Aswan', label: 'Aswan' },
  { id: 'Luxor', label: 'Luxor' },
  { id: 'Red Sea', label: 'Red Sea' },
  { id: 'New Valley', label: 'New Valley' },
  { id: 'Matrouh', label: 'Matrouh' },
  { id: 'North Sinai', label: 'North Sinai' },
  { id: 'South Sinai', label: 'South Sinai' },
];

const JobFilters = ({
  searchQuery,
  selectedService,
  selectedState,
  services,
  servicesLoading,
  hasActiveFilters,
  hasUnappliedChanges,
  onSearchChange,
  onServiceChange,
  onStateChange,
  onSearch,
  onReset,
}: JobFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const handleReset = () => {
    onSearchChange('');
    onServiceChange('');
    onStateChange('');
    onReset();
  };

  const activeFilterCount = [
    searchQuery,
    selectedService,
    selectedState,
  ].filter(Boolean).length;

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Enhanced Container with clean design */}
      <div className="bg-card rounded-2xl border border-border shadow-lg relative overflow-hidden">
        <div className="relative p-6">
          {/* Simple Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <HiAdjustments className="w-6 h-6 text-primary" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Job Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white text-xs font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="lg:hidden"
            >
              {isExpanded ? (
                <>
                  <HiChevronUp className="w-4 h-4" />
                  Hide
                </>
              ) : (
                <>
                  <HiChevronDown className="w-4 h-4" />
                  Show
                </>
              )}
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <label
              htmlFor="job-search"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Search Jobs
            </label>
            <div className="relative">
              <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="job-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search by title, description, skills, or keywords..."
                className="w-full pl-12 pr-12 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded transition-all duration-200"
                >
                  <HiX className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Filters - Single Column Layout */}
          <div
            className={`space-y-6 transition-all duration-300 ${
              isExpanded ? 'block opacity-100' : 'hidden lg:block opacity-100'
            }`}
          >
            {/* Service Filter */}
            <div className="space-y-2">
              <div className="relative">
                <DropdownSelector
                  id="job-service-filter"
                  label="Service Category"
                  value={selectedService}
                  onChange={onServiceChange}
                  options={services.map((service) => ({
                    id: service._id,
                    label: service.name,
                  }))}
                  placeholder="Select a service category"
                  allowEmpty
                  emptyLabel="All Services"
                  disabled={servicesLoading}
                />
                {servicesLoading && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {servicesLoading && (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin"></div>
                  Loading services...
                </p>
              )}
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <DropdownSelector
                id="job-state-filter"
                label="Location"
                value={selectedState}
                onChange={onStateChange}
                options={egyptianStates}
                placeholder="Select a location"
                allowEmpty
                emptyLabel="All Locations"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-border">
              <div className="flex flex-col gap-2">
                {/* Apply Filters Button */}
                <Button
                  onClick={onSearch}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium"
                  size="lg"
                  disabled={!searchQuery && !selectedService && !selectedState}
                >
                  Apply Filters
                </Button>

                {/* Clear Filters Button */}
                {(hasActiveFilters || activeFilterCount > 0) && (
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 sm:flex-initial min-w-[120px] border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    size="lg"
                  >
                    <HiX className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Status Messages */}
              {hasUnappliedChanges && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You have {activeFilterCount} filter
                    {activeFilterCount !== 1 ? 's' : ''} ready to apply.
                  </p>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-6 border-t border-border">
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    Active filters:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <HiSearch className="w-3 h-3 mr-1" />
                        Search: &ldquo;{searchQuery}&rdquo;
                      </span>
                    )}
                    {selectedService && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                        Service:{' '}
                        {services.find((s) => s._id === selectedService)?.name}
                      </span>
                    )}
                    {selectedState && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                        Location: {selectedState}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
