"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import logo from './../../../public/logo.jpg'
import { BsHandbag } from 'react-icons/bs'
import { CiUser } from 'react-icons/ci'
import { FiSearch } from 'react-icons/fi'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai'
import { useSelector } from 'react-redux'

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

    return (
        <div className="relative border-b border-gray-200">
            <div className="hidden md:flex topbar justify-between items-center py-2 px-6 bg-[#EF6A22] text-white">
                <p className='text-sm'>India's Largest Stationary Point for Imported Items</p>
                <div className="flex justify-end items-center gap-4">
                    <section className='text-sm border-r border-white pr-4'>
                        <a href="/account">Account</a>
                    </section>
                    <section className='text-sm border-r border-white pr-4'>
                        <a href="/account">How We Work</a>
                    </section>
                    <section className='text-sm'>
                        <a href="/account">Contact Us</a>
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
                        <form action="/search" method="get" className="relative w-full mb-3">
                            <label htmlFor="mobile-site-search" className="sr-only">Search</label>
                            <input
                                id="mobile-site-search"
                                name="q"
                                type="search"
                                placeholder="Search products..."
                                className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF6A22]"
                            />
                            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EF6A22]" aria-label="Search">
                                <FiSearch size={18} />
                            </button>
                        </form>
                        <ul className="flex flex-col divide-y divide-gray-100">
                            <li><a className="block py-3" href="/">Home</a></li>
                            <li><a className="block py-3" href="/products">Shop</a></li>
                            <li><a className="block py-3" href="/categories">Categories</a></li>
                            <li><a className="block py-3" href="/contact">Contact Us</a></li>
                            <li><a className="block py-3" href="/how-we-work">How We Work</a></li>
                            <li><a className="block py-3" href="/account">Account</a></li>
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
                    <div className="flex justify-between items-center gap-4">
                        <p>
                            <a href="/products">Shop Now</a>
                        </p>
                        <p>
                            <a href="/categories">Categories</a>
                        </p>
                    </div>
                </div>
                <div className="flex-1 px-6">
                    <form action="/search" method="get" className="relative max-w-xl mx-auto w-full">
                        <label htmlFor="site-search" className="sr-only">Search</label>
                        <input
                            id="site-search"
                            name="q"
                            type="search"
                            placeholder="Search products..."
                            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#EF6A22]"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#EF6A22]" aria-label="Search">
                            <FiSearch size={18} />
                        </button>
                    </form>
                </div>
                <div className="flex gap-4 items-center">
                    <a href="/cart" aria-label="Cart">
                        <BsHandbag size={24} />
                    </a>
                    <a href="/account" aria-label="Account">
                        <CiUser size={24} />
                    </a>
                    {isAuthenticated ? (
                        <a href="/account" className='bg-black text-white px-4 py-2 rounded-md hover:opacity-90 transition'>Profile</a>
                    ) : (
                        <a href="/login" className='bg-[#EF6A22] text-white px-4 py-2 rounded-md hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] transition-all duration-300 hover:cursor-pointer'>Sign In / Sign Up</a>
                    )}
                </div>
            </nav>
        </div>
    )
}

export default Header
