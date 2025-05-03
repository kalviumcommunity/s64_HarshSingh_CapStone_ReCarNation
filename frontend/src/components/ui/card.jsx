import React from "react";

const Card = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}
      {...props}
    />
  );
});

Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-6 ${className}`}
      {...props}
    />
  );
});

CardContent.displayName = "CardContent";

export { Card, CardContent };