'use client';

import { useState, useEffect } from 'react';
import Button from '@/app/components/ui/button';
import Input from '@/app/components/ui/input';
import Modal from '@/app/components/ui/modal';
import { useLocale } from 'next-intl';
import Textarea from '../ui/textarea';

interface QuoteFormData {
  price: number;
  notes: string;
}

interface JobsModalProps {
  job: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: QuoteFormData) => Promise<void>;
  submittingQuote?: boolean;
}

const JobsModal = ({
  job,
  isOpen,
  onClose,
  onSubmit,
  submittingQuote = false,
}: JobsModalProps) => {
  const [quoteForm, setQuoteForm] = useState<QuoteFormData>({
    price: 0,
    notes: '',
  });
  const local = useLocale();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuoteForm({ price: 0, notes: '' });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteForm.price || submittingQuote) return;

    try {
      await onSubmit(quoteForm);
      // Form will be reset by useEffect when modal closes
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error submitting quote:', error);
    }
  };

  if (!job) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit Quote" size="md">
      <div className="mb-6 p-4 bg-muted rounded-xl">
        <h3 className="font-medium text-foreground mb-2">{job.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job.description}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            type="text"
            id="quote-price"
            label={local === 'ar' ? 'سعر العرض' : 'Quote Price'}
            min="1"
            value={quoteForm.price || ''}
            onChange={(e) =>
              setQuoteForm((prev) => ({
                ...prev,
                price: Number(e.target.value),
              }))
            }
            placeholder={
              local === 'ar' ? 'أدخل سعر العرض' : 'Enter your quote price'
            }
            required
          />
        </div>

        <div>
          <Textarea
            id="quote-notes"
            label={
              local === 'ar'
                ? 'ملاحظات إضافية (اختياري)'
                : 'Additional Notes (Optional)'
            }
            value={quoteForm.notes}
            onChange={(e) =>
              setQuoteForm((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            placeholder={
              local === 'ar'
                ? 'أدخل ملاحظات إضافية حول عرضك...'
                : 'Any additional details about your quote...'
            }
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={submittingQuote}
          >
            {local === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="submit"
            disabled={submittingQuote || !quoteForm.price}
            className="flex-1"
            isLoading={submittingQuote}
            loadingText={local === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
          >
            {local === 'ar' ? 'إرسال عرض السعر' : 'Submit Quote'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default JobsModal;
