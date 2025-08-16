import { Job } from '@/app/types/jobs';
import Button from '../ui/button';
import { HiPencil, HiTrash, HiEye } from 'react-icons/hi2';

const JobActions = ({
  job,
  session,
  locale,
  t,
  onEdit,
  onViewApplications,
  onDelete,
}: {
  job: Job;
  session: any;
  locale: string;
  t: any;
  onEdit: () => void;
  onViewApplications: () => void;
  onDelete: () => void;
}) => {
  const isJobOwner = job?.client === session?.user?.id;

  if (!isJobOwner) return null;

  const hasApplications = (job.appliedCraftsmen?.length || 0) > 0;
  const canEdit = ['Posted', 'Hired'].includes(job.status);
  const canDelete = job.status === 'Posted';

  return (
    <div
      className={`lg:flex-shrink-0 mb-4 ${
        locale === 'ar' ? 'lg:order-first' : ''
      }`}
    >
      {/* Simple Actions Row */}
      <div className="flex flex-wrap gap-2">
        {/* View Applications */}
        {hasApplications && (
          <Button onClick={onViewApplications} variant="outline" size="default">
            <HiEye className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`} />
            {t('buttons.viewApplications')} ({job.appliedCraftsmen?.length || 0}
            )
          </Button>
        )}

        {/* Edit Job */}
        {canEdit && (
          <Button onClick={onEdit} variant="outline" size="default">
            <HiPencil
              className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
            {t('buttons.editJob')}
          </Button>
        )}

        {/* Delete Job */}
        {canDelete && (
          <Button onClick={onDelete} variant="destructive" size="default">
            <HiTrash
              className={`w-4 h-4 ${locale === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
            {t('buttons.deleteJob')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobActions;
