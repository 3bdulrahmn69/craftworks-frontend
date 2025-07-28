'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Invitation, Pagination } from '@/app/types/jobs';
import { invitationsService } from '@/app/services/jobs';
import Container from '@/app/components/ui/container';
import Button from '@/app/components/ui/button';
import PaginationComponent from '@/app/components/ui/pagination-component';
import { useSession } from 'next-auth/react';

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
          invitations: response.data,
          pagination: response.pagination,
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

  const getStatusBadge = useCallback((status: string) => {
    const statusClasses = {
      pending:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      accepted:
        'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as keyof typeof statusClasses] ||
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
        }`}
      >
        {status === 'pending'
          ? 'Pending'
          : status === 'accepted'
          ? 'Accepted'
          : status === 'rejected'
          ? 'Rejected'
          : status}
      </span>
    );
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' },
    ],
    []
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  if (state.loading && state.invitations.length === 0) {
    return (
      <Container>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded-xl w-1/3"></div>
          <div className="h-6 bg-muted rounded-xl w-1/2"></div>
          <div className="h-12 bg-muted rounded-xl w-64"></div>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl p-6 border border-border space-y-4"
            >
              <div className="flex justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted rounded w-20"></div>
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
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Job Invitations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Review invitations from clients for your expertise
          </p>
        </div>

        {/* Status Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Filter by Status:
          </label>
          <select
            value={state.statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-3 border border-border rounded-xl bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm hover:shadow-md transition-shadow"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error State */}
        {state.error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <svg
                className="w-5 h-5 text-destructive"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-destructive font-medium">{state.error}</p>
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
              Try Again
            </Button>
          </div>
        )}

        {/* Invitations List */}
        {state.invitations.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border max-w-md mx-auto">
              <svg
                className="w-16 h-16 text-muted-foreground mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No invitations found
              </h3>
              <p className="text-muted-foreground mb-4">
                {state.statusFilter !== 'all'
                  ? `No invitations with status "${state.statusFilter}"`
                  : "Clients will send you invitations when they're interested in your work!"}
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
                Refresh Invitations
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {state.invitations.map((invitation) => (
              <div
                key={invitation._id}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Job: {invitation.job.title}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      Client: {invitation.job.client.name}
                    </p>
                    {invitation.job.client.rating && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <svg
                          className="w-4 h-4 mr-1 text-warning"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {invitation.job.client.rating.toFixed(1)} (
                        {invitation.job.client.reviewCount || 0} reviews)
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <svg
                        className="w-4 h-4 mr-2 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      Payment: {invitation.job.paymentType}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(invitation.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6"
                      />
                    </svg>
                    Invited {formatDate(invitation.createdAt)}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/jobs/${invitation.job.id}`, '_blank')
                      }
                    >
                      View Job
                    </Button>
                    {invitation.status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => openResponseModal(invitation)}
                      >
                        Respond
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
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl border border-border animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Respond to Invitation
              </h3>
              <button
                onClick={closeResponseModal}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6 p-4 bg-muted rounded-xl">
              <h4 className="font-medium text-foreground mb-2">
                {modalState.invitation.job.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                Client: {modalState.invitation.job.client.name}
              </p>
            </div>

            <p className="text-muted-foreground mb-6">
              How would you like to respond to this job invitation?
            </p>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={closeResponseModal}
                disabled={modalState.responding}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                onClick={() => handleResponse('reject')}
                disabled={modalState.responding}
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                {modalState.responding ? 'Responding...' : 'Reject'}
              </Button>

              <Button
                variant="primary"
                onClick={() => handleResponse('accept')}
                disabled={modalState.responding}
                isLoading={modalState.responding}
                loadingText="Accepting..."
                className="flex-1"
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvitationsPage;
