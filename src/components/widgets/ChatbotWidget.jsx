'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaRobot, FaRedo, FaExternalLinkAlt, FaChevronRight, FaFileAlt } from 'react-icons/fa';

export default function ChatbotWidget({
    flow,
    botTitle = 'CLY Assistant',
    welcomeMessage,
    onOpenContactForm
}) {
    const router = useRouter();
    const chatEndRef = useRef(null);

    const initialStepId = flow?.initialStepId || flow?.steps?.[0]?.id || 'start';
    const initialStep = flow?.steps?.find(s => s.id === initialStepId) || flow?.steps?.[0] || {
        id: 'start',
        message: welcomeMessage || 'Hello! How can we help you today?',
        options: []
    };

    const [currentStepId, setCurrentStepId] = useState(initialStep.id);
    const [messages, setMessages] = useState([
        {
            id: 'init',
            sender: 'bot',
            text: welcomeMessage || initialStep.message,
            timestamp: new Date()
        }
    ]);
    const [isThinking, setIsThinking] = useState(false);

    const currentStep = flow?.steps?.find(s => s.id === currentStepId) || initialStep;

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleOptionClick = (option) => {
        if (!option) return;

        // Add user's choice to chat
        const userMsg = {
            id: `user_${Date.now()}`,
            sender: 'user',
            text: option.label,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsThinking(true);

        setTimeout(() => {
            setIsThinking(false);

            if (option.action === 'contact_form') {
                const botMsg = {
                    id: `bot_${Date.now()}`,
                    sender: 'bot',
                    text: 'Opening our quick inquiry form for you. Please enter your details below:',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
                if (onOpenContactForm) onOpenContactForm();
                return;
            }

            if (option.action === 'link') {
                const botMsg = {
                    id: `bot_${Date.now()}`,
                    sender: 'bot',
                    text: `Redirecting you to ${option.label}...`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);

                if (option.url) {
                    if (option.openInNewTab || option.url.startsWith('http')) {
                        window.open(option.url, option.openInNewTab ? '_blank' : '_self');
                    } else {
                        router.push(option.url);
                    }
                }
                return;
            }

            // Default: 'step' navigation
            const nextStep = flow?.steps?.find(s => s.id === option.nextStepId);
            if (nextStep) {
                setCurrentStepId(nextStep.id);
                const botMsg = {
                    id: `bot_${Date.now()}`,
                    sender: 'bot',
                    text: nextStep.message,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                const fallbackMsg = {
                    id: `bot_${Date.now()}`,
                    sender: 'bot',
                    text: "Thank you for your response! Would you like to check anything else?",
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, fallbackMsg]);
            }
        }, 350);
    };

    const handleRestart = () => {
        setCurrentStepId(initialStep.id);
        setMessages([
            {
                id: `reset_${Date.now()}`,
                sender: 'bot',
                text: welcomeMessage || initialStep.message,
                timestamp: new Date()
            }
        ]);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Top mini header inside widget */}
            <div className="px-4 py-2 bg-white/80 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1.5 font-medium text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Instant Assistant
                </span>
                <button
                    onClick={handleRestart}
                    title="Restart chat"
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer py-0.5 px-1.5 rounded hover:bg-gray-100"
                >
                    <FaRedo className="w-2.5 h-2.5" />
                    <span>Restart</span>
                </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'bot' && (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm text-xs">
                                <FaRobot className="w-3.5 h-3.5" />
                            </div>
                        )}
                        <div
                            className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs md:text-sm shadow-sm leading-relaxed ${
                                msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {isThinking && (
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                            <FaRobot className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white border border-gray-100 px-3 py-2 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Selectable Button Options */}
            <div className="p-3 bg-white border-t border-gray-100 shadow-inner">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    Select an option:
                </p>
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto no-scrollbar pr-0.5">
                    {currentStep?.options && currentStep.options.length > 0 ? (
                        currentStep.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleOptionClick(option)}
                                className="group w-full flex items-center justify-between text-left px-3 py-2 text-xs md:text-sm font-medium bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 text-gray-700 rounded-lg border border-gray-200/80 hover:border-blue-300 transition-all active:scale-[0.99] shadow-2xs"
                            >
                                <span className="flex-1 truncate">{option.label}</span>
                                <span className="ml-2 text-gray-400 group-hover:text-blue-600 flex-shrink-0 transition-transform group-hover:translate-x-0.5">
                                    {option.action === 'link' ? (
                                        <FaExternalLinkAlt className="w-2.5 h-2.5" />
                                    ) : option.action === 'contact_form' ? (
                                        <FaFileAlt className="w-2.5 h-2.5" />
                                    ) : (
                                        <FaChevronRight className="w-2.5 h-2.5" />
                                    )}
                                </span>
                            </button>
                        ))
                    ) : (
                        <button
                            onClick={handleRestart}
                            className="w-full text-center py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                            Start conversation over
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
