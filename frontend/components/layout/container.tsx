import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidths = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  as: Tag = "div",
  size = "lg",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        maxWidths[size],
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  spacing?: "sm" | "md" | "lg" | "xl";
  bg?: "default" | "alt" | "olive" | "gold" | "brown";
}

const spacings = {
  sm: "py-10 md:py-14",
  md: "py-14 md:py-20",
  lg: "py-20 md:py-28",
  xl: "py-24 md:py-36",
};

const bgs = {
  default: "bg-background",
  alt:     "bg-section-alt",
  olive:   "bg-olive-gradient text-primary-foreground",
  gold:    "bg-gold-gradient text-foreground",
  brown:   "bg-brown-gradient text-primary-foreground",
};

export function Section({
  as: Tag = "section",
  spacing = "lg",
  bg = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(spacings[spacing], bgs[bg], "relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
