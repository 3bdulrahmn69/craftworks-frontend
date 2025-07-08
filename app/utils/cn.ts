import clsx from 'clsx';

export function cn(...inputs: (string | undefined | false | null)[]) {
  return clsx(inputs);
}
