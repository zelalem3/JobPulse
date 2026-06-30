import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  /** Size of the spinner: 'sm' (16px), 'md' (24px), 'lg' (32px), 'xl' (48px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Tailwind text color class, e.g., 'text-blue-600' or 'text-white' */
  color?: string;
  /** Optional message to display below or next to the spinner */
  label?: string;
  /** Direction of the optional label layout */
  layout?: 'vertical' | 'horizontal';
}

export default function Spinner({ 
  size = 'md', 
  color = 'text-blue-600', 
  label, 
  layout = 'vertical' 
}: SpinnerProps) {
  
  // Map size variants to Lucide pixel dimensions
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <div className={`flex items-center justify-center ${isHorizontal ? 'flex-row gap-3' : 'flex-col gap-2'}`}>
      <Loader2 
        className={`animate-spin ${color}`} 
        size={sizeMap[size]} 
      />
      {label && (
        <p className={`text-sm font-semibold text-slate-500 tracking-wide ${isHorizontal ? 'mt-0' : 'mt-1'}`}>
          {label}
        </p>
      )}
    </div>
  );
}