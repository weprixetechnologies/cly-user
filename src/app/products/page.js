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
            // Fetch first page to determine price range
            const response = await axiosInstance.get('/products/list?page=1&limit=100')
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#EF6A22] via-[#f59e0b] to-[#f97316] text-white">
                <div className="max-w-[90%] mx-auto px-4 md:px-8 py-8">
                    <h1 className="text-2xl md:text-3xl font-semibold">Shop</h1>
                    <p className="text-white/90 text-sm mt-1">Browse our catalogue and find what you need</p>
                </div>
            </div>

            <div className="max-w-[90%] mx-auto px-4 md:px-8 -mt-6 pb-10">
                {/* Controls */}
                <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-4 md:p-6">
                    <div className="flex flex-col gap-4">
                        {/* Search Row */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Search Products</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={"Try \"marker\", \"pen\", \"notebook\"…"}
                                        className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="inline-flex items-center bg-[#EF6A22] text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
                                    >
                                        Search
                                    </button>
                                    <button
                                        onClick={handleShowAll}
                                        className="inline-flex items-center border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Category</label>
                                <select
                                    value={categoryID}
                                    onChange={(e) => {
                                        setCategoryID(e.target.value)
                                        handleFilterChange()
                                    }}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.categoryID} value={category.categoryID}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Sort</label>
                                <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent">
                                    <option value="">Relevance</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="new">Newest</option>
                                </select>
                            </div>
                        </div>

                        {/* Price Slider */}
                        <div className="mt-2">
                            <PriceSlider
                                minPrice={minPrice}
                                maxPrice={maxPrice}
                                minRange={priceRange.min}
                                maxRange={priceRange.max}
                                onChange={(newMin, newMax) => {
                                    setMinPrice(newMin)
                                    setMaxPrice(newMax)
                                    handleFilterChange()
                                }}
                            />
                        </div>
                    </div>

                    {/* Quick filter chips (static placeholders) */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {['New Arrivals', 'Best Sellers', 'Under ₹500', 'Office', 'School'].map((t) => (
                            <span key={t} className="text-xs px-3 py-1.5 rounded-full border border-orange-200 text-[#EF6A22] bg-orange-50">
                                {t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Products grid */}
                <div className="mt-6">
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
    )
}


