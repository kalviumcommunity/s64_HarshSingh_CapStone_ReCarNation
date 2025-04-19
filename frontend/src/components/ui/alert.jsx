import React from "react";

const Alert = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      role="alert"
      className={`rounded-lg border p-4 ${className}`}
      {...props}
    />
  );
});

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`text-sm ${className}`}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };