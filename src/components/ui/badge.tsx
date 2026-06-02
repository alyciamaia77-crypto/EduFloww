import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        outline: "text-gray-700 border border-gray-300 dark:text-gray-300 dark:border-gray-600",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
