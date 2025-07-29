import { toast, TypeOptions } from 'react-toastify';

interface ToastOptions {
  type?: TypeOptions;
  autoClose?: number;
  position?:
    | 'top-right'
    | 'top-center'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-center'
    | 'bottom-left';
}

class ToastService {
  private defaultOptions: ToastOptions = {
    autoClose: 4000,
    position: 'bottom-right',
  };

  success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  info(message: string, options?: ToastOptions) {
    return toast.info(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  warning(message: string, options?: ToastOptions) {
    return toast.warning(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  promise<T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ) {
    return toast.promise(promise, messages, {
      ...this.defaultOptions,
      ...options,
    });
  }

  dismiss(toastId?: string | number) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }
}

export const toastService = new ToastService();
