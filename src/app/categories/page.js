'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/utils/axiosInstance';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const responseOriginal = await api.get('/categories').catch(() => api.get('/products/categories/list'));
            setCategories(responseOriginal?.data?.categories || responseOriginal?.data?.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004aad] border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading categories...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
                    <p className="text-gray-500 font-medium mb-6">{error}</p>
                    <button
                        onClick={fetchCategories}
                        className="bg-[#004aad] hover:bg-[#003882] text-white px-8 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Desktop Hero Section */}
            <div className="hidden md:block relative bg-gradient-to-r from-orange-50 via-rose-50 to-orange-100 pt-16 pb-24 overflow-hidden border-b border-orange-100/50">
                {/* Decorative blob */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-200/40 to-rose-200/40 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative max-w-[95%] xl:max-w-[1400px] mx-auto px-4 md:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex-1 animate-fade-in-up">
                            <h1 className="text-4xl md:text-5xl lg:text-[52px] font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                                Shop by Categories
                            </h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-xl font-medium">
                                Explore our wide range of premium stationery & essentials
                            </p>
                        </div>
                        
                        <div className="w-full md:w-auto bg-white/90 backdrop-blur-md border border-white/60 p-5 rounded-2xl shadow-xl shadow-orange-900/5 flex flex-wrap md:flex-nowrap gap-4 md:gap-8 justify-center items-center relative z-10">
                            {/* Feature 1 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">100% Authentic</div>
                                    <div className="text-[11px] text-gray-500 font-medium">Imported Products</div>
                                </div>
                            </div>
                            
                            <div className="hidden md:block w-px h-10 bg-gray-200"></div>
                            
                            {/* Feature 2 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Best Wholesale Prices</div>
                                    <div className="text-[11px] text-gray-500 font-medium">For Bulk Orders</div>
                                </div>
                            </div>
                            
                            <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                            {/* Feature 3 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#004aad] shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Pan India Delivery</div>
                                    <div className="text-[11px] text-gray-500 font-medium">Fast & Reliable</div>
                                </div>
                            </div>

                            <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                            {/* Feature 4 */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">Dedicated Support</div>
                                    <div className="text-[11px] text-gray-500 font-medium">Need help? Contact us</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Hero Section */}
            <div className="md:hidden bg-white border-b border-gray-100 px-5 py-6">
                <div className="flex items-center justify-between">
                    <div className="pr-4 max-w-[70%]">
                        <h1 className="text-2xl font-bold text-[#0B1536] mb-1.5">Categories</h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Explore our wide range of premium stationery & essentials.</p>
                    </div>
                    <div className="w-[72px] h-[72px] shrink-0 bg-orange-50/60 rounded-[18px] flex items-center justify-center relative shadow-sm border border-orange-100/40">
                        <span className="text-[32px] drop-shadow-sm relative z-10">📦</span>
                        <span className="absolute top-2 left-2 text-[#F97316] text-[10px] opacity-80 animate-pulse">✨</span>
                        <span className="absolute bottom-2.5 right-1.5 text-[#F97316] text-[8px] opacity-80 animate-pulse" style={{animationDelay: '150ms'}}>✨</span>
                        <span className="absolute top-2.5 right-1.5 text-[#F97316] text-[7px] opacity-80 animate-pulse" style={{animationDelay: '300ms'}}>✨</span>
                    </div>
                </div>
            </div>

            {/* Search and Sort */}
            <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 w-full bg-gray-50/80 border border-gray-100 rounded-xl transition-shadow focus-within:shadow-sm focus-within:bg-white">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-transparent focus:outline-none rounded-xl text-gray-700 font-medium placeholder:text-gray-400" />
                </div>
                
                <div className="w-full md:w-auto relative group">
                    <select className="w-full md:w-[220px] bg-gray-50/80 hover:bg-white border border-gray-100 rounded-xl py-3.5 pl-4 pr-10 font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 cursor-pointer appearance-none transition-all shadow-sm">
                        <option value="popular">Sort by: Popular</option>
                        <option value="az">Sort by: A-Z</option>
                        <option value="za">Sort by: Z-A</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="max-w-[95%] xl:max-w-[1400px] mx-auto px-4 md:px-8">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No categories found</h3>
                        <p className="text-gray-600 font-medium">Try adjusting your search terms</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                        {filteredCategories.map((category, index) => {
                            // Cycle through some background colors for the blobs
                            const blobColors = [
                                'bg-blue-50/80',
                                'bg-teal-50/80',
                                'bg-pink-50/80',
                                'bg-orange-50/80',
                                'bg-purple-50/80'
                            ];
                            const blobColor = blobColors[index % blobColors.length];
                            
                            return (
                                <Link key={category.categoryID || index} href={`/categories/${category.categoryID}`}>
                                    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 p-3 md:p-6 flex flex-col items-center relative group h-full">
                                        
                                        {/* Product Count Pill */}
                                        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold shadow-sm z-10 transition-colors group-hover:bg-white group-hover:text-gray-700">
                                            {category.productCount || 0} Products
                                        </div>

                                        {/* Image Area with Blob Background */}
                                        <div className="relative w-20 h-20 md:w-40 md:h-40 mb-3 md:mb-6 mt-6 md:mt-4 flex items-center justify-center shrink-0">
                                            <div className={`absolute inset-0 ${blobColor} rounded-[40%_60%_70%_30%/40%_50%_60%_50%] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-in-out`}></div>
                                            {(() => {
                                                const normalize = (v) => typeof v === 'string' ? v.trim() : '';
                                                const candidates = [normalize(category?.image), normalize(category?.imgUrl)];
                                                let imageSrc = 'https://picsum.photos/400/300';
                                                for (const c of candidates) {
                                                    if (c && c !== 'null' && c !== 'undefined' && (c.startsWith('http') || c.startsWith('/'))) {
                                                        imageSrc = c; break;
                                                    }
                                                }
                                                return (
                                                    <Image
                                                        src={imageSrc}
                                                        alt={category.categoryName || 'Category'}
                                                        fill
                                                        className="object-contain p-4 relative z-10 group-hover:scale-110 transition-transform duration-500 ease-in-out drop-shadow-md"
                                                    />
                                                );
                                            })()}
                                        </div>

                                        {/* Content */}
                                        <div className="text-center w-full mt-auto">
                                            <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1.5 md:mb-2 group-hover:text-[#004aad] transition-colors leading-tight line-clamp-1">{category.categoryName || 'Category'}</h3>
                                            <p className="hidden md:block text-[13px] text-gray-500 leading-relaxed font-medium mb-5 line-clamp-2">
                                                Explore our premium collection of {category.categoryName?.toLowerCase() || 'products'} and find exactly what you need.
                                            </p>
                                            
                                            <div className="hidden md:flex text-[13px] font-bold text-[#6E2594] items-center justify-center gap-1.5 group-hover:gap-2 transition-all">
                                                View Products <span aria-hidden="true">&rarr;</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
