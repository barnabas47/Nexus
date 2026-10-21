import React from 'react';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/30 active:scale-95 disabled:opacity-50 ${className}`}
    >
      <span className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};
