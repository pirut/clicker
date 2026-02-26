const FALLBACK_SITE_URL = "https://clicker.jrbussard.com";

function normalizeSiteUrl(value?: string | null) {
    if (!value) return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const url = new URL(withProtocol);
        return url.toString().replace(/\/$/, "");
    } catch {
        return null;
    }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? FALLBACK_SITE_URL;

export function toAbsoluteUrl(pathOrUrl: string) {
    if (/^https?:\/\//i.test(pathOrUrl)) {
        return pathOrUrl;
    }

    const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
    return new URL(normalizedPath, SITE_URL).toString();
}
