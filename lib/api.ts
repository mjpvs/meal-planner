const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function apiPath(route: string): string {
    const normalizedRoute = route.startsWith('/') ? route.slice(1) : route;
    return `${basePath}/api/${normalizedRoute}`;
}
