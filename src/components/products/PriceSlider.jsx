"use client"

import React, { useState, useEffect, useRef } from 'react'

const PriceSlider = ({ minPrice: initialMinPrice = '', maxPrice: initialMaxPrice = '', minRange = 0, maxRange = 1299, onChange }) => {
    const [minPrice, setMinPrice] = useState(initialMinPrice === '' ? minRange : parseFloat(initialMinPrice) || minRange)
    const [maxPrice, setMaxPrice] = useState(initialMaxPrice === '' ? maxRange : parseFloat(initialMaxPrice) || maxRange)
    const [minInputValue, setMinInputValue] = useState('')
    const [maxInputValue, setMaxInputValue] = useState('')
    const [isFocused, setIsFocused] = useState(null) // 'min' or 'max' or null
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isDragging, setIsDragging] = useState(null) // 'min' or 'max'
    const sliderRef = useRef(null)

    useEffect(() => {
        if (initialMinPrice !== '' && initialMinPrice !== undefined) {
            const val = parseFloat(initialMinPrice)
            if (!isNaN(val)) setMinPrice(Math.max(minRange, Math.min(maxRange, val)))
        } else {
            setMinPrice(minRange)
        }
    }, [initialMinPrice, minRange])

    useEffect(() => {
        if (initialMaxPrice !== '' && initialMaxPrice !== undefined) {
            const val = parseFloat(initialMaxPrice)
            if (!isNaN(val)) setMaxPrice(Math.max(minRange, Math.min(maxRange, val)))
        } else {
            setMaxPrice(maxRange)
        }
    }, [initialMaxPrice, maxRange, minRange])

    // Ensure minPrice is never greater than maxPrice
    useEffect(() => {
        if (minPrice > maxPrice) {
            setMaxPrice(minPrice)
        }
    }, [minPrice, maxPrice])

    // Ensure maxPrice is never less than minPrice
    useEffect(() => {
        if (maxPrice < minPrice) {
            setMinPrice(maxPrice)
        }
    }, [minPrice, maxPrice])

    const getPercentage = (value) => {
        return ((value - minRange) / (maxRange - minRange)) * 100
    }

    const handleMinInputChange = (e) => {
        const inputValue = e.target.value.replace(/[^0-9.]/g, '')
        setMinInputValue(inputValue)
        
        if (inputValue === '' || inputValue === '.') {
            return
        }
        const value = parseFloat(inputValue)
        if (!isNaN(value)) {
            const clampedValue = Math.max(minRange, Math.min(maxRange, Math.min(value, maxPrice)))
            setMinPrice(clampedValue)
            if (onChange) {
                onChange(clampedValue === minRange ? '' : clampedValue.toFixed(2), maxPrice === maxRange ? '' : maxPrice.toFixed(2))
            }
        }
    }

    const handleMaxInputChange = (e) => {
        const inputValue = e.target.value.replace(/[^0-9.]/g, '')
        setMaxInputValue(inputValue)
        
        if (inputValue === '' || inputValue === '.') {
            return
        }
        const value = parseFloat(inputValue)
        if (!isNaN(value)) {
            const clampedValue = Math.max(minRange, Math.min(maxRange, Math.max(value, minPrice)))
            setMaxPrice(clampedValue)
            if (onChange) {
                onChange(minPrice === minRange ? '' : minPrice.toFixed(2), clampedValue === maxRange ? '' : clampedValue.toFixed(2))
            }
        }
    }

    const handleMinFocus = () => {
        setIsFocused('min')
        setMinInputValue(minPrice.toString())
    }

    const handleMaxFocus = () => {
        setIsFocused('max')
        setMaxInputValue(maxPrice.toString())
    }

    const handleMinBlur = () => {
        setIsFocused(null)
        setMinInputValue('')
    }

    const handleMaxBlur = () => {
        setIsFocused(null)
        setMaxInputValue('')
    }

    const handleMouseDown = (type) => {
        setIsDragging(type)
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !sliderRef.current) return

            const rect = sliderRef.current.getBoundingClientRect()
            const x = e.clientX - rect.left
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
            const value = minRange + (percentage / 100) * (maxRange - minRange)

            if (isDragging === 'min') {
                const newMin = Math.max(minRange, Math.min(maxPrice, value))
                setMinPrice(newMin)
                if (onChange) {
                    onChange(newMin === minRange ? '' : newMin.toFixed(2), maxPrice === maxRange ? '' : maxPrice.toFixed(2))
                }
            } else if (isDragging === 'max') {
                const newMax = Math.max(minPrice, Math.min(maxRange, value))
                setMaxPrice(newMax)
                if (onChange) {
                    onChange(minPrice === minRange ? '' : minPrice.toFixed(2), newMax === maxRange ? '' : newMax.toFixed(2))
                }
            }
        }

        const handleMouseUp = () => {
            setIsDragging(null)
        }

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            return () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, minPrice, maxPrice, minRange, maxRange, onChange])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price)
    }

    const minPercentage = getPercentage(minPrice)
    const maxPercentage = getPercentage(maxPrice)

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-black">Price</h3>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
            </div>

            {!isCollapsed && (
                <>
                    {/* Input Fields */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₹</span>
                            <input
                                type="text"
                                value={isFocused === 'min' ? minInputValue : formatPrice(minPrice)}
                                onChange={handleMinInputChange}
                                onFocus={handleMinFocus}
                                onBlur={handleMinBlur}
                                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₹</span>
                            <input
                                type="text"
                                value={isFocused === 'max' ? maxInputValue : formatPrice(maxPrice)}
                                onChange={handleMaxInputChange}
                                onFocus={handleMaxFocus}
                                onBlur={handleMaxBlur}
                                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Slider Bar */}
                    <div className="relative mb-4">
                        <div
                            ref={sliderRef}
                            className="relative h-2 bg-black rounded-full"
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Active Range */}
                            <div
                                className="absolute h-2 bg-black rounded-full"
                                style={{
                                    left: `${minPercentage}%`,
                                    width: `${maxPercentage - minPercentage}%`
                                }}
                            />
                            {/* Min Handle */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-black rounded-full cursor-grab active:cursor-grabbing"
                                style={{ left: `${minPercentage}%` }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    handleMouseDown('min')
                                }}
                            />
                            {/* Max Handle */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-black rounded-full cursor-grab active:cursor-grabbing"
                                style={{ left: `${maxPercentage}%` }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    handleMouseDown('max')
                                }}
                            />
                        </div>
                    </div>

                    {/* Current Range Display */}
                    <div className="text-sm text-gray-600">
                        Price: Rs. {formatPrice(minPrice)} - Rs. {formatPrice(maxPrice)}
                    </div>
                </>
            )}
        </div>
    )
}

export default PriceSlider

