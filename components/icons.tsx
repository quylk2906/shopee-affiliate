import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LinkIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.6 13.4a4.5 4.5 0 0 0 6.4.1l2.5-2.5a4.5 4.5 0 0 0-6.4-6.4l-1.4 1.4" />
      <path d="M13.4 10.6a4.5 4.5 0 0 0-6.4-.1L4.5 13a4.5 4.5 0 0 0 6.4 6.4l1.4-1.4" />
    </IconBase>
  );
}
export function ShieldIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v5c0 4.7 2.9 8.4 7 10 4.1-1.6 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  );
}
export function BoltIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />
    </IconBase>
  );
}
export function GiftIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M20 12v9H4v-9M2 7h20v5H2zM12 7v14" />
      <path d="M12 7H7.5A2.5 2.5 0 1 1 10 4.5L12 7Zm0 0h4.5A2.5 2.5 0 1 0 14 4.5L12 7Z" />
    </IconBase>
  );
}
export function ClipboardIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="7" y="5" width="12" height="16" rx="2" />
      <path d="M9 5V3h6v2M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1" />
    </IconBase>
  );
}
export function CopyIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </IconBase>
  );
}
export function ArrowIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" />
    </IconBase>
  );
}
export function CheckIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="m5 12 4 4L19 6" />
    </IconBase>
  );
}
export function WifiIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 12.6a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01" />
    </IconBase>
  );
}
