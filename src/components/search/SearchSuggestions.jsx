'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SearchSuggestions = ({ searchQuery, onSelect, isVisible, onClose }) => {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const containerRef = useRef(null)
    const router = useRouter()

    useEffect(() => {
        if (searchQuery && searchQuery.length >= 2) {
            // Debounce the search to prevent too many API calls
            const timeoutId = setTimeout(() => {
                fetchSuggestions(searchQuery)
            }, 300)

            return () => clearTimeout(timeoutId)
        } else {
            setSuggestions([])
        }
    }, [searchQuery])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose()
            }
        }

        const handleTouchOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleTouchOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleTouchOutside)
        }
    }, [onClose])

    const fetchSuggestions = async (query) => {
        setLoading(true)
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:9878/api'
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

            const response = await fetch(`${baseUrl}/products/list?search=${encodeURIComponent(query)}&limit=5&status=active`, {
                signal: controller.signal
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
                const products = data.data.products || []
                setSuggestions(products.slice(0, 5)) // Limit to 5 suggestions
            } else {
                setSuggestions([])
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching suggestions:', error)
            }
            setSuggestions([])
        } finally {
            setLoading(false)
        }
    }

    const handleSuggestionClick = (product) => {
        router.push(`/products/${product.productID}`)
        onClose()
    }

    const handleKeyDown = (e) => {
        if (!isVisible || suggestions.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex])
                } else {
                    onSelect(searchQuery)
                }
                break
            case 'Escape':
                onClose()
                break
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isVisible, suggestions, selectedIndex, searchQuery])

    if (!isVisible || (!loading && suggestions.length === 0)) {
        return null
    }

    return (
        <div
            ref={containerRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-[9999] mt-1 max-h-80 overflow-y-auto"
        >
            {loading ? (
                <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#EF6A22] mx-auto"></div>
                </div>
            ) : (
                <div className="py-1">
                    {suggestions.map((product, index) => (
                        <button
                            key={product.productID}
                            onClick={() => handleSuggestionClick(product)}
                            onTouchEnd={(e) => {
                                e.preventDefault()
                                handleSuggestionClick(product)
                            }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-3 transition-colors duration-150 ${index === selectedIndex ? 'bg-gray-50' : ''
                                }`}
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                {product.featuredImages ? (
                                    <img
                                        src={product.featuredImages}
                                        alt={product.productName}
                                        className="w-8 h-8 object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-xs text-gray-400">📦</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                    {product.productName}
                                </div>
                                <div className="text-xs text-gray-500">
                                    ₹{product.productPrice}
                                </div>
                            </div>
                        </button>
                    ))}
                    <div className="border-t border-gray-100">
                        <button
                            onClick={() => onSelect(searchQuery)}
                            onTouchEnd={(e) => {
                                e.preventDefault()
                                onSelect(searchQuery)
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-[#EF6A22] hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150"
                        >
                            Search for "{searchQuery}"
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchSuggestions
