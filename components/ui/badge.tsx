import type { HTMLAttributes } from "react";

import { cn } from "@/app/lib/utils";

export type BadgeVariant = "default" | "secondary" | "outline" | "muted";

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "border-transparent bg-gray-900 text-gray-50 dark:bg-gray-100 dark:text-gray-900",
  secondary:
    "border-transparent bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
  outline:
    "border-gray-300 text-gray-900 dark:border-gray-700 dark:text-gray-100",
  muted:
    "border-transparent bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
