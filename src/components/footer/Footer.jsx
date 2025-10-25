"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axiosInstance from '@/utils/axiosInstance'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Add delay to let page load first
        const timer = setTimeout(() => {
            fetchContacts();
        }, 1000); // 1 second delay

        return () => clearTimeout(timer);
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await axiosInstance.get('/contact/active');
            setContacts(response.data.data);
        } catch (error) {
            console.error('Error fetching contact details:', error);
            // Keep default contact info if API fails
        } finally {
            setLoading(false);
        }
    };

    const getContactIcon = (type) => {
        switch (type) {
            case 'email':
                return (
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                );
            case 'phone':
                return (
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                );
            case 'address':
                return (
                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                );
            case 'social_media':
                return (
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/logo.jpg"
                                alt="CLY Logo"
                                className="h-8 w-auto"
                            />
                            <span className="text-xl font-bold">CLY</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                            India's Largest Stationary Point for Imported Items. Your one-stop destination for quality stationary products.
                        </p>
                        <div className="flex space-x-4">
                            {loading ? (
                                // Show loading state for social media
                                <div className="flex space-x-4">
                                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                                    <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
                                </div>
                            ) : (
                                // Show social media links from backend
                                contacts
                                    .filter(contact => contact.type === 'social_media')
                                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                    .map((contact, index) => {
                                        const getSocialIcon = (label) => {
                                            const lowerLabel = label?.toLowerCase() || '';
                                            if (lowerLabel.includes('facebook')) {
                                                return <FaFacebook className="h-6 w-6" />;
                                            } else if (lowerLabel.includes('instagram')) {
                                                return <FaInstagram className="h-6 w-6" />;
                                            } else if (lowerLabel.includes('twitter') || lowerLabel.includes('x')) {
                                                return <FaTwitter className="h-6 w-6" />;
                                            } else if (lowerLabel.includes('youtube')) {
                                                return <FaYoutube className="h-6 w-6" />;
                                            } else if (lowerLabel.includes('linkedin')) {
                                                return <FaLinkedin className="h-6 w-6" />;
                                            } else {
                                                // Default social media icon
                                                return <FaFacebook className="h-6 w-6" />;
                                            }
                                        };

                                        return (
                                            <a
                                                key={contact.id || index}
                                                href={contact.value}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-white transition-colors"
                                                title={contact.label}
                                            >
                                                <span className="sr-only">{contact.label}</span>
                                                {getSocialIcon(contact.label)}
                                            </a>
                                        );
                                    })
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Shop
                                </Link>
                            </li>
                            <li>
                                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Categories
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>


                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Customer Service</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/account" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    My Account
                                </Link>
                            </li>
                            <li>
                                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms-and-conditions" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-gray-300 hover:text-white transition-colors text-sm">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Contact Info</h3>
                        <div className="space-y-2 text-sm text-gray-300">
                            {loading ? (
                                // Show loading state with default info
                                <>
                                    <div className="flex items-start space-x-2">
                                        <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Loading contact details...</span>
                                    </div>
                                </>
                            ) : contacts.length > 0 ? (
                                // Show dynamic contact details (excluding social media)
                                contacts
                                    .filter(contact => contact.type !== 'social_media')
                                    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                                    .map((contact, index) => (
                                        <div key={contact.id || index} className="flex items-start space-x-2">
                                            {getContactIcon(contact.type)}
                                            <span>{contact.value}</span>
                                        </div>
                                    ))
                            ) : (
                                // Fallback to default contact info
                                <>
                                    <div className="flex items-start space-x-2">
                                        <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Your Business Address, City, State, India</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                        <span>support@cly.com</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                        </svg>
                                        <span>+91-XXXXXXXXXX</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <div className="text-sm text-gray-400">
                            © {new Date().getFullYear()} CLY. All rights reserved.
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                            <Link href="/terms-and-conditions" className="text-gray-400 hover:text-white transition-colors">
                                Terms & Conditions
                            </Link>
                            <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
                                Refund Policy
                            </Link>
                            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
