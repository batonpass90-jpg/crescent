interface Props {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gold' | 'success' | 'warning' | 'danger';
  padding?: string;
}

const variantClass = {
  default: 'bg-[#0d1117] border-white/[0.06]',
  gold:    'bg-gold/10 border-gold/30',
  success: 'bg-success/10 border-success/30',
  warning: 'bg-warning/10 border-warning/30',
  danger:  'bg-danger/10 border-danger/30',
};

export default function Card({ children, className = '', variant = 'default', padding = 'p-4' }: Props) {
  return (
    <div className={`rounded-xl border ${variantClass[variant]} ${padding} ${className}`}>
      {children}
    </div>
  );
}
