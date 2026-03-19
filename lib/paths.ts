const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function path(route: string): string {
    const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
    return basePath + normalizedRoute;
}

export function apiPath(route: string): string {
    return path(`/api${route.startsWith('/') ? '' : '/'}${route}`);
}
