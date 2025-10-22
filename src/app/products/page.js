"use client"

import React, { useState } from 'react'
import ProductGridInfinity from '@/components/products/productGridInfinity'

export default function ProductsPage() {
    const [search, setSearch] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSearch = () => {
        const term = search.trim()
        setSearchQuery(term === '' ? '' : term)
        setRefreshKey((k) => k + 1)
    }

    const handleShowAll = () => {
        setSearch('')
        setSearchQuery('')
        setRefreshKey((k) => k + 1)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
            {/* Hero */}
            <div className="bg-gradient-to-r from-[#EF6A22] via-[#f59e0b] to-[#f97316] text-white">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                    <h1 className="text-2xl md:text-3xl font-semibold">Shop</h1>
                    <p className="text-white/90 text-sm mt-1">Browse our catalogue and find what you need</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 -mt-6 pb-10">
                {/* Controls */}
                <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-4 md:p-6">
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
                                    Show All
                                </button>
                            </div>
                        </div>
                        <div className="md:w-56">
                            <label className="block text-sm text-gray-600 mb-1">Sort</label>
                            <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent">
                                <option value="">Relevance</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="new">Newest</option>
                            </select>
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
                    <ProductGridInfinity key={`${searchQuery}|${refreshKey}`} initialLimit={20} search={searchQuery} visitShop={false} />
                </div>
            </div>
        </div>
    )
}


