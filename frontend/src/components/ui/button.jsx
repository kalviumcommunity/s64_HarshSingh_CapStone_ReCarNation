import { cn } from "@/lib/utils";

const Button = ({ 
  children, 
  className,
  variant = "default",
  size = "default",
  ...props 
}) => {
  const variants = {
    default: "bg-brand-blue text-white hover:bg-brand-lightBlue",
    secondary: "bg-brand-orange text-white hover:bg-brand-lightOrange",
    outline: "border border-gray-200 text-gray-800 hover:bg-gray-50",
    ghost: "text-gray-800 hover:bg-gray-100"
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-6 text-lg"
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };