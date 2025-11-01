'use client'

import { useEffect, useState } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import { ClipLoader } from 'react-spinners';

const ContactPage = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/contact/active');
            setContacts(response.data.data);
        } catch (error) {
            console.error('Error fetching contact details:', error);
            setError('Failed to load contact information');
        } finally {
            setLoading(false);
        }
    };

    const getContactIcon = (type) => {
        switch (type) {
            case 'email':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case 'phone':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                );
            case 'address':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'social_media':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                );
        }
    };

    const getContactColor = (type) => {
        switch (type) {
            case 'email':
                return 'from-blue-500 to-blue-600';
            case 'phone':
                return 'from-green-500 to-green-600';
            case 'address':
                return 'from-purple-500 to-purple-600';
            case 'social_media':
                return 'from-pink-500 to-pink-600';
            default:
                return 'from-gray-500 to-gray-600';
        }
    };

    // Separate headquarter contacts by explicit types
    const headquarterContacts = contacts.filter(contact => 
        (contact.type === 'headquarter_address' || contact.type === 'headquarter_phone') &&
        contact.value && 
        contact.value.trim() !== ''
    );

    // Separate office contacts (office addresses/phones but not headquarter)
    const officeContacts = contacts.filter(contact => 
        contact.label?.toLowerCase().includes('office') &&
        contact.type !== 'headquarter_address' &&
        contact.type !== 'headquarter_phone' &&
        contact.value && 
        contact.value.trim() !== ''
    );

    // Separate email and phone for CONTACT tablet
    const regularEmails = contacts.filter(contact => 
        contact.type === 'email' &&
        contact.type !== 'headquarter_address' &&
        contact.type !== 'headquarter_phone' &&
        !contact.label?.toLowerCase().includes('office') &&
        contact.value && 
        contact.value.trim() !== ''
    );

    const regularPhones = contacts.filter(contact => 
        contact.type === 'phone' &&
        contact.type !== 'headquarter_address' &&
        contact.type !== 'headquarter_phone' &&
        !contact.label?.toLowerCase().includes('office') &&
        contact.value && 
        contact.value.trim() !== ''
    );

    // Separate addresses for ADDRESS tablet
    const regularAddresses = contacts.filter(contact => 
        contact.type === 'address' &&
        contact.type !== 'headquarter_address' &&
        contact.type !== 'headquarter_phone' &&
        !contact.label?.toLowerCase().includes('office') &&
        contact.value && 
        contact.value.trim() !== ''
    );

    // Separate social media for SOCIAL MEDIA tablet
    const socialMediaContacts = contacts.filter(contact => 
        contact.type === 'social_media' &&
        contact.type !== 'headquarter_address' &&
        contact.type !== 'headquarter_phone' &&
        !contact.label?.toLowerCase().includes('office') &&
        contact.value && 
        contact.value.trim() !== ''
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <ClipLoader color="#8B5CF6" size={50} />
                    <p className="mt-4 text-gray-600">Loading contact information...</p>
                </div>
            </div>
        );
    }

    if (error || contacts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Contact Information Not Available</h2>
                        <p className="text-gray-600 mb-4">
                            {error || 'Contact information is not available at the moment.'}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                {/* Headquarter Section */}
                {headquarterContacts.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Headquarter</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {headquarterContacts.map((contact, index) => (
                                <div 
                                    key={contact.id || index} 
                                    className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-purple-300"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${getContactColor(contact.type === 'headquarter_phone' ? 'phone' : 'address')} rounded-lg flex items-center justify-center text-white`}>
                                            {getContactIcon(contact.type === 'headquarter_phone' ? 'phone' : 'address')}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{contact.label}</h3>
                                            {contact.type === 'headquarter_phone' ? (
                                                <a
                                                    href={`tel:${contact.value}`}
                                                    className="text-green-600 hover:text-green-700 transition-colors font-medium"
                                                >
                                                    {contact.value}
                                                </a>
                                            ) : contact.type === 'headquarter_address' ? (
                                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{contact.value}</p>
                                            ) : (
                                                <p className="text-gray-700">{contact.value}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Office Section */}
                {officeContacts.length > 0 && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Office</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {officeContacts.map((contact, index) => (
                                <div 
                                    key={contact.id || index} 
                                    className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-blue-300"
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${getContactColor(contact.type)} rounded-lg flex items-center justify-center text-white`}>
                                            {getContactIcon(contact.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2">{contact.label}</h3>
                                            {contact.type === 'phone' ? (
                                                <a
                                                    href={`tel:${contact.value}`}
                                                    className="text-green-600 hover:text-green-700 transition-colors font-medium"
                                                >
                                                    {contact.value}
                                                </a>
                                            ) : contact.type === 'address' ? (
                                                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{contact.value}</p>
                                            ) : (
                                                <p className="text-gray-700">{contact.value}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Contact Information Section - 3 Tabs */}
                {(regularEmails.length > 0 || regularPhones.length > 0 || regularAddresses.length > 0 || socialMediaContacts.length > 0) && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* CONTACT Tablet - Email & Phone Combined */}
                            {(regularEmails.length > 0 || regularPhones.length > 0) && (
                                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-blue-300">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Contact</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {/* Emails */}
                                        {regularEmails.map((contact, index) => (
                                            <div key={contact.id || index} className="border-l-4 border-blue-200 pl-4">
                                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">{contact.label}</h4>
                                                <a
                                                    href={`mailto:${contact.value}`}
                                                    className="text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    {contact.value}
                                                </a>
                                            </div>
                                        ))}
                                        
                                        {/* Phones */}
                                        {regularPhones.map((contact, index) => (
                                            <div key={contact.id || index} className="border-l-4 border-green-200 pl-4">
                                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">{contact.label}</h4>
                                                <a
                                                    href={`tel:${contact.value}`}
                                                    className="text-green-600 hover:text-green-700 transition-colors"
                                                >
                                                    {contact.value}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ADDRESS Tablet */}
                            {regularAddresses.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-purple-300">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Address</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {regularAddresses.map((contact, index) => (
                                            <div key={contact.id || index} className="border-l-4 border-purple-200 pl-4">
                                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">{contact.label}</h4>
                                                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">{contact.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SOCIAL MEDIA Tablet */}
                            {socialMediaContacts.length > 0 && (
                                <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 p-6 hover:shadow-xl transition-all hover:border-pink-300">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Social Media</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {socialMediaContacts.map((contact, index) => (
                                            <div key={contact.id || index} className="border-l-4 border-pink-200 pl-4">
                                                <h4 className="font-semibold text-gray-900 mb-1 text-sm">{contact.label}</h4>
                                                <a
                                                    href={contact.value}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-pink-600 hover:text-pink-700 transition-colors"
                                                >
                                                    {contact.value}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Additional Information */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Response</h3>
                            <p className="text-gray-600">We respond to all inquiries within 24 hours</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Service</h3>
                            <p className="text-gray-600">Dedicated to providing the best customer experience</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer First</h3>
                            <p className="text-gray-600">Your satisfaction is our top priority</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
