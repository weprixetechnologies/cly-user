"use client"

import React, { useState, useEffect } from 'react'
import ProductGridInfinity from '@/components/products/productGridInfinity'
import PriceSlider from '@/components/products/PriceSlider'
import axiosInstance from '@/utils/axiosInstance'

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryID, setCategoryID] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [categories, setCategories] = useState([])
    const [refreshKey, setRefreshKey] = useState(0)
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1299 })
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
    const [isMobileSortOpen, setIsMobileSortOpen] = useState(false)
    const [isCategoryExpanded, setIsCategoryExpanded] = useState(true)
    const [isPriceExpanded, setIsPriceExpanded] = useState(true)
    
    // Drag-to-close state
    const [dragStartY, setDragStartY] = useState(0)
    const [dragOffsetY, setDragOffsetY] = useState(0)
    const [draggingSheet, setDraggingSheet] = useState(null)

    const handleTouchStart = (e, sheet) => {
        setDragStartY(e.touches[0].clientY)
        setDraggingSheet(sheet)
    }

    const handleTouchMove = (e) => {
        if (!draggingSheet) return
        const currentY = e.touches[0].clientY
        const diff = currentY - dragStartY
        if (diff > 0) {
            setDragOffsetY(diff)
        }
    }

    const handleTouchEnd = () => {
        if (dragOffsetY > 100) {
            if (draggingSheet === 'sort') setIsMobileSortOpen(false)
            if (draggingSheet === 'filter') setIsMobileFilterOpen(false)
        }
        setDragOffsetY(0)
        setDraggingSheet(null)
    }

    useEffect(() => {
        loadCategories()
        loadPriceRange()
    }, [])

    const loadCategories = async () => {
        try {
            const response = await axiosInstance.get('/products/categories/list')
            if (response.data.success) {
                setCategories(response.data.data || [])
            }
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const loadPriceRange = async () => {
        try {
            // Fetch first page to determine price range (only active products)
            const response = await axiosInstance.get('/products/list?page=1&limit=100&status=active')
            if (response.data.success && response.data.data.products) {
                const products = response.data.data.products
                if (products.length > 0) {
                    const prices = products.map(p => parseFloat(p.productPrice) || 0).filter(p => p > 0)
                    if (prices.length > 0) {
                        const min = Math.floor(Math.min(...prices))
                        const max = Math.ceil(Math.max(...prices))
                        setPriceRange({ min: Math.max(0, min), max: Math.max(100, max) })
                    }
                }
            }
        } catch (error) {
            console.error('Error loading price range:', error)
            // Keep default range
        }
    }

    const handleSearch = () => {
        const term = search.trim()
        setSearchQuery(term === '' ? '' : term)
        setRefreshKey((k) => k + 1)
    }

    const handleShowAll = () => {
        setSearch('')
        setSearchQuery('')
        setCategoryID('')
        setMinPrice('')
        setMaxPrice('')
        setRefreshKey((k) => k + 1)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleFilterChange = () => {
        setRefreshKey((k) => k + 1)
    }

    const FilterContent = () => (
        <div className="bg-white md:rounded-xl md:shadow-sm border-gray-100 p-5 md:border">
            <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
                <button onClick={handleShowAll} className="text-xs text-[#004aad] font-semibold hover:underline">Clear All</button>
            </div>
            
            <hr className="my-4 border-gray-100" />
            
            {/* Categories */}
            <div>
                <div onClick={() => setIsCategoryExpanded(!isCategoryExpanded)} className="flex justify-between items-center mb-4 cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900">Categories</h4>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ${isCategoryExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                
                <div className={`space-y-3 overflow-hidden transition-all duration-300 ${isCategoryExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 mb-0'}`}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#004aad] focus:ring-[#004aad] transition-colors" checked={categoryID === ''} onChange={() => { setCategoryID(''); handleFilterChange(); }} />
                        <span className={`text-sm transition-colors ${categoryID === '' ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>All Categories</span>
                    </label>
                    {categories.map(cat => (
                        <label key={cat.categoryID} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#004aad] focus:ring-[#004aad] transition-colors" checked={categoryID === cat.categoryID} onChange={() => { setCategoryID(cat.categoryID); handleFilterChange(); }} />
                            <span className={`text-sm transition-colors line-clamp-1 ${categoryID === cat.categoryID ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>{cat.categoryName}</span>
                        </label>
                    ))}
                </div>
            </div>
            
            <hr className="my-5 border-gray-100" />
            
            {/* Price Range */}
            <div>
                <div onClick={() => setIsPriceExpanded(!isPriceExpanded)} className="flex justify-between items-center mb-4 cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EF6A22] group-hover:bg-orange-100 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900">Price Range</h4>
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ${isPriceExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ${isPriceExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 mb-0'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₹</span>
                            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#004aad] focus:border-[#004aad] outline-none transition-shadow" />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₹</span>
                            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#004aad] focus:border-[#004aad] outline-none transition-shadow" />
                        </div>
                    </div>
                    
                    <button onClick={() => { handleFilterChange(); setIsMobileFilterOpen(false); }} className="w-full bg-[#004aad] text-white rounded-lg py-2 text-sm font-semibold hover:bg-[#003882] transition-colors shadow-sm">
                        Apply
                    </button>
                </div>
            </div>
            

        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50/50 pb-16 md:pb-0">
            {/* Mobile Hero */}
            <div className="md:hidden bg-white border-b border-gray-100 px-5 py-6">
                <div className="flex items-center justify-between">
                    <div className="pr-4 max-w-[70%]">
                        <h1 className="text-2xl font-bold text-[#0B1536] mb-1.5">Shop</h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Find everything you need from our wide range of imported products.</p>
                    </div>
                    <div className="w-[72px] h-[72px] shrink-0 bg-pink-50/60 rounded-[18px] flex items-center justify-center relative shadow-sm border border-pink-100/40">
                        <span className="text-[32px] drop-shadow-sm relative z-10">🛍️</span>
                        <span className="absolute top-2 left-2 text-[#F97316] text-[10px] opacity-80 animate-pulse">✨</span>
                        <span className="absolute bottom-2.5 right-1.5 text-[#F97316] text-[8px] opacity-80 animate-pulse" style={{animationDelay: '150ms'}}>✨</span>
                        <span className="absolute top-2.5 right-1.5 text-[#F97316] text-[7px] opacity-80 animate-pulse" style={{animationDelay: '300ms'}}>✨</span>
                    </div>
                </div>
            </div>

            {/* Desktop Hero */}
            <div className="hidden md:block relative overflow-hidden bg-white border-b border-gray-200 shadow-sm">
                {/* Yellow Blob Background */}
                <div className="absolute top-0 left-[-5%] w-[40%] h-[150%] bg-[#FFC107] rounded-br-[150px] z-0 hidden md:block rotate-[-5deg]"></div>
                
                <div className="relative z-10 max-w-full md:max-w-[95%] mx-auto px-2 md:px-8 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center">
                        <div className="flex-shrink-0 md:w-1/4 pt-2 md:pl-4">
                            <div className="text-xs text-gray-800 mb-1 font-medium">Home &gt; <span className="font-bold">Shop</span></div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Shop</h1>
                            <p className="text-gray-800 text-sm max-w-[280px] font-medium leading-relaxed">Explore our wide range of quality products at wholesale prices.</p>
                        </div>
                        
                        <div className="flex-grow flex flex-col md:flex-row gap-4 w-full items-center justify-between mt-4 md:mt-0">
                            {/* Feature Cards */}
                            <div className="flex flex-col sm:flex-row gap-4 flex-grow justify-end md:justify-center">
                                <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-3 w-full sm:w-auto hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 leading-tight mb-0.5">Minimum Order Quantity</div>
                                        <div className="text-[10px] text-gray-500 font-medium">Low MOQ for all products</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-3 w-full sm:w-auto hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 leading-tight mb-0.5">GST Invoice Available</div>
                                        <div className="text-[10px] text-gray-500 font-medium">100% GST Compliant</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-gray-100 shadow-sm rounded-xl p-3 w-full sm:w-auto hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-900 leading-tight mb-0.5">Dedicated Support</div>
                                        <div className="text-[10px] text-gray-500 font-medium">We're here to help!</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-full md:max-w-[95%] mx-auto px-2 md:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Desktop Sidebar (Hidden on Mobile) */}
                    <div className="hidden md:block w-full md:w-[260px] flex-shrink-0 space-y-6 sticky top-32 max-h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar">
                        <FilterContent />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Top Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
                            {/* Mobile Search */}
                            <div className="w-full sm:hidden mb-2">
                                <div className="relative flex">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Search Products..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg text-sm focus:ring-1 focus:ring-[#004aad] focus:border-[#004aad] outline-none"
                                        />
                                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <button onClick={handleSearch} className="bg-[#004aad] text-white px-4 py-2 rounded-r-lg hover:bg-[#003882] transition-colors border border-[#004aad]">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </button>
                                </div>
                            </div>


                            
                            <div className="text-sm text-gray-600 hidden md:block font-medium">
                                Showing <span className="font-bold text-gray-900">Products</span>
                            </div>
                            
                            {/* Sort Options (Hidden on Mobile, shown in Bottom Sheet instead) */}
                            <div className="hidden sm:flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-600 whitespace-nowrap font-medium">Sort by:</label>
                                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#004aad] focus:border-[#004aad] outline-none font-medium text-gray-800 cursor-pointer transition-all">
                                        <option value="popularity">Popularity</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="new">Newest Arrivals</option>
                                    </select>
                                </div>
                                <div className="hidden lg:flex items-center gap-2">
                                    <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#004aad] focus:border-[#004aad] outline-none font-medium text-gray-800 cursor-pointer transition-all">
                                        <option value="24">24 per page</option>
                                        <option value="48">48 per page</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search Desktop */}
                        <div className="hidden md:flex relative mb-6">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Search within products..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#004aad] focus:border-transparent outline-none shadow-sm transition-all"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <button onClick={handleSearch} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#004aad] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#003882] transition-colors shadow-sm">
                                Search
                            </button>
                        </div>

                        {/* Product Grid Wrapper */}
                        <div>
                            <ProductGridInfinity
                                key={`${searchQuery}|${categoryID}|${minPrice}|${maxPrice}|${refreshKey}`}
                                initialLimit={20}
                                search={searchQuery}
                                categoryID={categoryID}
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                visitShop={false}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Fixed Bottom Actions */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-40 flex shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-safe">
                <button 
                    onClick={() => setIsMobileSortOpen(true)}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 text-gray-700 font-semibold border-r border-gray-200"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                    Sort
                </button>
                <button 
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="flex-1 py-3.5 flex items-center justify-center gap-2 text-gray-700 font-semibold"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                    Filter
                </button>
            </div>

            {/* Mobile Sort Bottom Sheet */}
            {isMobileSortOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileSortOpen(false)}></div>
                    <div 
                        className="relative bg-white rounded-t-2xl px-5 pb-safe pt-2 w-full animate-[slide-up_0.3s_ease-out] shadow-2xl"
                        style={{ transform: draggingSheet === 'sort' ? `translateY(${dragOffsetY}px)` : 'translateY(0)', transition: draggingSheet === 'sort' ? 'none' : 'transform 0.3s' }}
                    >
                        <div 
                            className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing"
                            onTouchStart={(e) => handleTouchStart(e, 'sort')}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">Sort By</h3>
                            <button onClick={() => setIsMobileSortOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="space-y-1">
                            <button className="w-full text-left py-3.5 px-2 font-medium text-[#004aad] bg-blue-50/50 rounded-lg">Popularity</button>
                            <button className="w-full text-left py-3.5 px-2 font-medium text-gray-600 border-b border-gray-50">Price: Low to High</button>
                            <button className="w-full text-left py-3.5 px-2 font-medium text-gray-600 border-b border-gray-50">Price: High to Low</button>
                            <button className="w-full text-left py-3.5 px-2 font-medium text-gray-600">Newest Arrivals</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Mobile Filter Bottom Sheet */}
            {isMobileFilterOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
                    <div 
                        className="relative bg-white rounded-t-2xl h-[85vh] flex flex-col animate-[slide-up_0.3s_ease-out] shadow-2xl w-full"
                        style={{ transform: draggingSheet === 'filter' ? `translateY(${dragOffsetY}px)` : 'translateY(0)', transition: draggingSheet === 'filter' ? 'none' : 'transform 0.3s' }}
                    >
                        <div 
                            className="w-full flex justify-center pt-4 pb-2 cursor-grab active:cursor-grabbing shrink-0"
                            onTouchStart={(e) => handleTouchStart(e, 'filter')}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                        </div>
                        <div className="flex justify-between items-center px-4 pb-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 bg-gray-100 rounded-full text-gray-500"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto bg-gray-50/50">
                            <FilterContent />
                        </div>
                        
                        <div className="p-4 border-t border-gray-200 flex gap-4 bg-white pb-safe">
                            <button onClick={() => { handleShowAll(); setIsMobileFilterOpen(false); }} className="flex-1 py-3.5 rounded-xl border border-gray-300 font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100">Clear All</button>
                            <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-3.5 rounded-xl bg-[#004aad] text-white font-bold hover:bg-[#003882] shadow-sm">Show Results</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
