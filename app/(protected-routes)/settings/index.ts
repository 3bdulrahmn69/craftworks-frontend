import { HiBadgeCheck } from 'react-icons/hi';
import { HiLockClosed, HiUser } from 'react-icons/hi2';

export const settingsOptions = [
  {
    title: 'Personal Information',
    description:
      'Update your profile details, contact information, and address',
    href: '/settings/personal',
    icon: HiUser,
    titleKey: 'personal',
  },
  {
    title: 'Security',
    description: 'Change your password and manage security preferences',
    href: '/settings/security',
    icon: HiLockClosed,
    titleKey: 'security',
  },
  {
    title: 'Verification',
    description: 'Verify your identity and account for added security',
    href: '/settings/verification',
    icon: HiBadgeCheck,
    titleKey: 'verification',
  },
];
