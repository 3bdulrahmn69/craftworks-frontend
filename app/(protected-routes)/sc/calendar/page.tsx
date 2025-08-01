'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale, useTranslations } from 'next-intl';
import Container from '@/app/components/ui/container';
import LoadingSpinner from '@/app/components/ui/loading-spinner';
import Button from '@/app/components/ui/button';
import { jobsService } from '@/app/services/jobs';
import { Job } from '@/app/types/jobs';
import { formatDate, getStatusColor } from '@/app/utils/helpers';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaBriefcase,
  FaDollarSign,
  FaEye,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
} from 'react-icons/fa';

interface CalendarJob extends Job {
  jobDate?: string;
}

const CalendarPage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('calendar');
  const isRTL = locale === 'ar';

  const [jobs, setJobs] = useState<CalendarJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchJobsData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const response = await jobsService.getMyJobs({}, session.accessToken);
        
        if (response.success && response.data) {
          setJobs(response.data);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err: any) {
        console.error('Failed to fetch jobs:', err);
        setError(err.message || 'Failed to load jobs');
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, [session?.accessToken]);

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const getNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return jobs.filter((job) => {
      const jobDateStr = job.jobDate 
        ? new Date(job.jobDate).toISOString().split('T')[0]
        : new Date(job.createdAt).toISOString().split('T')[0];
      return jobDateStr === dateStr;
    });
  };

  const getJobsForCurrentMonth = () => {
    return jobs.filter((job) => {
      const jobDate = job.jobDate ? new Date(job.jobDate) : new Date(job.createdAt);
      return (
        jobDate.getMonth() === currentMonth &&
        jobDate.getFullYear() === currentYear
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return (
      date.getMonth() === currentMonth && date.getFullYear() === currentYear
    );
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <Container className={`py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <LoadingSpinner size="lg" />
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('loading.title')}
            </h3>
            <p className="text-muted-foreground">{t('loading.message')}</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={`py-8 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t('error.title')}
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {t('error.retry')}
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className={`py-8 max-w-7xl ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-purple-50/50 dark:to-purple-900/20 rounded-2xl p-8 border border-primary/20 shadow-lg">
          <div className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaCalendarAlt className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-purple-600 bg-clip-text text-transparent">
                  {t('title')}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-md">
                <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t('stats.totalJobs')}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {jobs.length}
                </div>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 shadow-md">
                <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t('stats.thisMonth')}
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {getJobsForCurrentMonth().length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border/50 shadow-sm">
          <div className={`flex items-center gap-4`}>
            <button
              onClick={getPreviousMonth}
              className="p-3 hover:bg-primary/10 rounded-xl transition-colors group"
            >
              {isRTL ? (
                <FaChevronRight className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <FaChevronLeft className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              )}
            </button>

            <h2 className="text-2xl font-bold text-foreground min-w-[250px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h2>

            <button
              onClick={getNextMonth}
              className="p-3 hover:bg-primary/10 rounded-xl transition-colors group"
            >
              {isRTL ? (
                <FaChevronLeft className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <FaChevronRight className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 px-4 py-2 font-medium"
            >
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              {t('navigation.today')}
            </Button>
            
            <Button
              onClick={() => window.location.href = '/sc/create-job'}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 px-4 py-2 font-medium"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create Job
            </Button>
          </div>
        </div>

        {/* No Jobs This Month */}
        {getJobsForCurrentMonth().length === 0 && (
          <div className="flex flex-col items-center justify-center bg-card rounded-xl border border-border/50 p-12">
            <FaBriefcase className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              {t('noJobs.message')}
            </p>
            <p className="text-muted-foreground mb-6">
              Create your first job to get started
            </p>
            <Button
              onClick={() => window.location.href = '/sc/create-job'}
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create Your First Job
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border/50 overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-border/50 bg-gradient-to-r from-primary/5 to-purple-50/50 dark:to-purple-900/20">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center text-sm font-bold text-foreground"
                >
                  {t(`days.${day.toLowerCase()}`)}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7">
              {generateCalendarDays().map((date, index) => {
                if (!date) {
                  return (
                    <div
                      key={index}
                      className="h-28 border-b border-r border-border/30"
                    ></div>
                  );
                }

                const dayJobs = getJobsForDate(date);
                const isCurrentMonth = isSameMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`h-28 border-b border-r border-border/30 p-2 cursor-pointer hover:bg-primary/5 transition-all duration-200 ${
                      !isCurrentMonth ? 'opacity-40 bg-muted/20' : ''
                    } ${isTodayDate ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div
                      className={`text-sm font-bold mb-2 ${
                        isTodayDate ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayJobs.slice(0, 2).map((job, jobIndex) => (
                        <div
                          key={jobIndex}
                          className="text-xs p-1 rounded-md text-white bg-gradient-to-r from-purple-500 to-purple-600 truncate shadow-sm"
                          title={job.title}
                        >
                          <FaBriefcase className="w-3 h-3 inline mr-1" />
                          {job.title.substring(0, 12)}
                          {job.title.length > 12 ? '...' : ''}
                        </div>
                      ))}
                      {dayJobs.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayJobs.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Jobs */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FaBriefcase className="w-5 h-5 text-primary" />
                {selectedDate
                  ? formatDate(selectedDate.toISOString(), locale)
                  : t('sidebar.todayJobs')}
              </h3>

              {(() => {
                const dateToShow = selectedDate || new Date();
                const jobsForDate = getJobsForDate(dateToShow);

                if (jobsForDate.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FaBriefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg">
                        {t('sidebar.noJobs')}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {jobsForDate.map((job) => {
                      return (
                        <div
                          key={job._id}
                          className="border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-900/20 hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm line-clamp-2 leading-tight mb-2">
                                  {job.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getStatusColor(
                                      job.status
                                    )}`}
                                  >
                                    {job.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            {job.address && (
                              <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">Location:</span>
                                <span className="font-medium text-foreground truncate">
                                  {typeof job.address === 'string' 
                                    ? job.address 
                                    : `${job.address.city}, ${job.address.state}`}
                                </span>
                              </div>
                            )}

                            {job.jobPrice && (
                              <div className="flex items-center gap-3">
                                <FaDollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-muted-foreground">Budget:</span>
                                <span className="font-bold text-green-700 dark:text-green-400">
                                  ${job.jobPrice}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <FaClock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="text-muted-foreground">Date:</span>
                              <span className="font-medium text-foreground text-xs">
                                {job.jobDate 
                                  ? formatDate(job.jobDate, locale)
                                  : formatDate(job.createdAt, locale)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 font-medium hover:bg-primary hover:text-white transition-colors"
                              onClick={() => {
                                window.open(`/jobs/${job._id}`, '_blank');
                              }}
                            >
                              <FaEye className="w-4 h-4 mr-1" />
                              {t('actions.view')}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-10 font-medium hover:bg-purple-600 hover:text-white transition-colors"
                              onClick={() => {
                                window.open(`/sc/jobs/${job._id}/edit`, '_blank');
                              }}
                            >
                              <FaEdit className="w-4 h-4 mr-1" />
                              {t('actions.edit')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Job Status Legend */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-foreground mb-4">
                {t('legend.title')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-foreground">{t('legend.posted')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-foreground">{t('legend.hired')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-foreground">{t('legend.inProgress')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">{t('legend.completed')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-foreground">{t('legend.cancelled')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CalendarPage;
