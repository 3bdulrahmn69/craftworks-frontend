'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Invitation, Pagination } from '@/app/types/jobs';
import { invitationsService } from '@/app/services/jobs';
import { formatDate } from '@/app/utils/helpers';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import DropdownSelector from '@/app/components/ui/dropdown-selector';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { useSession } from 'next-auth/react';
import { IoTicketSharp } from 'react-icons/io5';
import {
  FiUser,
  FiStar,
  FiDollarSign,
  FiEye,
  FiMail,
  FiAlertCircle,
  FiX,
  FiClock,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Image from 'next/image';
import Link from 'next/link';

interface InvitationsPageState {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statusFilter: string;
  respondingTo: string | null;
}

const InvitationsPage = () => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations();

  const [state, setState] = useState<InvitationsPageState>({
    invitations: [],
    loading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10,
      hasNext: false,
      hasPrev: false,
    },
    statusFilter: 'all',
    respondingTo: null,
  });

  // Track direct responses to prevent multiple clicks
  const [directResponding, setDirectResponding] = useState<{
    invitationId: string;
    action: 'accept' | 'reject';
  } | null>(null);

  const fetchInvitations = useCallback(
    async (page: number = 1, status: string = 'all') => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
        });

        if (status !== 'all') {
          params.append('status', status);
        }

        const response = await invitationsService.getMyInvitations(
          params.toString(),
          session?.accessToken
        );

        console.log('Fetched invitations:', response);

        setState((prev) => ({
          ...prev,
          invitations: response.data || [],
          pagination: response.pagination || prev.pagination,
          loading: false,
        }));
      } catch (error) {
        console.error('Error fetching invitations:', error);
        setState((prev) => ({
          ...prev,
          error: 'Failed to fetch invitations',
          loading: false,
        }));
      }
    },
    [session?.accessToken]
  );

  useEffect(() => {
    fetchInvitations(state.pagination.currentPage, state.statusFilter);
  }, [fetchInvitations, state.pagination.currentPage, state.statusFilter]);

  const handleStatusFilter = useCallback((status: string) => {
    setState((prev) => ({
      ...prev,
      statusFilter: status,
      pagination: { ...prev.pagination, currentPage: 1 },
    }));
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: newPage },
    }));
  }, []);

  // Direct response handler for card buttons
  const handleDirectResponse = useCallback(
    async (invitation: Invitation, response: 'Accepted' | 'Rejected') => {
      if (!session?.accessToken) return;

      try {
        setDirectResponding({
          invitationId: invitation._id,
          action: response.toLowerCase() as 'accept' | 'reject',
        });

        await invitationsService.respondToJobInvitation(
          invitation.job._id,
          response,
          session.accessToken
        );

        // Update the local state immediately for better UX
        setState((prev) => ({
          ...prev,
          invitations: prev.invitations.map((inv) =>
            inv._id === invitation._id
              ? { ...inv, status: response as any }
              : inv
          ),
        }));

        // Show success message
        toast.success(
          t(`invitations.messages.${response}Success`) ||
            `Invitation ${response} successfully!`
        );

        // Refresh the full list to ensure consistency
        setTimeout(() => {
          fetchInvitations(state.pagination.currentPage, state.statusFilter);
        }, 1000);
      } catch (error: any) {
        console.error('Error responding to invitation:', error);
        toast.error(
          error.message ||
            t('invitations.messages.responseError') ||
            'Failed to respond to invitation'
        );
      } finally {
        setDirectResponding(null);
      }
    },
    [
      session?.accessToken,
      fetchInvitations,
      state.pagination.currentPage,
      state.statusFilter,
      t,
    ]
  );

  const getStatusBadge = useCallback(
    (status: string) => {
      const statusClasses = {
        Pending: 'bg-warning/10 text-warning border border-warning/20',
        Accepted: 'bg-success/10 text-success border border-success/20',
        Rejected:
          'bg-destructive/10 text-destructive border border-destructive/20',
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusClasses[status as keyof typeof statusClasses] ||
            'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {status === 'Pending'
            ? t('invitations.status.pending')
            : status === 'Accepted'
            ? t('invitations.status.accepted')
            : status === 'Rejected'
            ? t('invitations.status.rejected')
            : status}
        </span>
      );
    },
    [t]
  );

  const statusOptions = useMemo(
    () => [
      { id: 'all', label: t('invitations.filters.status.all') },
      { id: 'Pending', label: t('invitations.filters.status.pending') },
      { id: 'Accepted', label: t('invitations.filters.status.accepted') },
      { id: 'Rejected', label: t('invitations.filters.status.rejected') },
    ],
    [t]
  );

  if (state.loading && state.invitations.length === 0) {
    return (
      <Container className={`py-8 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
        <div className="animate-pulse space-y-6">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-muted rounded-xl w-1/3 mb-4"></div>
            <div className="h-6 bg-muted rounded-xl w-1/2"></div>
          </div>

          {/* Filter skeleton */}
          <div className="h-16 bg-muted rounded-xl w-64 mb-8"></div>

          {/* Card skeletons */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border space-y-6"
            >
              {/* Header section */}
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded w-40"></div>
                </div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>

              {/* Footer section */}
              <div className="flex justify-between items-center pt-4 border-t border-border">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="flex gap-3">
                  <div className="h-8 bg-muted rounded w-24"></div>
                  <div className="h-8 bg-muted rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className={`py-8 ${locale === 'ar' ? 'rtl' : 'ltr'}`}>
        {/* Header */}
        <header className="mb-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 flex items-center">
            <IoTicketSharp
              className={`text-primary ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}
              size={32}
            />
            {t('invitations.title')}
          </h1>
          <p
            className={`text-xl text-muted-foreground max-w-3xl ${
              locale === 'ar' ? 'text-right' : 'text-left'
            }`}
          >
            {t('invitations.subtitle')}
          </p>
        </header>

        {/* Status Filter */}
        <div className="mb-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <DropdownSelector
            id="status-filter"
            label={t('invitations.filters.status.label')}
            options={statusOptions}
            value={state.statusFilter}
            onChange={handleStatusFilter}
            placeholder="Select status"
            className="max-w-xs"
          />
        </div>

        {/* Error State */}
        {state.error && (
          <div
            className={`bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8 ${
              locale === 'ar' ? 'rtl' : 'ltr'
            }`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className={`flex items-center gap-3 mb-3 ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <FiAlertCircle className="w-5 h-5 text-destructive" />
              <p
                className={`text-destructive font-medium ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {state.error}
              </p>
            </div>
            <Button
              onClick={() =>
                fetchInvitations(
                  state.pagination.currentPage,
                  state.statusFilter
                )
              }
              variant="outline"
              className="mt-2"
            >
              {t('invitations.error.retry')}
            </Button>
          </div>
        )}

        {/* Invitations List */}
        {state.invitations.length === 0 ? (
          <div className={`text-center py-16`}>
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
              <FiMail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className={`text-lg font-semibold text-foreground mb-2`}>
                {t('invitations.empty.title')}
              </h3>
              <p className={`text-muted-foreground mb-4 `}>
                {state.statusFilter !== 'all'
                  ? `${t('invitations.filters.status.label')} "${
                      state.statusFilter
                    }"`
                  : t('invitations.empty.message')}
              </p>
              <Button
                onClick={() =>
                  fetchInvitations(
                    state.pagination.currentPage,
                    state.statusFilter
                  )
                }
                size="lg"
              >
                {t('invitations.error.retry')}
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`space-y-6 ${locale === 'ar' ? 'rtl' : 'ltr'}`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {state.invitations.map((invitation) => (
              <div
                key={invitation._id}
                className={`bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border relative overflow-hidden ${
                  invitation.status === 'Accepted'
                    ? 'ring-2 ring-success/20 bg-success/5'
                    : invitation.status === 'Rejected'
                    ? 'ring-2 ring-destructive/20 bg-destructive/5'
                    : ''
                }`}
              >
                {/* Header Section with Title and Status */}
                <div
                  className={`flex items-start gap-4 mb-6 ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-start justify-between gap-3 mb-4 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-xl font-bold text-foreground mb-2 ${
                            locale === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {invitation.job.title}
                        </h3>

                        {/* Invitation Type Badge */}
                        <div
                          className={`flex items-center gap-2 mb-3 ${
                            locale === 'ar'
                              ? 'flex-row-reverse justify-end'
                              : ''
                          }`}
                        >
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            <FiMail
                              className={`w-3 h-3 ${
                                locale === 'ar' ? 'ml-1' : 'mr-1'
                              }`}
                            />
                            {t('invitations.card.directInvitation') ||
                              'Direct Invitation'}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`flex-shrink-0 ${
                          locale === 'ar' ? 'order-first' : 'order-last'
                        }`}
                      >
                        {getStatusBadge(invitation.status)}
                      </div>
                    </div>

                    {/* Client Info - Enhanced */}
                    <div
                      className={`flex items-center mb-4 p-3 bg-muted/30 rounded-lg ${
                        locale === 'ar' ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <div
                        className={`w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 ${
                          locale === 'ar' ? 'ml-3' : 'mr-3'
                        }`}
                      >
                        {invitation.job.client.profilePicture ? (
                          <Image
                            width={48}
                            height={48}
                            src={invitation.job.client.profilePicture}
                            alt={invitation.job.client.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <FiUser className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-semibold text-foreground mb-1 ${
                            locale === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {t('invitations.card.clientLabel') || 'Client'}:{' '}
                          {invitation.job.client.fullName}
                        </p>
                        {invitation.job.client.rating && (
                          <div
                            className={`flex items-center text-xs text-muted-foreground ${
                              locale === 'ar'
                                ? 'flex-row-reverse justify-end'
                                : ''
                            }`}
                          >
                            <FiStar
                              className={`w-3 h-3 text-warning ${
                                locale === 'ar' ? 'ml-1' : 'mr-1'
                              }`}
                            />
                            <span>
                              {invitation.job.client.rating.toFixed(1)} (
                              {invitation.job.client.ratingCount || 0} ratings)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {/* Payment Info */}
                      <div
                        className={`flex items-center text-sm p-2 bg-success/5 rounded-lg `}
                      >
                        <FiDollarSign
                          className={`w-4 h-4 text-success ${
                            locale === 'ar' ? 'ml-2' : 'mr-2'
                          }`}
                        />
                        <span className="font-medium text-foreground">
                          {t('invitations.card.payment')}:
                        </span>
                        <span
                          className={`${
                            locale === 'ar' ? 'mr-1' : 'ml-1'
                          } text-success font-medium`}
                        >
                          {t(
                            `invitations.card.paymentTypes.${invitation.job.paymentType.toLowerCase()}`
                          )}
                        </span>
                      </div>

                      {/* Date Info */}
                      <div
                        className={`flex items-center text-sm p-2 bg-muted/20 rounded-lg `}
                      >
                        <FiClock
                          className={`w-4 h-4 text-muted-foreground ${
                            locale === 'ar' ? 'ml-2' : 'mr-2'
                          }`}
                        />
                        <span className="font-medium text-foreground">
                          {t('invitations.card.receivedOn') || 'Received'}:
                        </span>
                        <span
                          className={`${
                            locale === 'ar' ? 'mr-1' : 'ml-1'
                          } text-muted-foreground`}
                        >
                          {formatDate(invitation.createdAt, locale)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Footer Section with Direct Response Buttons */}
                <div
                  className={`flex items-center justify-between pt-4 border-t border-border gap-4 ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  {/* View Job Button */}
                  <Link href={`/jobs/${invitation.job._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex items-center gap-2 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <FiEye className="w-4 h-4" />
                      <span>
                        {t('invitations.card.buttons.viewJob') || 'View Job'}
                      </span>
                    </Button>
                  </Link>

                  {/* Direct Response Buttons */}
                  {invitation.status === 'Pending' ? (
                    <div
                      className={`flex gap-2 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDirectResponse(invitation, 'Rejected')
                        }
                        disabled={
                          directResponding?.invitationId === invitation._id &&
                          directResponding?.action === 'reject'
                        }
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        {directResponding?.invitationId === invitation._id &&
                        directResponding?.action === 'reject' ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <FiX className="w-4 h-4" />
                        )}
                        <span className={locale === 'ar' ? 'mr-1' : 'ml-1'}>
                          {t('invitations.card.buttons.reject') || 'Reject'}
                        </span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() =>
                          handleDirectResponse(invitation, 'Accepted')
                        }
                        disabled={
                          directResponding?.invitationId === invitation._id &&
                          directResponding?.action === 'accept'
                        }
                        className="bg-success hover:bg-success/80 text-white"
                      >
                        {directResponding?.invitationId === invitation._id &&
                        directResponding?.action === 'accept' ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <FiMail className="w-4 h-4" />
                        )}
                        <span className={locale === 'ar' ? 'mr-1' : 'ml-1'}>
                          {t('invitations.card.buttons.accept') || 'Accept'}
                        </span>
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`flex items-center gap-2 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span className="text-sm text-muted-foreground">
                        {invitation.status === 'Accepted'
                          ? t('invitations.card.status.accepted') ||
                            'You accepted this invitation'
                          : t('invitations.card.status.rejected') ||
                            'You rejected this invitation'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <PaginationComponent
          pagination={state.pagination}
          onPageChange={handlePageChange}
          isLoading={state.loading}
        />
      </Container>
    </>
  );
};

export default InvitationsPage;
