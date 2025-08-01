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
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUserTie,
  FaMapMarkerAlt,
} from 'react-icons/fa';

interface CalendarItem {
  id: string;
  type: 'job';
  title: string;
  status: string;
  date: string;
  jobPrice?: number;
  client?: string;
  location?: string;
  data: Job;
}

const CraftsmanCalendarPage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('calendar');
  const isRTL = locale === 'ar';

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchCalendarData = async () => {
      if (!session?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch craftsman's jobs
        const jobsResponse = await jobsService.getMyJobs(
          {},
          session.accessToken
        );

        const items: CalendarItem[] = [];

        // Process hired jobs
        if (jobsResponse.success && jobsResponse.data) {
          jobsResponse.data.forEach((job: Job) => {
            // Determine the best date to use for calendar display
            const displayDate = job.jobDate || job.createdAt;

            items.push({
              id: job._id,
              type: 'job',
              title: job.title,
              status: job.status,
              date: displayDate,
              jobPrice: job.jobPrice,
              client:
                typeof job.client === 'string' ? job.client : 'Unknown Client',
              location:
                typeof job.address === 'string'
                  ? job.address
                  : job.address?.city && job.address?.state
                  ? `${job.address.city}, ${job.address.state}`
                  : job.address?.city ||
                    job.address?.state ||
                    'Location not specified',
              data: job,
            });
          });
        }

        // Sort items by date
        items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setCalendarItems(items);
      } catch (err: any) {
        console.error('Failed to fetch calendar data:', err);
        setError(err.message || 'Failed to load calendar data');
        toast.error('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
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

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarItems.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const getJobsForCurrentMonth = () => {
    return calendarItems.filter((item) => {
      const itemDate = new Date(item.date);
      return (
        itemDate.getMonth() === currentMonth &&
        itemDate.getFullYear() === currentYear
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
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-blue-50/50 dark:to-blue-900/20 rounded-2xl p-8 border border-primary/20 shadow-lg">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <FaCalendarAlt className="text-white w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-blue-600 bg-clip-text text-transparent">
                  {t('sm.title')}
                </h1>
                <p className="text-lg text-muted-foreground mt-1">
                  {t('sm.subtitle')}
                </p>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-primary/20 shadow-md">
                <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t('stats.totalJobs')}
                </div>
                <div className="text-3xl font-bold text-primary">
                  {calendarItems.length}
                </div>
              </div>

              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 shadow-md">
                <div className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-2">
                  {t('stats.thisMonth')}
                </div>
                <div className="text-3xl font-bold text-blue-600">
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

          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="outline"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 px-6 py-2 font-medium"
          >
            <FaCalendarAlt className="w-4 h-4 mr-2" />
            {t('navigation.today')}
          </Button>
        </div>

        {/* No Jobs This Month */}
        {getJobsForCurrentMonth().length === 0 && (
          <div className="flex flex-col items-center justify-center bg-card rounded-xl border border-border/50 p-12">
            <FaBriefcase className="w-16 h-16 text-muted-foreground mb-4" />
            <p className="text-xl font-semibold text-foreground mb-2">
              {t('noJobs.message')}
            </p>
            <p className="text-muted-foreground">
              Check back later for new job assignments
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3 bg-card rounded-xl border border-border/50 overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-border/50 bg-gradient-to-r from-primary/5 to-blue-50/50 dark:to-blue-900/20">
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

                const dayItems = getItemsForDate(date);
                const isCurrentMonth = isSameMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`h-28 border-b border-r border-border/30 p-2 cursor-pointer hover:bg-primary/5 transition-all duration-200 ${
                      !isCurrentMonth ? 'opacity-40 bg-muted/20' : ''
                    } ${
                      isTodayDate
                        ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20'
                        : ''
                    }`}
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
                      {dayItems.slice(0, 2).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="text-xs p-1 rounded-md text-white bg-gradient-to-r from-blue-500 to-blue-600 truncate shadow-sm"
                          title={item.title}
                        >
                          <FaBriefcase className="w-3 h-3 inline mr-1" />
                          {item.title.substring(0, 12)}
                          {item.title.length > 12 ? '...' : ''}
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayItems.length - 2} more
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
            {/* Selected Date Items */}
            <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <FaBriefcase className="w-5 h-5 text-primary" />
                {selectedDate
                  ? formatDate(selectedDate.toISOString(), locale)
                  : t('sidebar.todayJobs')}
              </h3>

              {(() => {
                const dateToShow = selectedDate || new Date();
                const itemsForDate = getItemsForDate(dateToShow);

                if (itemsForDate.length === 0) {
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
                    {itemsForDate.map((item) => {
                      const job = item.data;

                      return (
                        <div
                          key={item.id}
                          className="border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20 hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm line-clamp-2 leading-tight mb-2">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${getStatusColor(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm">
                            {item.client && (
                              <div className="flex items-center gap-3">
                                <FaUserTie className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Client:
                                </span>
                                <span className="font-medium text-foreground">
                                  {item.client}
                                </span>
                              </div>
                            )}

                            {item.location && (
                              <div className="flex items-center gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Location:
                                </span>
                                <span className="font-medium text-foreground truncate">
                                  {item.location}
                                </span>
                              </div>
                            )}

                            {item.jobPrice && (
                              <div className="flex items-center gap-3">
                                <FaDollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Budget:
                                </span>
                                <span className="font-bold text-green-700 dark:text-green-400">
                                  ${item.jobPrice}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <FaClock className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="text-muted-foreground">
                                Date:
                              </span>
                              <span className="font-medium text-foreground text-xs">
                                {formatDate(item.date, locale)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full h-10 font-medium hover:bg-primary hover:text-white transition-colors"
                              onClick={() => {
                                window.open(`/jobs/${job._id}`, '_blank');
                              }}
                            >
                              <FaEye className="w-4 h-4 mr-2" />
                              {t('actions.view')} Job Details
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
                  <span className="text-sm text-foreground">
                    {t('legend.posted')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-foreground">
                    {t('legend.hired')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-foreground">
                    {t('legend.inProgress')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-foreground">
                    {t('legend.completed')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-foreground">
                    {t('legend.cancelled')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CraftsmanCalendarPage;
