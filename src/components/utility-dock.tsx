type IconProps = { className?: string };

function FocusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 3H4a1 1 0 0 0-1 1v3M13 3h3a1 1 0 0 1 1 1v3M17 13v3a1 1 0 0 1-1 1h-3M7 17H4a1 1 0 0 1-1-1v-3" />
      <path d="m7.5 7.5 5 5M12.5 7.5l-5 5" />
    </svg>
  );
}

function TypeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 5h8M10 5v10M7.5 15h5" />
    </svg>
  );
}

function NoteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="m5.2 13.9 1.1-3.1L13 4.1a1.3 1.3 0 0 1 1.9 0l1 1a1.3 1.3 0 0 1 0 1.9l-6.7 6.7-3.1 1.1-.9-.9Z" />
      <path d="m12 5.1 2.9 2.9" />
    </svg>
  );
}

function CaptionIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.2 4.5h11.6c.9 0 1.7.8 1.7 1.7v6.6c0 .9-.8 1.7-1.7 1.7h-3.9L9.4 17v-2.5H4.2c-.9 0-1.7-.8-1.7-1.7V6.2c0-.9.8-1.7 1.7-1.7Z" />
    </svg>
  );
}

const tools = [
  { label: "Focus mode", Icon: FocusIcon },
  { label: "Reading mode", Icon: TypeIcon },
  { label: "Make a note", Icon: NoteIcon },
  { label: "Open captions", Icon: CaptionIcon },
];

export function UtilityDock() {
  return (
    <nav className="utility-dock page-enter page-enter-4" aria-label="Exhibition tools" data-no-dwell>
      {tools.map(({ label, Icon }) => (
        <button type="button" key={label} aria-label={label} title={label}>
          <Icon />
        </button>
      ))}
    </nav>
  );
}
