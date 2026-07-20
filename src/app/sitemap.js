export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cursiveletters.in';

    // 1. Static Routes
    const staticRoutes = [
        { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/terms-and-conditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ];

    // 2. Fetch categories
    // The categories table uses categoryID as the URL identifier (no slug column in DB)
    let categoryRoutes = [];
    try {
        const res = await fetch(`${apiBase}/categories`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const categories = data?.categories || [];
            categoryRoutes = categories
                .filter(cat => cat.categoryID) // skip any entry without a valid ID
                .map(cat => ({
                    url: `${siteUrl}/categories/${cat.categoryID}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.8
                }));
        }
    } catch (err) {
        console.error('Error fetching categories for sitemap:', err);
    }

    // 3. Fetch ALL products
    // limit=1000 covers 400+ products; response shape is { data: { products: [], pagination: {} } }
    let productRoutes = [];
    try {
        const res = await fetch(`${apiBase}/products/list?limit=1000&status=active`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const products = data?.data?.products || [];
            productRoutes = products.map(prod => ({
                url: `${siteUrl}/products/${prod.productID}`,
                lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7
            }));
        }
    } catch (err) {
        console.error('Error fetching products for sitemap:', err);
    }

    // 4. Fetch blog posts (published only — returns { data: [{ slug, lastmod }] })
    let blogRoutes = [];
    try {
        const res = await fetch(`${apiBase}/blog/sitemap-data`, { next: { revalidate: 3600 } });
        if (res.ok) {
            const data = await res.json();
            const posts = data?.data || [];
            blogRoutes = posts.map(post => {
                // Safe date parsing — DB updatedAt can be null
                const date = new Date(post.lastmod);
                return {
                    url: `${siteUrl}/blog/${post.slug}`,
                    lastModified: isNaN(date.getTime()) ? new Date() : date,
                    changeFrequency: 'weekly',
                    priority: 0.9
                };
            });
        }
    } catch (err) {
        console.error('Error fetching blogs for sitemap:', err);
    }

    return [
        ...staticRoutes,
        ...categoryRoutes,
        ...productRoutes,
        ...blogRoutes
    ];
}
