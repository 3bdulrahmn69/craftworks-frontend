interface GradientHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientHeader({
  children,
  className = '',
}: GradientHeaderProps) {
  return (
    <div
      className={`p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5 ${className}`}
    >
      {children}
    </div>
  );
}
