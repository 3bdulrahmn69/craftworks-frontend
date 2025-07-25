'use client';

import { useRouter } from 'next/navigation';
import { FaHome } from 'react-icons/fa';

interface HomeButtonProps {
  label?: string;
  className?: string;
}

export default function HomeButton({
  label = 'Go to home',
  className = '',
}: HomeButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className={`absolute top-6 left-6 z-50 p-3 bg-card/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 border border-border/50 group ${className}`}
      aria-label={label}
    >
      <FaHome className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
    </button>
  );
}
