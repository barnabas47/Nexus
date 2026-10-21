import React from 'react';

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20 hover:-translate-y-1 ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />
      {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
      {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
};
