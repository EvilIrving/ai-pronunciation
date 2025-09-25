﻿import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/app/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-neutral-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-white",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
