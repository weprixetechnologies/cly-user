'use client';

import { useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';
import ChatbotWidget from './ChatbotWidget';
import LeadCaptureForm from '../leads/LeadCaptureForm';
import { FaComments, FaClipboardList, FaTimes, FaRobot, FaMinus } from 'react-icons/fa';

export default function FloatingWidgets() {
    const [config, setConfig] = useState({
        contact_form_enabled: true,
        chatbot_enabled: true,
        contact_button_label: 'Quick Inquiry',
        chatbot_button_label: 'Chat with Us',
        chatbot_title: 'CLY Assistant',
        chatbot_welcome_message: 'Hi there! 👋 Welcome to Cursive Letters. How can we help you today?',
        contact_form_title: 'Quick Inquiry',
        contact_form_subtitle: 'Leave your contact and requirements. We will get back to you promptly!',
        shake_interval_seconds: 6,
        chatbot_flow: null
    });
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'contact'
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await axiosInstance.get('/widget/config');
            if (res.data?.success && res.data?.data) {
                setConfig(prev => ({ ...prev, ...res.data.data }));
                // Default active tab to whichever is enabled
                if (res.data.data.chatbot_enabled) {
                    setActiveTab('chat');
                } else if (res.data.data.contact_form_enabled) {
                    setActiveTab('contact');
                }
            }
        } catch (err) {
            // Silently fall back to defaults without breaking the page
            console.warn('Could not load dynamic widget config, using defaults:', err.message);
        }
    };

    if (!mounted) return null;

    const { contact_form_enabled, chatbot_enabled } = config;

    // If both are disabled by admin, render nothing
    if (!contact_form_enabled && !chatbot_enabled) {
        return null;
    }

    const handleToggle = (tabName) => {
        if (isOpen && activeTab === tabName) {
            setIsOpen(false);
        } else {
            setActiveTab(tabName);
            setIsOpen(true);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            {/* COMPACT MODAL (Anchored directly above buttons, shrinks on close) */}
            <div
                className={`fixed bottom-24 right-4 sm:right-6 w-[370px] max-w-[calc(100vw-2rem)] h-[530px] max-h-[calc(100vh-7.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200/80 flex flex-col overflow-hidden z-50 origin-bottom-right transition-all duration-300 ease-out ${
                    isOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
                }`}
                style={{
                    boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 0, 0, 0.05)'
                }}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-4 flex items-center justify-between flex-shrink-0 shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-inner">
                                {activeTab === 'chat' ? (
                                    <FaRobot className="w-5 h-5" />
                                ) : (
                                    <FaClipboardList className="w-5 h-5" />
                                )}
                            </div>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
                        </div>
                        <div>
                            <h4 className="font-bold text-sm leading-tight text-white">
                                {activeTab === 'chat'
                                    ? config.chatbot_title || 'CLY Assistant'
                                    : config.contact_form_title || 'Quick Inquiry'}
                            </h4>
                            <p className="text-[11px] text-blue-200/80 font-normal mt-0.5">
                                {activeTab === 'chat'
                                    ? 'Online • Instant Support'
                                    : 'Typically replies in 15 mins'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleClose}
                            title="Minimize"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                            <FaMinus className="w-3 h-3" />
                        </button>
                        <button
                            onClick={handleClose}
                            title="Close"
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                        >
                            <FaTimes className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Tab Switcher (Visible only if BOTH chatbot & contact form are enabled) */}
                {chatbot_enabled && contact_form_enabled && (
                    <div className="flex bg-slate-100 p-1 border-b border-gray-200/70 text-xs font-medium">
                        <button
                            type="button"
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'chat'
                                    ? 'bg-white text-blue-700 shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaComments className="w-3 h-3" />
                            <span>Chat</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('contact')}
                            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'contact'
                                    ? 'bg-white text-emerald-700 shadow-sm font-semibold'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FaClipboardList className="w-3 h-3" />
                            <span>Inquiry Form</span>
                        </button>
                    </div>
                )}

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    {activeTab === 'chat' && chatbot_enabled && (
                        <ChatbotWidget
                            flow={config.chatbot_flow}
                            botTitle={config.chatbot_title}
                            welcomeMessage={config.chatbot_welcome_message}
                            onOpenContactForm={() => setActiveTab('contact')}
                        />
                    )}

                    {activeTab === 'contact' && contact_form_enabled && (
                        <div className="p-2">
                            <LeadCaptureForm
                                source="floating_form"
                                variant="compact"
                                title=""
                                subtitle={config.contact_form_subtitle}
                                onSuccess={() => {}}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* FLOATING ACTION BUTTONS (Stacked at bottom-right) */}
            <div className="fixed bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end gap-3 select-none">
                {/* 1. Contact Form Floating Button (with periodic pure-CSS shake) */}
                {contact_form_enabled && (
                    <div className="relative group">
                        {/* Tooltip */}
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                            {config.contact_button_label || 'Quick Inquiry'}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleToggle('contact')}
                            aria-label={config.contact_button_label || 'Contact Form'}
                            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-transform active:scale-95 cursor-pointer relative ${
                                isOpen && activeTab === 'contact'
                                    ? 'bg-emerald-700 ring-4 ring-emerald-300'
                                    : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 hover:scale-105 animate-widget-shake'
                            }`}
                        >
                            {isOpen && activeTab === 'contact' ? (
                                <FaTimes className="w-5 h-5 text-white" />
                            ) : (
                                <FaClipboardList className="w-6 h-6 text-white" />
                            )}
                        </button>
                    </div>
                )}

                {/* 2. Chatbot Floating Button */}
                {chatbot_enabled && (
                    <div className="relative group">
                        {/* Tooltip */}
                        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
                            {config.chatbot_button_label || 'Chat with Us'}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleToggle('chat')}
                            aria-label={config.chatbot_button_label || 'Chatbot'}
                            className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:shadow-2xl transition-transform active:scale-95 cursor-pointer relative ${
                                isOpen && activeTab === 'chat'
                                    ? 'bg-blue-700 ring-4 ring-blue-300'
                                    : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:scale-105'
                            }`}
                        >
                            {isOpen && activeTab === 'chat' ? (
                                <FaTimes className="w-5 h-5 text-white" />
                            ) : (
                                <FaComments className="w-6 h-6 text-white" />
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
