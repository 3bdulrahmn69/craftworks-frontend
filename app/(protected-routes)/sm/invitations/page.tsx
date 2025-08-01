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
  FiCalendar,
  FiEye,
  FiMail,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface InvitationsPageState {
  invitations: Invitation[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  statusFilter: string;
  respondingTo: string | null;
}

interface ResponseModalState {
  isOpen: boolean;
  invitation: Invitation | null;
  responding: boolean;
}

const InvitationsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
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

  const [modalState, setModalState] = useState<ResponseModalState>({
    isOpen: false,
    invitation: null,
    responding: false,
  });

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

  const openResponseModal = useCallback((invitation: Invitation) => {
    setModalState({
      isOpen: true,
      invitation,
      responding: false,
    });
  }, []);

  const closeResponseModal = useCallback(() => {
    setModalState({
      isOpen: false,
      invitation: null,
      responding: false,
    });
  }, []);

  const handleResponse = useCallback(
    async (response: 'accept' | 'reject') => {
      if (!modalState.invitation) return;

      try {
        setModalState((prev) => ({ ...prev, responding: true }));

        await invitationsService.respondToInvitation(
          modalState.invitation._id,
          response,
          'dummy-token' // This would come from auth context
        );

        // Refresh the invitations list
        await fetchInvitations(
          state.pagination.currentPage,
          state.statusFilter
        );

        closeResponseModal();

        // Show success message (you could add a toast notification here)
      } catch (error) {
        console.error('Error responding to invitation:', error);
        // Show error message (you could add a toast notification here)
      } finally {
        setModalState((prev) => ({ ...prev, responding: false }));
      }
    },
    [
      modalState.invitation,
      fetchInvitations,
      state.pagination.currentPage,
      state.statusFilter,
      closeResponseModal,
    ]
  );

  const getStatusBadge = useCallback(
    (status: string) => {
      const statusClasses = {
        pending: 'bg-warning/10 text-warning border border-warning/20',
        accepted: 'bg-success/10 text-success border border-success/20',
        rejected:
          'bg-destructive/10 text-destructive border border-destructive/20',
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusClasses[status as keyof typeof statusClasses] ||
            'bg-muted text-muted-foreground border border-border'
          }`}
        >
          {status === 'pending'
            ? t('invitations.status.pending')
            : status === 'accepted'
            ? t('invitations.status.accepted')
            : status === 'rejected'
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
      { id: 'pending', label: t('invitations.filters.status.pending') },
      { id: 'accepted', label: t('invitations.filters.status.accepted') },
      { id: 'rejected', label: t('invitations.filters.status.rejected') },
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
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
              >
                {/* Header Section with Title and Status */}
                <div
                  className={`flex items-start gap-4 mb-6 ${
                    locale === 'ar' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-start justify-between gap-3 mb-3 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <h3
                        className={`text-xl font-bold text-foreground flex-1 min-w-0 ${
                          locale === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {invitation.job.title}
                      </h3>

                      {/* Status Badge - Responsive positioning */}
                      <div
                        className={`flex-shrink-0 ${
                          locale === 'ar' ? 'order-first' : 'order-last'
                        }`}
                      >
                        {getStatusBadge(invitation.status)}
                      </div>
                    </div>

                    {/* Client Info */}
                    <div
                      className={`flex items-center mb-3 ${
                        locale === 'ar' ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center ${
                          locale === 'ar' ? 'ml-3' : 'mr-3'
                        }`}
                      >
                        <FiUser className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium text-foreground truncate ${
                            locale === 'ar' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {invitation.job.client.name}
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
                              {invitation.job.client.reviewCount || 0} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div
                      className={`flex items-center text-sm text-muted-foreground ${
                        locale === 'ar' ? 'flex-row-reverse justify-end' : ''
                      }`}
                    >
                      <FiDollarSign
                        className={`w-4 h-4 text-success ${
                          locale === 'ar' ? 'ml-2' : 'mr-2'
                        }`}
                      />
                      <span className="font-medium">
                        {t('invitations.card.payment')}:
                      </span>
                      <span
                        className={`${
                          locale === 'ar' ? 'mr-1' : 'ml-1'
                        } truncate`}
                      >
                        {invitation.job.paymentType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div
                  className={`flex items-center pt-4 border-t border-border gap-4 ${
                    locale === 'ar'
                      ? 'flex-col-reverse sm:flex-row-reverse justify-between'
                      : 'flex-col sm:flex-row justify-between'
                  }`}
                >
                  {/* Date Info */}
                  <div
                    className={`flex items-center text-sm text-muted-foreground ${
                      locale === 'ar'
                        ? 'flex-row-reverse justify-end w-full sm:w-auto'
                        : 'w-full sm:w-auto'
                    }`}
                  >
                    <FiCalendar
                      className={`w-4 h-4 text-muted-foreground flex-shrink-0 ${
                        locale === 'ar' ? 'ml-2' : 'mr-2'
                      }`}
                    />
                    <span className="font-medium flex-shrink-0">
                      {t('invitations.card.receivedOn')}
                    </span>
                    <span
                      className={`${
                        locale === 'ar' ? 'mr-1' : 'ml-1'
                      } truncate`}
                    >
                      {formatDate(invitation.createdAt, locale)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className={`flex gap-3 flex-shrink-0 ${
                      locale === 'ar'
                        ? 'flex-row-reverse w-full sm:w-auto justify-end'
                        : 'w-full sm:w-auto justify-start sm:justify-end'
                    }`}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/jobs/${invitation.job._id}`)}
                      className={`flex-1 sm:flex-none min-w-[100px] flex items-center justify-center gap-2 ${
                        locale === 'ar' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <FiEye className="w-4 h-4" />
                      <span>{t('invitations.card.buttons.viewJob')}</span>
                    </Button>
                    {invitation.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openResponseModal(invitation)}
                        className={`flex-1 sm:flex-none min-w-[100px] flex items-center justify-center gap-2 ${
                          locale === 'ar' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <FiMail className="w-4 h-4" />
                        <span>{t('invitations.card.buttons.respond')}</span>
                      </Button>
                    )}
                  </div>
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

      {/* Response Modal */}
      {modalState.isOpen && modalState.invitation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border animate-fadeIn ${
              locale === 'ar' ? 'rtl' : 'ltr'
            }`}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className={`flex justify-between items-center mb-6 ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <h3
                className={`text-xl font-semibold text-foreground ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('invitations.modal.title')}
              </h3>
              <button
                onClick={closeResponseModal}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                aria-label="Close modal"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-muted rounded-xl">
              <h4
                className={`font-medium text-foreground mb-2 ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {modalState.invitation.job.title}
              </h4>
              <p
                className={`text-sm text-muted-foreground ${
                  locale === 'ar' ? 'text-right' : 'text-left'
                }`}
              >
                {t('invitations.modal.client')}:{' '}
                {modalState.invitation.job.client.name}
              </p>
            </div>

            <p
              className={`text-muted-foreground mb-6 ${
                locale === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              {t('invitations.modal.message')}
            </p>

            <div
              className={`flex gap-3 ${
                locale === 'ar' ? 'flex-row-reverse' : ''
              }`}
            >
              <Button
                variant="outline"
                onClick={closeResponseModal}
                disabled={modalState.responding}
                className="flex-1"
              >
                {t('invitations.modal.buttons.cancel')}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleResponse('reject')}
                disabled={modalState.responding}
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {modalState.responding
                  ? t('invitations.modal.buttons.rejecting')
                  : t('invitations.modal.buttons.reject')}
              </Button>

              <Button
                variant="primary"
                onClick={() => handleResponse('accept')}
                disabled={modalState.responding}
                isLoading={modalState.responding}
                loadingText={t('invitations.modal.buttons.accepting')}
                className="flex-1"
              >
                {t('invitations.modal.buttons.accept')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvitationsPage;
