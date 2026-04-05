interface Props {
  label: string;
  color?: string;
  bg?: string;
  size?: 'sm' | 'md';
}

export default function Badge({ label, color = '#f5c518', bg = 'rgba(245,197,24,0.1)', size = 'sm' }: Props) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${pad}`} style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}
