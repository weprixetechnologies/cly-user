import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function fetchBlogData({ search = '', categorySlug = '', tagSlug = '', page = 1, limit = 9 }) {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
    try {
        const url = new URL(`${apiBase}/blog/posts`);
        url.searchParams.set('page', String(page));
        url.searchParams.set('limit', String(limit));
        if (search) url.searchParams.set('search', search);
        if (categorySlug) url.searchParams.set('category_slug', categorySlug);
        if (tagSlug) url.searchParams.set('tag_slug', tagSlug);

        const res = await fetch(url.toString(), { next: { revalidate: 60 } });
        if (!res.ok) return { posts: [], pagination: { totalPosts: 0, totalPages: 1, currentPage: 1 } };
        return await res.json();
    } catch (err) {
        console.error('Error fetching public blog posts:', err);
        return { posts: [], pagination: { totalPosts: 0, totalPages: 1, currentPage: 1 } };
    }
}

async function fetchCategories() {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.cursiveletters.in/api';
    try {
        const res = await fetch(`${apiBase}/blog/categories`, { next: { revalidate: 300 } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error('Error fetching blog categories:', err);
        return [];
    }
}

export default async function BlogLandingPage({ searchParams }) {
    const resolvedSearchParams = await searchParams;
    const currentPage = parseInt(resolvedSearchParams.page || '1');
    const search = resolvedSearchParams.search || '';
    const selectedCategory = resolvedSearchParams.category || '';
    const selectedTag = resolvedSearchParams.tag || '';

    const [{ posts, pagination }, categories] = await Promise.all([
        fetchBlogData({ search, categorySlug: selectedCategory, tagSlug: selectedTag, page: currentPage, limit: 9 }),
        fetchCategories()
    ]);

    // Separate featured post if it is page 1 and no search filter
    const featuredPost = (currentPage === 1 && !search && !selectedCategory)
        ? posts.find(p => p.is_featured) || posts[0]
        : null;

    const displayPosts = featuredPost
        ? posts.filter(p => p.id !== featuredPost.id)
        : posts;

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 md:px-12 lg:px-24">
            {/* Header section */}
            <div className="max-w-7xl mx-auto text-center mb-12">
                <span className="text-sm font-semibold tracking-wider text-amber-600 uppercase">Our Journal</span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-2 font-serif tracking-tight">
                    The Cursive Letters Blog
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-base md:text-lg">
                    Discover calligraphy guides, stationery reviews, styling inspiration, and tutorials written by our collection experts.
                </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="max-w-7xl mx-auto mb-10 bg-white shadow-sm border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Category Links */}
                <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                    <Link
                        href="/blog"
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!selectedCategory
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        All Articles
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            href={`/blog?category=${cat.slug}${search ? `&search=${search}` : ''}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat.slug
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>

                {/* Search Form */}
                <form action="/blog" method="GET" className="relative w-full md:w-72">
                    {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
                    <input
                        type="text"
                        name="search"
                        defaultValue={search}
                        placeholder="Search articles..."
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </form>
            </div>

            {/* Featured Post Card */}
            {featuredPost && (
                <div className="max-w-7xl mx-auto mb-16">
                    <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
                        {/* Image Panel */}
                        <div className="relative min-h-[300px] lg:min-h-[450px]">
                            {featuredPost.cover_image_url ? (
                                <Image
                                    src={featuredPost.cover_image_url}
                                    alt={featuredPost.cover_image_alt || featuredPost.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-w-1024px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-amber-600/5 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-amber-600/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 12h-15m0 0l6.75-6.75M4.5 12l6.75 6.75" />
                                    </svg>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                                Featured Article
                            </div>
                        </div>

                        {/* Text Panel */}
                        <div className="p-8 md:p-12 flex flex-col justify-between">
                            <div>
                                <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest">
                                    {featuredPost.categoryName || 'General'}
                                </span>
                                <Link href={`/blog/${featuredPost.slug}`}>
                                    <h2 className="text-2xl md:text-4xl font-bold font-serif text-gray-900 mt-3 mb-4 hover:text-amber-600 transition-colors leading-tight">
                                        {featuredPost.title}
                                    </h2>
                                </Link>
                                <p className="text-gray-600 text-base md:text-lg mb-6 line-clamp-3">
                                    {featuredPost.excerpt}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
                                <div className="flex items-center gap-3">
                                    {featuredPost.authorPhoto ? (
                                        <Image
                                            src={featuredPost.authorPhoto}
                                            alt={featuredPost.authorName}
                                            width={44}
                                            height={44}
                                            className="rounded-full object-cover border-2 border-amber-100"
                                        />
                                    ) : (
                                        <div className="w-11 h-11 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {featuredPost.authorName?.[0]?.toUpperCase() || 'A'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{featuredPost.authorName || 'Expert'}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(featuredPost.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>{featuredPost.reading_time_min || 1} min read</span>
                                    <Link href={`/blog/${featuredPost.slug}`} className="flex items-center gap-1 font-bold text-amber-600 hover:text-amber-700 text-sm">
                                        Read Post
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Articles Grid */}
            <div className="max-w-7xl mx-auto">
                {displayPosts.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <h3 className="text-lg font-bold text-gray-800">No articles found</h3>
                        <p className="text-gray-500 mt-1">Try resetting your search query or choosing another category.</p>
                        <Link href="/blog" className="mt-4 inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors">
                            Clear filters
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayPosts.map(post => (
                            <article key={post.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                                <div>
                                    {/* Cover photo */}
                                    <div className="relative h-48 w-full bg-gray-100">
                                        {post.cover_image_url ? (
                                            <Image
                                                src={post.cover_image_url}
                                                alt={post.cover_image_alt || post.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-w-768px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/5 flex items-center justify-center text-amber-600/20">
                                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 12h-15m0 0l6.75-6.75M4.5 12l6.75 6.75" />
                                                </svg>
                                            </div>
                                        )}
                                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800">
                                            {post.categoryName || 'General'}
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <span>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>{post.reading_time_min || 1} min read</span>
                                        </div>
                                        <Link href={`/blog/${post.slug}`}>
                                            <h3 className="text-xl font-bold font-serif text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors leading-snug">
                                                {post.title}
                                            </h3>
                                        </Link>
                                        <p className="text-gray-600 text-sm mt-3 line-clamp-3 leading-relaxed">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </div>

                                {/* Author Panel */}
                                <div className="border-t border-gray-50 px-6 py-4 bg-gray-50/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {post.authorPhoto ? (
                                            <Image
                                                src={post.authorPhoto}
                                                alt={post.authorName}
                                                width={28}
                                                height={28}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                                {post.authorName?.[0]?.toUpperCase() || 'A'}
                                            </div>
                                        )}
                                        <span className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
                                            {post.authorName || 'Expert'}
                                        </span>
                                    </div>

                                    <Link href={`/blog/${post.slug}`} className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                        Read Article
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-12">
                        {/* Prev Button */}
                        {currentPage > 1 && (
                            <Link
                                href={`/blog?page=${currentPage - 1}${selectedCategory ? `&category=${selectedCategory}` : ''}${search ? `&search=${search}` : ''}`}
                                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </Link>
                        )}

                        {/* Page Numbers */}
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pNum => (
                            <Link
                                key={pNum}
                                href={`/blog?page=${pNum}${selectedCategory ? `&category=${selectedCategory}` : ''}${search ? `&search=${search}` : ''}`}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${pNum === currentPage
                                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {pNum}
                            </Link>
                        ))}

                        {/* Next Button */}
                        {currentPage < pagination.totalPages && (
                            <Link
                                href={`/blog?page=${currentPage + 1}${selectedCategory ? `&category=${selectedCategory}` : ''}${search ? `&search=${search}` : ''}`}
                                className="px-4 py-2 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-1"
                            >
                                Next
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
