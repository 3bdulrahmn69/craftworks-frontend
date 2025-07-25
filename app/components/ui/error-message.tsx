interface ErrorMessageProps {
  message: string | null;
  className?: string;
}

export default function ErrorMessage({
  message,
  className = '',
}: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`p-4 rounded-xl bg-destructive/10 border border-destructive/20 ${className}`}
    >
      <p className="text-destructive text-sm font-medium">{message}</p>
    </div>
  );
}
