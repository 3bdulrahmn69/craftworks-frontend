'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { HiPaperAirplane, HiPhoto, HiXMark } from 'react-icons/hi2';
import Button from '@/app/components/ui/button';
import { messageService } from '@/app/services/messages';
import { useSession } from 'next-auth/react';
import { toastService } from '@/app/utils/toast';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string, messageType: 'text' | 'image') => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled = false,
}) => {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations('messaging');
  const isRTL = locale === 'ar';

  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setMessage(value);

      // Handle typing indicators
      if (value.trim()) {
        onTypingStart();

        // Clear existing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
          onTypingStop();
        }, 1000);
      } else {
        onTypingStop();
      }

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    },
    [onTypingStart, onTypingStop]
  );

  const clearImageSelection = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!session?.accessToken) return;

    if (selectedImage) {
      // Send image message
      try {
        setIsUploading(true);
        const uploadResponse = await messageService.uploadMessageImage(
          selectedImage,
          session.accessToken
        );

        if (uploadResponse.success) {
          onSendMessage(uploadResponse.data.url, 'image');
          clearImageSelection();
        } else {
          toastService.error(t('error.uploadImage'));
        }
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toastService.error(error.message || t('error.uploadImage'));
      } finally {
        setIsUploading(false);
      }
    } else if (message.trim()) {
      // Send text message
      onSendMessage(message.trim(), 'text');
      setMessage('');
      onTypingStop();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [
    message,
    selectedImage,
    onSendMessage,
    onTypingStop,
    session?.accessToken,
    clearImageSelection,
    t,
  ]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleImageSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toastService.error(t('imageUpload.invalidFormat'));
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toastService.error(t('imageUpload.maxSize'));
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [t]
  );

  const canSend =
    !disabled && (message.trim() || selectedImage) && !isUploading;

  return (
    <div className="border-t border-border bg-background p-4">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 p-3 border border-border rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {t('imageUpload.preview')}
            </span>
            <button
              onClick={clearImageSelection}
              className="p-1 hover:bg-destructive/10 rounded text-destructive"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          </div>
          <Image
            src={imagePreview}
            alt="Preview"
            width={128}
            height={128}
            className="max-w-32 max-h-32 object-cover rounded border"
          />
        </div>
      )}

      {/* Input area */}
      <div
        className={`flex items-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {/* Image upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title={t('message.attachImage')}
        >
          <HiPhoto className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={t('message.typeMessage')}
            disabled={disabled}
            className={`
              w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              resize-none max-h-[120px] overflow-y-auto
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isRTL ? 'text-right' : 'text-left'}
            `}
            rows={1}
            style={{ minHeight: '40px' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!canSend}
          size="sm"
          className="p-2 h-10 w-10 rounded-xl"
          isLoading={isUploading}
        >
          <HiPaperAirplane className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
};

export default MessageInput;
