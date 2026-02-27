import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/45 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    "border border-primary/35 bg-primary text-primary-foreground shadow-[0_16px_34px_-20px_color-mix(in_oklch,var(--primary)_80%,transparent)] hover:bg-primary/92",
                destructive:
                    "border border-destructive/35 bg-destructive text-white shadow-xs hover:bg-destructive/92 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
                outline:
                    "border-border/75 bg-card/70 shadow-xs hover:border-primary/35 hover:bg-muted/55 dark:border-border/70 dark:bg-card/65",
                secondary: "border border-border/65 bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/85",
                ghost: "hover:bg-muted/55 hover:text-foreground dark:hover:bg-accent/50",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-10 px-4 py-2 has-[>svg]:px-3",
                sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg]:px-2.5",
                lg: "h-11 rounded-xl px-6 has-[>svg]:px-4",
                icon: "size-10 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

function Button({
    className,
    variant,
    size,
    asChild = false,
    ...props
}: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : "button";

    return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
