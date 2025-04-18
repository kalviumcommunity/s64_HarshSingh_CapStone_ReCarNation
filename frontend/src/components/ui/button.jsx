import React from "react";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
      outline: "border border-gray-300 bg-white hover:bg-gray-100 focus-visible:ring-gray-500",
      ghost: "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500",
    };
    
    const sizes = {
      default: "h-10 py-2 px-4 text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-base",
    };
    
    const variantStyles = variants[variant] || variants.default;
    const sizeStyles = sizes[size] || sizes.default;
    
    return (
      <button
        type={type}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };