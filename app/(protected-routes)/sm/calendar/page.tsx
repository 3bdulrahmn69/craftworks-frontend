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
import { useRouter } from 'next/navigation';

interface CalendarItem {
  id: string;
  type: 'job';
  title: string;
  status: string;
  date: string;
  jobPrice?: number;
  client?: string;
  clientPhone?: string;
  location?: string;
  data: Job;
}

const CraftsmanCalendarPage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('calendar');
  const isRTL = locale === 'ar';
  const router = useRouter();

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
                typeof job.client === 'object' && job.client?.fullName
                  ? job.client.fullName
                  : typeof job.client === 'string'
                  ? job.client
                  : 'Unknown Client',
              clientPhone:
                typeof job.client === 'object' && job.client?.phone
                  ? job.client.phone
                  : undefined,
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
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-primary/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-primary/20 shadow-lg">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6`}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-primary via-primary/90 to-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                <FaCalendarAlt className="text-white w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">
                  {t('sm.title')}
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1">
                  {t('sm.subtitle')}
                </p>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <div className="bg-card/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20 shadow-md">
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1 sm:mb-2">
                  {t('stats.totalJobs')}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {calendarItems.length}
                </div>
              </div>

              <div className="bg-card/70 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-primary/20 shadow-md">
                <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1 sm:mb-2">
                  {t('stats.thisMonth')}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {getJobsForCurrentMonth().length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card rounded-lg sm:rounded-xl p-3 sm:p-4 border border-border/50 shadow-sm">
          <div
            className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-4`}
          >
            <button
              onClick={getPreviousMonth}
              className="p-2 sm:p-3 hover:bg-primary/10 rounded-lg sm:rounded-xl transition-colors group"
            >
              {isRTL ? (
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
              )}
            </button>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground min-w-[200px] sm:min-w-[250px] text-center">
              {t(`months.${monthNames[currentMonth].toLowerCase()}`)}{' '}
              {currentYear}
            </h2>

            <button
              onClick={getNextMonth}
              className="p-2 sm:p-3 hover:bg-primary/10 rounded-lg sm:rounded-xl transition-colors group"
            >
              {isRTL ? (
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
              ) : (
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="outline"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 px-4 sm:px-6 py-2 text-sm font-medium"
          >
            <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* Calendar Grid */}
          <div className="xl:col-span-3 bg-card rounded-lg sm:rounded-xl border border-border/50 overflow-hidden shadow-lg">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/5">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-2 sm:p-3 lg:p-4 text-center text-xs sm:text-sm font-bold text-foreground"
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
                      className="h-20 sm:h-24 lg:h-28 border-b border-r border-border/30"
                    ></div>
                  );
                }

                const dayItems = getItemsForDate(date);
                const isCurrentMonth = isSameMonth(date);
                const isTodayDate = isToday(date);

                return (
                  <div
                    key={index}
                    className={`h-20 sm:h-24 lg:h-28 border-b border-r border-border p-1 sm:p-2 cursor-pointer hover:bg-primary/5 transition-all duration-200 ${
                      !isCurrentMonth ? 'opacity-40 bg-muted/20' : ''
                    } ${
                      isTodayDate
                        ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/20'
                        : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div
                      className={`text-xs sm:text-sm font-bold mb-1 sm:mb-2 p-1 ${
                        isTodayDate ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      {dayItems.slice(0, 2).map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="text-xs p-0.5 sm:p-1 rounded-md text-primary-foreground bg-gradient-to-r from-primary to-primary truncate shadow-sm"
                          title={item.title}
                        >
                          <FaBriefcase className="w-2 h-2 sm:w-3 sm:h-3 inline mr-0.5 sm:mr-1" />
                          <span className="text-xs">
                            {item.title.substring(0, 8)}
                            {item.title.length > 8 ? '...' : ''}
                          </span>
                        </div>
                      ))}
                      {dayItems.length > 2 && (
                        <div className="text-xs text-muted-foreground font-medium">
                          +{dayItems.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Selected Date Items */}
            <div className="bg-card rounded-lg sm:rounded-xl border border-border/50 p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                <FaBriefcase className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="truncate">
                  {selectedDate
                    ? formatDate(selectedDate.toISOString(), locale)
                    : t('sidebar.todayJobs')}
                </span>
              </h3>

              {(() => {
                const dateToShow = selectedDate || new Date();
                const itemsForDate = getItemsForDate(dateToShow);

                if (itemsForDate.length === 0) {
                  return (
                    <div className="text-center py-8 sm:py-12">
                      <FaBriefcase className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                      <p className="text-muted-foreground text-base sm:text-lg">
                        {t('sidebar.noJobs')}
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3 sm:space-y-4">
                    {itemsForDate.map((item) => {
                      const job = item.data;

                      return (
                        <div
                          key={item.id}
                          className="border border-border/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-primary/10 to-transparent hover:border-primary/40"
                        >
                          <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                                <FaBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 leading-tight mb-2">
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium shadow-sm ${getStatusColor(
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
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <FaUserTie className="w-4 h-4 text-primary flex-shrink-0" />
                                  <span className="text-muted-foreground text-xs sm:text-sm">
                                    Client:
                                  </span>
                                  <span className="font-medium text-foreground text-xs sm:text-sm truncate">
                                    {item.client}
                                  </span>
                                </div>
                                {item.clientPhone && (
                                  <div className="flex items-center gap-2 sm:gap-3 ml-5 sm:ml-7">
                                    <span className="text-muted-foreground text-xs">
                                      Phone:
                                    </span>
                                    <span className="font-medium text-foreground text-xs">
                                      {item.clientPhone}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {item.location && (
                              <div className="flex items-center gap-2 sm:gap-3">
                                <FaMapMarkerAlt className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-muted-foreground text-xs sm:text-sm">
                                  Location:
                                </span>
                                <span className="font-medium text-foreground text-xs sm:text-sm truncate">
                                  {item.location}
                                </span>
                              </div>
                            )}

                            {item.jobPrice && (
                              <div className="flex items-center gap-2 sm:gap-3">
                                <FaDollarSign className="w-4 h-4 text-success flex-shrink-0" />
                                <span className="text-muted-foreground text-xs sm:text-sm">
                                  Budget:
                                </span>
                                <span className="font-bold text-success text-xs sm:text-sm">
                                  ${item.jobPrice}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 sm:gap-3">
                              <FaClock className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-muted-foreground text-xs sm:text-sm">
                                Date:
                              </span>
                              <span className="font-medium text-foreground text-xs">
                                {formatDate(item.date, locale)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border/30">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center justify-center w-full h-9 sm:h-10 text-xs sm:text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:scale-[1.02] border-primary/30 hover:border-primary/50 shadow-sm hover:shadow-md group"
                              onClick={() => {
                                router.push(`/jobs/${job._id}`);
                              }}
                            >
                              <FaEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200" />
                              {t('sidebar.viewJob')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CraftsmanCalendarPage;
