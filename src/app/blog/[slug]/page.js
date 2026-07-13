import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import ViewCounter from './ViewCounter';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function fetchPostDetail(slug) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api';
    try {
        const res = await fetch(`${apiBase}/blog/posts/${slug}`, { next: { revalidate: 60 } });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error('Error fetching blog post detail:', err);
        return null;
    }
}

// Generate dynamic SEO Metadata
export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const response = await fetchPostDetail(slug);

    if (!response || !response.success || response.redirect || !response.data) {
        return {
            title: 'Article Not Found | Cursive Letters',
            description: 'The requested blog article could not be found.'
        };
    }

    const post = response.data;
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cursiveletters.in';

    return {
        title: post.meta_title || `${post.title} | Cursive Letters`,
        description: post.meta_description || post.excerpt,
        alternates: {
            canonical: post.canonical_url || `${siteUrl}/blog/${post.slug}`
        },
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `${siteUrl}/blog/${post.slug}`,
            images: [
                {
                    url: post.og_image_url || post.cover_image_url || `${siteUrl}/logo.png`,
                    width: 1200,
                    height: 630,
                    alt: post.cover_image_alt || post.title
                }
            ],
            type: 'article',
            publishedTime: post.published_at,
            modifiedTime: post.updatedAt,
            authors: [post.authorName || 'Cursive Letters Expert']
        },
        robots: post.meta_description?.includes('noindex') ? 'noindex, nofollow' : 'index, follow'
    };
}

export default async function BlogPostDetailPage({ params }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    const response = await fetchPostDetail(slug);

    // Handle 301 Permanent Redirect
    if (response?.redirect && response?.newSlug) {
        redirect(`/blog/${response.newSlug}`);
    }

    if (!response || !response.success || !response.data) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center py-16 px-4">
                <h1 className="text-3xl font-bold text-gray-900 font-serif">Article Not Found</h1>
                <p className="text-gray-500 mt-2">The article you are looking for does not exist or has been removed.</p>
                <Link href="/blog" className="mt-6 px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 shadow-md">
                    Back to Blog
                </Link>
            </div>
        );
    }

    const post = response.data;
    const { tags, products, relatedPosts } = post;
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://cursiveletters.in';

    // Parse H2 headings for Table of Contents
    const toc = [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/g;
    let match;
    let index = 0;
    
    // Create an editable copy of the content to inject IDs to h2 tags for anchor jumping
    let processedContent = post.content;
    
    // Simple replacement to inject unique anchor IDs to headings
    processedContent = processedContent.replace(/<h2([^>]*)>(.*?)<\/h2>/g, (original, attributes, text) => {
        const id = `heading-${index++}`;
        // Clean text of other inline HTML
        const cleanText = text.replace(/<[^>]*>/g, '');
        toc.push({ id, text: cleanText });
        return `<h2${attributes} id="${id}">${text}</h2>`;
    });

    // Create JSON-LD Schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt,
        'image': post.cover_image_url || `${siteUrl}/logo.png`,
        'datePublished': post.published_at,
        'dateModified': post.updatedAt,
        'author': {
            '@type': 'Person',
            'name': post.authorName || 'Cursive Letters Expert'
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'Cursive Letters',
            'logo': {
                '@type': 'ImageObject',
                'url': `${siteUrl}/logo.png`
            }
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `${siteUrl}/blog/${post.slug}`
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-16">
            {/* JSON-LD Script injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* View Counter Client trigger */}
            <ViewCounter slug={post.slug} />

            {/* Breadcrumbs Navigation */}
            <nav className="bg-white border-b border-gray-100 py-4 px-4 md:px-12 lg:px-24">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium">
                    <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
                    <span className="text-gray-300">/</span>
                    <Link href="/blog" className="hover:text-amber-600 transition-colors">Blog</Link>
                    <span className="text-gray-300">/</span>
                    {post.categoryName && (
                        <>
                            <Link href={`/blog?category=${post.categorySlug}`} className="hover:text-amber-600 transition-colors">
                                {post.categoryName}
                            </Link>
                            <span className="text-gray-300">/</span>
                        </>
                    )}
                    <span className="text-gray-800 font-semibold truncate max-w-[200px] md:max-w-md">{post.title}</span>
                </div>
            </nav>

            {/* Article Header Hero */}
            <header className="max-w-4xl mx-auto pt-12 px-4 text-center">
                <span className="text-sm font-bold text-amber-600 uppercase tracking-widest">
                    {post.categoryName || 'Journal'}
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 font-serif mt-3 mb-6 leading-tight tracking-tight">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-200/60 pb-8">
                    <div className="flex items-center gap-2.5">
                        {post.authorPhoto ? (
                            <Image
                                src={post.authorPhoto}
                                alt={post.authorName}
                                width={36}
                                height={36}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-9 h-9 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {post.authorName?.[0]?.toUpperCase() || 'A'}
                            </div>
                        )}
                        <span className="font-semibold text-gray-800">{post.authorName || 'Expert'}</span>
                    </div>
                    <span>•</span>
                    <span>
                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{post.reading_time_min || 1} min read</span>
                    <span>•</span>
                    <span>{post.view_count} views</span>
                </div>
            </header>

            {/* Cover Image */}
            {post.cover_image_url && (
                <div className="max-w-6xl mx-auto px-4 mb-12">
                    <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-md">
                        <Image
                            src={post.cover_image_url}
                            alt={post.cover_image_alt || post.title}
                            fill
                            className="object-cover"
                            sizes="(max-w-1200px) 100vw, 1200px"
                            priority
                        />
                    </div>
                </div>
            )}

            {/* Article Grid Container */}
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-12 mt-8">
                {/* Left Panel: Table of Contents */}
                <aside className="lg:col-span-3 hidden lg:block">
                    <div className="sticky top-6 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h4 className="font-serif font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 text-lg">
                            Table of Contents
                        </h4>
                        {toc.length === 0 ? (
                            <p className="text-gray-400 text-sm">No subheadings in this post.</p>
                        ) : (
                            <ul className="space-y-3">
                                {toc.map((item, idx) => (
                                    <li key={idx}>
                                        <a
                                            href={`#${item.id}`}
                                            className="text-gray-600 hover:text-amber-600 text-sm font-medium transition-colors block border-l-2 border-transparent hover:border-amber-500 pl-3 leading-relaxed"
                                        >
                                            {item.text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </aside>

                {/* Center Panel: Content Body */}
                <main className="lg:col-span-6 bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm">
                    {/* HTML Content Body with Tailwind Typography styles */}
                    <div
                        className="prose prose-amber max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-a:text-amber-600 prose-a:underline hover:prose-a:text-amber-700 prose-img:rounded-2xl prose-img:shadow-sm"
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                    />

                    {/* Article Tags Footer */}
                    {tags && tags.length > 0 && (
                        <div className="border-t border-gray-100 mt-10 pt-6">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tagged with</h4>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <Link
                                        key={tag.id}
                                        href={`/blog?tag=${tag.slug}`}
                                        className="bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-800 transition-colors text-xs font-semibold px-3 py-1.5 rounded-lg"
                                    >
                                        #{tag.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Right Panel: Linked Products */}
                <aside className="lg:col-span-3">
                    <div className="sticky top-6 space-y-6">
                        {products && products.length > 0 && (
                            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-serif font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 text-lg">
                                    Featured Products
                                </h4>
                                <div className="space-y-4">
                                    {products.map(prod => (
                                        <div key={prod.id} className="flex gap-3 items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                                                <Image
                                                    src={prod.image || '/logo.png'}
                                                    alt={prod.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link href={`/products/${prod.id}`}>
                                                    <h5 className="font-semibold text-gray-900 text-sm truncate hover:text-amber-600 transition-colors">
                                                        {prod.name}
                                                    </h5>
                                                </Link>
                                                <p className="text-amber-600 font-bold text-xs mt-1">₹{Number(prod.price).toFixed(2)}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Min Qty: {prod.minQty}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>

            {/* Related Articles Footer */}
            {relatedPosts && relatedPosts.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 mt-16 border-t border-gray-200/60 pt-16">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 font-serif mb-8 text-center md:text-left">
                        Recommended Reading
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedPosts.map(relPost => (
                            <article key={relPost.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <div className="relative h-40 w-full bg-gray-100">
                                        {relPost.cover_image_url ? (
                                            <Image
                                                src={relPost.cover_image_url}
                                                alt={relPost.cover_image_alt || relPost.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-amber-500/5 flex items-center justify-center text-amber-600/20">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 12h-15m0 0l6.75-6.75M4.5 12l6.75 6.75" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(relPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <Link href={`/blog/${relPost.slug}`}>
                                            <h4 className="font-bold text-gray-900 font-serif hover:text-amber-600 transition-colors mt-2 line-clamp-2 leading-snug">
                                                {relPost.title}
                                            </h4>
                                        </Link>
                                    </div>
                                </div>
                                <div className="p-5 pt-0">
                                    <Link href={`/blog/${relPost.slug}`} className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                        Read Post
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
