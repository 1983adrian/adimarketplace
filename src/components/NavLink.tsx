import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function NavLink({ to, children, className }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "transition-colors hover:text-foreground/80",
        isActive ? "text-foreground font-medium" : "text-foreground/60",
        className
      )}
    >
      {children}
    </Link>
  );
}
