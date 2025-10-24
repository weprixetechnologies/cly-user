'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductGridInfinity from '@/components/products/productGridInfinity'

export default function SearchPage() {
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const q = searchParams.get('q') || ''
        setSearchQuery(q)
        setInputValue(q)
    }, [searchParams])

    const handleSearch = () => {
        const term = inputValue.trim()
        setSearchQuery(term)
        setRefreshKey((k) => k + 1)

        // Update URL without page reload
        const url = new URL(window.location)
        if (term) {
            url.searchParams.set('q', term)
        } else {
            url.searchParams.delete('q')
        }
        window.history.pushState({}, '', url.toString())
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleClear = () => {
        setInputValue('')
        setSearchQuery('')
        setRefreshKey((k) => k + 1)

        // Update URL
        const url = new URL(window.location)
        url.searchParams.delete('q')
        window.history.pushState({}, '', url.toString())
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#EF6A22] via-[#f59e0b] to-[#f97316] text-white">
                <div className="max-w-[90%] mx-auto px-4 md:px-8 py-8">
                    <h1 className="text-2xl md:text-3xl font-semibold">
                        {searchQuery ? `Search Results for "${searchQuery}"` : 'Search Products'}
                    </h1>
                    <p className="text-white/90 text-sm mt-1">
                        {searchQuery ? 'Find what you\'re looking for' : 'Search our catalog'}
                    </p>
                </div>
            </div>

            <div className="max-w-[90%] mx-auto px-4 md:px-8 -mt-6 pb-10">
                {/* Search Controls */}
                <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-4 md:p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-600 mb-1">Search Products</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Try \" marker\", \"pen\", \"notebook\"…"
                                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="inline-flex items-center bg-[#EF6A22] text-white px-5 py-2 rounded-lg hover:opacity-90 transition"
                                >
                                    Search
                                </button>
                                {searchQuery && (
                                    <button
                                        onClick={handleClear}
                                        className="inline-flex items-center border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white/90 backdrop-blur border border-orange-100 rounded-2xl shadow-sm p-4 md:p-6">
                    {searchQuery ? (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Search Results
                                </h2>
                                <div className="text-sm text-gray-500">
                                    Showing results for "{searchQuery}"
                                </div>
                            </div>
                            <ProductGridInfinity
                                key={`${searchQuery}-${refreshKey}`}
                                search={searchQuery}
                                initialLimit={20}
                            />
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
                            <p className="text-gray-500">Enter a product name, SKU, or category to find what you're looking for.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
