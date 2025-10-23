'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axiosInstance';

export default function CategoryProducts({ params }) {
    // Unwrap params if it's a Promise (Next.js newer behavior), fallback to direct access for compatibility
    const resolvedParams = typeof params?.then === 'function' ? React.use(params) : params;
    const { categoryID } = resolvedParams || {};
    const router = useRouter();
    const [data, setData] = useState({ products: [], pagination: {} });
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategoryAndProducts();
    }, [categoryID, currentPage]);

    const fetchCategoryAndProducts = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch category details and products in parallel
            const [categoryRes, productsRes] = await Promise.all([
                api.get(`/categories/${categoryID}`),
                api.get(`/products/by-category/${categoryID}?page=${currentPage}&limit=24`)
            ]);

            setCategory(categoryRes.data.category);
            setData(productsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = data.products?.filter(product =>
        product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (!data.pagination || data.pagination.totalPages <= 1) return null;

        const { page, totalPages } = data.pagination;
        const pages = [];

        // Show first page
        if (page > 3) {
            pages.push(1);
            if (page > 4) pages.push('...');
        }

        // Show pages around current page
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
            pages.push(i);
        }

        // Show last page
        if (page < totalPages - 2) {
            if (page < totalPages - 3) pages.push('...');
            pages.push(totalPages);
        }

        return (
            <div className="flex justify-center items-center space-x-2 mt-12">
                <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>

                {pages.map((pageNum, index) => (
                    <button
                        key={index}
                        onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                        disabled={pageNum === '...'}
                        className={`px-4 py-2 rounded-lg transition-colors ${pageNum === page
                            ? 'bg-blue-600 text-white'
                            : pageNum === '...'
                                ? 'text-gray-400 cursor-default'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        {pageNum}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchCategoryAndProducts}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-20">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <button
                                onClick={() => router.back()}
                                className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Categories
                            </button>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'var(--font-ledger)' }}>
                                {category?.categoryName || 'Category Products'}
                            </h1>
                            <p className="text-xl text-blue-100 mb-4">
                                Discover amazing products in this category
                            </p>
                            <div className="flex items-center space-x-4 text-blue-100">
                                <span className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    {data.pagination?.total || 0} products
                                </span>
                            </div>
                        </div>
                        {category?.image && (
                            <div className="hidden md:block ml-8">
                                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl">
                                    <Image
                                        src={category.image}
                                        alt={category.categoryName}
                                        width={128}
                                        height={128}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-12 animate-fade-in-up-delay">
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-300"
                        />
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {searchTerm ? 'No products found' : 'No products available'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'This category is empty'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.productID}
                                    className="group animate-fade-in-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Link href={`/products/${product.productID}`}>
                                        <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                                            {/* Image Container */}
                                            <div className="relative h-64 overflow-hidden">
                                                <Image
                                                    src={product.featuredImages || 'https://picsum.photos/400/300'}
                                                    alt={product.productName}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                {/* Price Badge */}
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                    ₹{Number(product.productPrice).toFixed(2)}
                                                </div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <div className="text-white text-center">
                                                        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <p className="font-semibold">View Details</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Content (minimal) */}
                                            <div className="p-6">
                                                <div className="mb-2">
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                        {product.categoryName || 'Category'}
                                                    </span>
                                                </div>
                                                <h3
                                                    className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-1"
                                                    style={{ fontFamily: 'var(--font-montserrat)' }}
                                                >
                                                    {product.productName}
                                                </h3>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </>
                )}
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-ledger)' }}>
                        Can't find what you're looking for?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Browse all our products or explore other categories
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/products"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            View All Products
                        </Link>
                        <Link
                            href="/categories"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Browse Categories
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}




