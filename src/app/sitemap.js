export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
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
    let categoryRoutes = [];
    try {
        const res = await fetch(`${apiBase}/categories`);
        if (res.ok) {
            const data = await res.json();
            const categories = data?.categories || [];
            categoryRoutes = categories.map(cat => ({
                url: `${siteUrl}/categories/${cat.slug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.8
            }));
        }
    } catch (err) {
        console.error('Error fetching categories for sitemap:', err);
    }

    // 3. Fetch products
    let productRoutes = [];
    try {
        const res = await fetch(`${apiBase}/products/list?limit=100&status=active`);
        if (res.ok) {
            const data = await res.json();
            const products = data?.data?.products || [];
            productRoutes = products.map(prod => ({
                url: `${siteUrl}/products/${prod.productID}`,
                lastModified: prod.updatedAt ? new Date(prod.updatedAt) : new Date(),
                changeFrequency: 'daily',
                priority: 0.7
            }));
        }
    } catch (err) {
        console.error('Error fetching products for sitemap:', err);
    }

    // 4. Fetch blog posts
    let blogRoutes = [];
    try {
        const res = await fetch(`${apiBase}/blog/sitemap-data`);
        if (res.ok) {
            const data = await res.json();
            const posts = data?.data || [];
            blogRoutes = posts.map(post => ({
                url: `${siteUrl}/blog/${post.slug}`,
                lastModified: new Date(post.lastmod),
                changeFrequency: 'weekly',
                priority: 0.8
            }));
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
