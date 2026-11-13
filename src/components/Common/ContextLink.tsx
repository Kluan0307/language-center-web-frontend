import type { ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { contextualHref, safeReturn } from '../../utils/contextNavigation';
export function ContextLink({ to, children }: {
    to: string;
    children: ReactNode;
}) { const location = useLocation(); return <Link to={contextualHref(to, location.pathname + location.search)}>{children}</Link>; }
export function ReturnLink() { const [p] = useSearchParams(); const to = safeReturn(p.get('returnTo')); return to ? <Link to={to}>← Quay lại danh sách trước</Link> : null; }
