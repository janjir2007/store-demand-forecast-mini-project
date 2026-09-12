interface IconProps {
  size?: number;
  className?: string;
}

function Svg({ size = 16, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconDashboard = (props: IconProps) => (
  <Svg {...props}>
    <rect x="3" y="3" width="7" height="8" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="11" width="7" height="10" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

export const IconHistory = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 20V5" />
    <path d="M3 20h18" />
    <path d="m6 14 4-4 3.5 3L20 7" />
  </Svg>
);

export const IconForecast = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3 17V5" />
    <path d="M3 20h18" />
    <path d="M6 14l4-3 3 2" />
    <path d="M13 13c3 0 4-3 7-7" strokeDasharray="3 2.5" />
    <path d="M17 6h3v3" />
  </Svg>
);

export const IconProducts = (props: IconProps) => (
  <Svg {...props}>
    <path d="M3.5 8.5 12 4l8.5 4.5v7L12 20l-8.5-4.5z" />
    <path d="M3.5 8.5 12 13l8.5-4.5" />
    <path d="M12 13v7" />
  </Svg>
);

export const IconMenu = (props: IconProps) => (
  <Svg {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (props: IconProps) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const IconSignOut = (props: IconProps) => (
  <Svg {...props}>
    <path d="M15 17v1.5A1.5 1.5 0 0 1 13.5 20h-7A1.5 1.5 0 0 1 5 18.5v-13A1.5 1.5 0 0 1 6.5 4h7A1.5 1.5 0 0 1 15 5.5V7" />
    <path d="M10 12h10m0 0-3-3m3 3-3 3" />
  </Svg>
);

export const IconRefresh = (props: IconProps) => (
  <Svg {...props}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" />
    <path d="M20 4v4h-4" />
  </Svg>
);

export const IconAlert = (props: IconProps) => (
  <Svg {...props} size={props.size ?? 20}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5M12 16h.01" />
  </Svg>
);

export const IconEmpty = (props: IconProps) => (
  <Svg {...props} size={props.size ?? 20}>
    <rect x="3.5" y="5" width="17" height="14" rx="2" />
    <path d="M3.5 10h17M9 19V10" />
  </Svg>
);

export const IconEdit = (props: IconProps) => (
  <Svg {...props} size={props.size ?? 14}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
  </Svg>
);

export const IconTrash = (props: IconProps) => (
  <Svg {...props} size={props.size ?? 14}>
    <path d="M4 7h16M10 7V5h4v2M6 7l1 13h10l1-13" />
  </Svg>
);

export const IconCheck = (props: IconProps) => (
  <Svg {...props} size={props.size ?? 14}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Svg>
);

export const IconSearch = (props: IconProps) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);
