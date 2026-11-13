const pages = ['/dashboard','/my-classes','/my-schedule','/attendance','/exams','/grades','/documents','/reports','/accounts','/administrators','/teachers','/staff','/programs','/courses','/rooms','/leads','/branches','/students', '/tuition', '/payments', '/online-payments', '/support-requests', '/enrollment', '/classes', '/schedule'];
export function safeReturn(value: string | null) {
    if (!value || value.length > 4000 || /[\\\r\n]/.test(value))
        return undefined;
    const [pathname] = value.split('?');
    return pages.includes(pathname) ? value : undefined;
}
export function contextualHref(target: string, current: string) {
    const origin = safeReturn(current);
    if (!origin)
        return target;
    const from = new URL(origin, 'https://local.invalid');
    from.searchParams.delete('returnTo');
    const to = new URL(target, 'https://local.invalid');
    if (to.origin !== 'https://local.invalid' || !pages.includes(to.pathname))
        return target;
    to.searchParams.set('returnTo', from.pathname + from.search);
    return to.pathname + to.search;
}
