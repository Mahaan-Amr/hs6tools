import type { ComponentType, ReactNode } from "react";
import * as LucideIcons from "lucide-react";

interface IconRendererProps {
  name?: string | null;
  className?: string;
  fallback?: ReactNode;
  strokeWidth?: number;
  alt?: string;
}

type LucideModule = Record<string, unknown>;

export function resolveLucideIcon(name?: string | null) {
  if (!name) return null;
  const icon = (LucideIcons as LucideModule)[name];
  return typeof icon === "function"
    ? (icon as ComponentType<{ className?: string; strokeWidth?: number }>)
    : null;
}

function isIconUrl(name?: string | null) {
  if (!name) return false;
  return name.startsWith("/") || name.startsWith("http://") || name.startsWith("https://");
}

export default function IconRenderer({
  name,
  className,
  fallback = null,
  strokeWidth = 2,
  alt = "",
}: IconRendererProps) {
  if (isIconUrl(name)) {
    // Uploaded SVG/PNG/WebP icons are rendered as image assets, not inline markup.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={name!} alt={alt} className={className} loading="lazy" />;
  }

  const Icon = resolveLucideIcon(name);

  if (!Icon) {
    return <>{fallback}</>;
  }

  return <Icon className={className} strokeWidth={strokeWidth} />;
}
