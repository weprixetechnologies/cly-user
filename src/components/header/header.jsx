"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import logo from './../../../public/logo.png'
import { BsHandbag, BsCart3 } from 'react-icons/bs'
import { CiUser } from 'react-icons/ci'
import { FiSearch } from 'react-icons/fi'
import { AiOutlineMenu, AiOutlineClose, AiOutlineCheckCircle } from 'react-icons/ai'
import { MdLocalShipping, MdKeyboardArrowDown } from 'react-icons/md'
import { BiPhone, BiEnvelope } from 'react-icons/bi'
import { useUser } from '@/hooks/useUser'
import SearchSuggestions from '../search/SearchSuggestions'
import { fetchCart } from '@/utils/cartService'

const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'Categories', href: '/categories' },
    { name: 'Blog', href: '/blog' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Affiliate Dashboard', href: '/affiliate-dashboard' },
]

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const [cartItemCount, setCartItemCount] = useState(0)
    const [cartTotal, setCartTotal] = useState(0)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
    const [scrollPosition, setScrollPosition] = useState(0)
    const { user, loading, isAuthenticated } = useUser()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrollPosition(window.scrollY)
            if (window.scrollY > 150) {
                setIsScrolled(true)
            } else if (window.scrollY < 20) {
                setIsScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        setIsClient(true)
        const loadCart = async () => {
            try {
                const data = await fetchCart();
                setCartItemCount(data.cartDetail?.itemCount || 0);
                setCartTotal(data.cartDetail?.total || 0);
            } catch (e) {
                console.error(e);
            }
        };
        loadCart();

        window.addEventListener('cartUpdated', loadCart);
        return () => window.removeEventListener('cartUpdated', loadCart);
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
        <div className={`sticky top-0 z-[9999] bg-white transition-all duration-300 ${isScrolled ? 'shadow-md' : 'border-b border-gray-200'}`}>


            {/** Topbar */}
            <div className={`hidden md:flex topbar justify-between items-center px-6 bg-[#6E2594] text-white transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0' : 'max-h-12 py-2 opacity-100'}`}>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <MdLocalShipping size={18} />
                    <span>Reliable Supply. Trusted Quality.</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium">
                    <AiOutlineCheckCircle size={18} />
                    <span>Importers &amp; Wholesalers of Premium Products</span>
                </div>
                <div className="flex justify-end items-center gap-6 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <BiPhone size={18} />
                        <span>Bulk Orders: +91 99589 66630</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BiEnvelope size={18} />
                        <a href="mailto:cursivelettersly@gmail.com" className="hover:underline"> cursivelettersly@gmail.com</a>
                    </div>
                </div>
            </div>

            {/** Mobile Topbar */}
            <div className="md:hidden flex justify-center items-center py-2 px-2 bg-[#EF6A22] text-white text-[11px] sm:text-xs font-medium tracking-wide">
                <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <span>India's Largest Stationary Point for Imported Items</span>
                </div>
            </div>

            {/** Mobile nav */}
            <nav className='md:hidden flex justify-between items-center py-3 px-4 bg-white'>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        aria-label="Toggle menu"
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                        onClick={toggleMobileMenu}
                        className="text-[#0B1536]"
                    >
                        {isMobileMenuOpen ? <AiOutlineClose size={26} /> : <AiOutlineMenu size={26} />}
                    </button>
                    <a href="/">
                        <Image src={logo} alt="logo" width={110} height={58} className="object-contain" />
                    </a>
                </div>
                <div className="flex items-center gap-4 sm:gap-5 text-[#0B1536]">
                    <button onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}>
                        <FiSearch size={24} className="text-[#0B1536]" />
                    </button>
                    <a href="/account" aria-label="Account">
                        <CiUser size={26} className="text-[#0B1536]" strokeWidth={1} />
                    </a>
                    <a href="/cart" aria-label="Cart" className="relative">
                        <BsCart3 size={24} className="text-[#0B1536]" />
                        <span className="absolute -top-1.5 -right-2 bg-[#EF6A22] text-white text-[11px] font-bold w-[20px] h-[20px] flex items-center justify-center rounded-full shadow-sm">
                            {cartItemCount}
                        </span>
                    </a>
                </div>
            </nav>

            {/** Mobile Search Bar (Toggleable) */}
            {isMobileSearchOpen && (
                <div className="md:hidden px-4 pb-3 pt-1 bg-white border-b border-gray-100">
                    <div className="relative w-full">
                        <form onSubmit={handleSearch} className="relative flex w-full">
                            <label htmlFor="mobile-site-search" className="sr-only">Search</label>
                            <div className="relative w-full flex items-center border border-gray-300 rounded-md focus-within:border-[#6E2594] focus-within:ring-1 focus-within:ring-[#6E2594]">
                                <input
                                    id="mobile-site-search"
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    placeholder="Search products..."
                                    className="w-full bg-transparent py-2.5 px-3 text-sm focus:outline-none"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck="false"
                                />
                                <button type="submit" className="bg-[#004aad] text-white p-2.5 rounded-r-md hover:bg-[#003882] transition-colors" aria-label="Search">
                                    <FiSearch size={18} />
                                </button>
                            </div>
                        </form>
                        <SearchSuggestions
                            searchQuery={searchQuery}
                            onSelect={handleSearchSelect}
                            isVisible={showSuggestions}
                            onClose={() => setShowSuggestions(false)}
                        />
                    </div>
                </div>
            )}

            {isMobileMenuOpen && (
                <div id="mobile-menu" className="md:hidden absolute left-0 right-0 top-full bg-white border-t border-gray-200 shadow-md z-50">
                    <div className="px-4 py-3">
                        <ul className="flex flex-col divide-y divide-gray-100">
                            {navItems.map(item => {
                                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                                return (
                                    <li key={item.name}>
                                        <a className={`block py-3 font-semibold ${isActive ? 'text-[#FFC107]' : 'text-gray-700'}`} href={item.href}>
                                            {item.name}
                                        </a>
                                    </li>
                                )
                            })}
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
                                                `Welcome Back, ${user?.name || 'Business'}!`
                                            )}
                                        </div>
                                        <a className="block text-[#6E2594] font-medium" href="/account">Account</a>
                                    </div>
                                ) : (
                                    <a className="block py-3 font-semibold" href="/account">Account</a>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            )}

            {/** Desktop nav */}
            <nav className={`hidden md:flex justify-between items-center px-6 bg-white transition-all duration-500 ${isScrolled ? 'py-2' : 'py-4'}`}>
                <div className="flex items-center gap-6">
                    <a href="/">
                        <div className={`transition-all duration-500 relative ${isScrolled ? 'w-[100px]' : 'w-[140px]'}`}>
                            <Image src={logo} alt="logo" width={140} height={70} className="w-full h-auto" />
                        </div>
                    </a>
                    <a href="/categories" className="flex items-center gap-2 bg-[#FFC107] text-black font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors">
                        <AiOutlineMenu size={20} />
                        All Categories
                    </a>
                </div>
                
                <div className="flex-1 max-w-2xl mx-8">
                    <form onSubmit={handleSearch} className="relative flex w-full">
                        <label htmlFor="site-search" className="sr-only">Search</label>
                        <div className="relative w-full flex items-center border border-gray-300 rounded-md bg-gray-50/50 focus-within:border-[#004aad] focus-within:ring-1 focus-within:ring-[#004aad]">
                            <FiSearch size={20} className="text-gray-400 ml-4" />
                            <input
                                id="site-search"
                                type="search"
                                value={searchQuery}
                                onChange={handleInputChange}
                                onFocus={handleInputFocus}
                                placeholder="Search for products, brands and more..."
                                className="w-full bg-transparent py-2.5 pl-3 pr-12 text-sm focus:outline-none"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                            />
                            <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#004aad] text-white p-1.5 rounded-md hover:bg-[#003882] transition-colors" aria-label="Search">
                                <FiSearch size={18} />
                            </button>
                        </div>
                        <SearchSuggestions
                            searchQuery={searchQuery}
                            onSelect={handleSearchSelect}
                            isVisible={showSuggestions}
                            onClose={() => setShowSuggestions(false)}
                        />
                    </form>
                </div>
                
                <div className="flex items-center gap-8">
                    <a href="/account" className="flex items-center gap-3 group">
                        <div className="bg-gray-100 p-2 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors">
                            <CiUser size={22} className="text-gray-600" />
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="text-gray-600 font-medium">Hi, {user?.name || 'Business'}</span>
                            <span className="font-bold flex items-center gap-1">My Account <MdKeyboardArrowDown /></span>
                        </div>
                    </a>
                    <a href="/cart" className="flex items-center gap-3 group">
                        <div className="relative bg-gray-100 p-2 rounded-full border border-gray-200 group-hover:border-gray-300 transition-colors">
                            <BsCart3 size={22} className="text-gray-600" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                {cartItemCount}
                            </span>
                        </div>
                        <div className="flex flex-col text-sm">
                            <span className="text-gray-600 font-medium">My Cart</span>
                            <span className="font-bold">₹{cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                    </a>
                </div>
            </nav>

            {/** Desktop Bottom Nav */}
            <div className={`hidden md:flex justify-center items-center px-6 bg-white border-t transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 py-0 opacity-0 border-transparent' : 'max-h-16 py-3 opacity-100 border-gray-100'}`}>
                <ul className="flex items-center gap-8 text-sm font-semibold text-gray-700">
                    {navItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                        return (
                            <li key={item.name}>
                                <a 
                                    href={item.href} 
                                    className={`relative block pb-1 transition-colors ${isActive ? 'text-[#FFC107] animated-border-active' : 'hover:text-[#6E2594]'}`}
                                >
                                    {item.name}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}

export default Header
