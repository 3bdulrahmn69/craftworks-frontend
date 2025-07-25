import Link from 'next/link';
import { memo } from 'react';

const Logo = memo(function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
    >
      <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-xl" aria-hidden="true">
          C
        </span>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
        CraftWorks
      </span>
      <span className="sr-only">CraftWorks - Go to homepage</span>
    </Link>
  );
});

export default Logo;
