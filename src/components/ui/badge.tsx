import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", {
  variants: {
    variant: {
      success: "bg-emerald-100 text-emerald-800",
      danger: "bg-rose-100 text-rose-800",
      neutral: "bg-slate-100 text-slate-700",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
