export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cursiveletters.in';
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/account/', '/cart/', '/checkout/', '/admin/', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
