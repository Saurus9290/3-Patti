import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children,
  ...props 
}, ref) => {
  const variants = {
    default: 'relative bg-blue-600 text-white border-[3px] border-white/30 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] hover:border-white/60 overflow-hidden',
    destructive: 'relative bg-red-600 text-white border-[3px] border-white/30 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] hover:border-white/60 overflow-hidden',
    outline: 'relative bg-gray-700 text-white border-[3px] border-white/30 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] hover:border-white/60 overflow-hidden',
    secondary: 'relative bg-purple-600 text-white border-[3px] border-white/30 shadow-[0px_10px_20px_rgba(0,0,0,0.2)] hover:border-white/60 overflow-hidden',
    ghost: 'bg-transparent text-white hover:bg-white/10',
    link: 'text-blue-400 underline-offset-4 hover:underline bg-transparent',
  };

  const sizes = {
    default: 'px-5 py-2 text-[15px]',
    sm: 'px-4 py-1.5 text-sm',
    lg: 'px-8 py-3 text-lg',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={cn(
        'group inline-flex items-center justify-center rounded-full font-bold transition-all duration-300 ease-in-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer gap-2.5',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    >
      {/* Shine effect overlay */}
      {variant !== 'ghost' && variant !== 'link' && (
        <span className="absolute top-0 left-[-100px] w-[100px] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-60 group-hover:animate-shine pointer-events-none" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
