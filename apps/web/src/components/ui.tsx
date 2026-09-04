import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/utils";

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "gold" | "danger" | "outline";
}) {
  const styles = {
    primary: "green-gradient text-white hover:brightness-105 shadow-soft",
    gold: "green-gradient text-white hover:brightness-105 shadow-soft",
    ghost: "bg-transparent text-ink hover:bg-primary-100",
    danger: "bg-earth-700 text-white hover:bg-earth-500",
    outline:
      "border border-primary-800/20 bg-white/70 text-primary-800 hover:border-primary-600 hover:bg-primary-100",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white/90 p-5 shadow-soft backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-primary-600 focus:ring-2 focus:ring-primary-500/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary-600",
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-forest-700/70">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "forest",
}: {
  children: ReactNode;
  tone?: "forest" | "gold" | "earth" | "muted";
}) {
  const map = {
    forest: "bg-forest-100 text-forest-800",
    gold: "bg-gold-200 text-forest-900",
    earth: "bg-earth-200 text-earth-700",
    muted: "bg-cream-200 text-forest-700",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        map,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <Card className="py-12 text-center">
      <p className="font-display text-xl text-forest-800">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-forest-700/70">{hint}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

export function Spinner() {
  return (
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-forest-700/20 border-t-gold-500" />
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl text-forest-900">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-forest-700/70">{subtitle}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
