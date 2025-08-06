import { HiBadgeCheck } from "react-icons/hi";
import { HiLockClosed, HiUser } from "react-icons/hi2";

export const settingsOptions = [
  {
    title: 'Personal Information',
    description:
      'Update your profile details, contact information, and address',
    href: '/settings/personal',
    icon: HiUser,
  },
  {
    title: 'Security',
    description: 'Change your password and manage security preferences',
    href: '/settings/security',
    icon: HiLockClosed,
  },
  {
    title: 'Verification',
    description: 'Verify your identity and account for added security',
    href: '/settings/verification',
    icon: HiBadgeCheck,
  },
];
