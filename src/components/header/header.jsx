"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import logo from './../../../public/logo.png'
import { BsHandbag } from 'react-icons/bs'
import { CiUser } from 'react-icons/ci'
import { FiSearch } from 'react-icons/fi'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import { useUser } from '@/hooks/useUser'
import SearchSuggestions from '../search/SearchSuggestions'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const { user, loading, isAuthenticated } = useUser()
    const router = useRouter()

    useEffect(() => {
        setIsClient(true)
    }, [])

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
            setShowSuggestions(false)
        }
    }

    const handleSearchSelect = (query) => {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setShowSuggestions(false)
    }

    const handleInputChange = (e) => {
        setSearchQuery(e.target.value)
        setShowSuggestions(e.target.value.length >= 2)
    }

    const handleInputFocus = () => {
        if (searchQuery.length >= 2) {
            setShowSuggestions(true)
        }
    }

    return (
        <div className="sticky top-0 z-[9999] border-b border-gray-200">
            <div className="hidden md:flex topbar justify-between items-center py-2 px-6 bg-[#EF6A22] text-white">
                <p className='text-sm'>India's Largest Stationary Point for Imported Items</p>
                <div className="flex justify-end items-center gap-4">
                    <section className='text-sm border-r border-white pr-4'>
                        <a href="/account">Account</a>
                    </section>
                    <section className='text-sm border-r border-white pr-4'>
                        <a href="/about">About Us</a>
                    </section>
                    <section className='text-sm'>
                        <a href="/contact">Contact Us</a>
                    </section>
                </div>
            </div>
            {/** Mobile nav */}
            <nav className='md:hidden flex justify-between items-center py-2 px-4 bg-white'>
                <div className="flex items-center gap-3">

                    <a href="/">
                        <Image src={logo} alt="logo" width={110} height={58} />
                    </a>
                </div>
                <div className="flex items-center gap-4">
                    <a href="/cart" aria-label="Cart">
                        <BsHandbag size={22} />
                    </a>
                    <a href="/account" aria-label="Account">
                        <CiUser size={24} />
                    </a>
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-md border border-gray-200 hover:border-gray-300"
                    >
                        {isMobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div id="mobile-menu" className="md:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-md z-50">
                    <div className="px-4 py-3">
                        <div className="relative w-full mb-3">
                            <form onSubmit={handleSearch} className="relative">
                                <label htmlFor="mobile-site-search" className="sr-only">Search</label>
                                <input
                                    id="mobile-site-search"
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    placeholder="Search products..."
                                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                />
                                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EF6A22]" aria-label="Search">
                                    <FiSearch size={18} />
                                </button>
                            </form>
                            <SearchSuggestions
                                searchQuery={searchQuery}
                                onSelect={handleSearchSelect}
                                isVisible={showSuggestions}
                                onClose={() => setShowSuggestions(false)}
                            />
                        </div>
                        <ul className="flex flex-col divide-y divide-gray-100">
                            <li><a className="block py-3" href="/">Home</a></li>
                            <li><a className="block py-3" href="/products">Shop</a></li>
                            <li><a className="block py-3" href="/categories">Categories</a></li>
                            <li><a className="block py-3" href="/contact">Contact Us</a></li>
                            <li>
                                {isAuthenticated ? (
                                    <div className="py-3">
                                        <div className="text-sm text-gray-600 mb-1">
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                                    <span>Loading...</span>
                                                </div>
                                            ) : (
                                                `Welcome Back, ${user?.name || 'User'}!`
                                            )}
                                        </div>
                                        <a className="block text-[#EF6A22] font-medium" href="/account">Account</a>
                                    </div>
                                ) : (
                                    <a className="block py-3" href="/account">Account</a>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/** Desktop nav */}
            <nav className='hidden md:flex justify-between items-center py-2 px-6 bg-white'>
                <div className="flex gap-10 items-center">
                    <a href="/">
                        <Image src={logo} alt="logo" width={133} height={70} />
                    </a>
                    <div className="flex justify-between items-center gap-4 text-[#2862AD] font-medium">
                        <p>
                            <a href="/products" className='hover:text-[#EF6A22] transition-all duration-300 font-semibold'>Shop Now</a>
                        </p>
                        <p>
                            <a href="/categories" className='hover:text-[#EF6A22] transition-all duration-300 font-semibold'>Categories</a>
                        </p>
                    </div>
                </div>
                <div className="flex-1 px-2 sm:px-6">
                    <div className="relative max-w-xl mx-auto w-full">
                        <form onSubmit={handleSearch} className="relative">
                            <label htmlFor="site-search" className="sr-only">Search</label>
                            <input
                                id="site-search"
                                type="search"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Search products..."
                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EF6A22]" aria-label="Search">
                                <FiSearch size={18} />
                            </button>
                        </form>
                        <SearchSuggestions
                            searchQuery={searchQuery}
                            onSelect={handleSearchSelect}
                            isVisible={showSuggestions}
                            onClose={() => setShowSuggestions(false)}
                        />
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <a href="/cart" aria-label="Cart">
                        <BsHandbag size={24} />
                    </a>
                    <a href="/account" aria-label="Account">
                        <CiUser size={24} />
                    </a>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            {loading ? (
                                <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                        <span className="text-sm">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#EF6A22] text-white px-4 py-2 rounded-md hover:opacity-90 transition">
                                    <div className="text-sm font-medium">
                                        Welcome Back, {user?.name || 'User'}!
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <a href="/login" className='bg-[#EF6A22] text-white px-4 py-2 rounded-md hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] transition-all duration-300 hover:cursor-pointer'>Sign In / Sign Up</a>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Header
