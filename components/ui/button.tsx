import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/app/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-white";

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black dark:hover:bg-white/80",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
  outline:
    "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-800",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3 text-xs",
  lg: "h-10 px-6 text-base",
  icon: "h-9 w-9",
};

export function buttonVariants({
  variant = "default",
  size = "default",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} = {}): string {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size]);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  ),
);

Button.displayName = "Button";
