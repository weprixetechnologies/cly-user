"use client";

import React, { useEffect, useRef, useState } from "react";

const Preloader = () => {
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const timeoutRef = useRef(null);

    useEffect(() => {
        const handleLoaded = () => {
            setFadeOut(true);
            setTimeout(() => setVisible(false), 400);
        };

        // Hide when window finished loading, with a fallback timeout
        if (document.readyState === "complete") {
            handleLoaded();
        } else {
            window.addEventListener("load", handleLoaded);
            timeoutRef.current = setTimeout(handleLoaded, 1500);
        }

        return () => {
            window.removeEventListener("load", handleLoaded);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 grid place-items-center transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"
                }`}
            style={{
                backdropFilter: "blur(2px)",
            }}
        >
            <div className="absolute inset-0 bg-white/80" />
            <div className="relative flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin" />
                <p className="text-sm text-gray-700">Loading...</p>
            </div>
        </div>
    );
};

export default Preloader;


