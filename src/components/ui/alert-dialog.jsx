"use client"
import React, { createContext, useContext, useState } from 'react';
import { RxCross2 } from "react-icons/rx";

const AlertDialogContext = createContext();

const AlertDialog = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <AlertDialogContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </AlertDialogContext.Provider>
    );
};

const AlertDialogTrigger = ({ children, asChild = false }) => {
    const { setIsOpen } = useContext(AlertDialogContext);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: () => setIsOpen(true)
        });
    }

    return (
        <button onClick={() => setIsOpen(true)}>
            {children}
        </button>
    );
};

const AlertDialogContent = ({ children }) => {
    const { isOpen, setIsOpen } = useContext(AlertDialogContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <RxCross2 size={20} />
                </button>
                {children}
            </div>
        </div>
    );
};

const AlertDialogHeader = ({ children }) => (
    <div className="mb-4">
        {children}
    </div>
);

const AlertDialogTitle = ({ children }) => (
    <h2 className="text-lg font-semibold text-gray-900 mb-2">
        {children}
    </h2>
);

const AlertDialogDescription = ({ children }) => (
    <p className="text-sm text-gray-600">
        {children}
    </p>
);

const AlertDialogFooter = ({ children }) => (
    <div className="flex justify-end gap-3 mt-6">
        {children}
    </div>
);

const AlertDialogCancel = ({ children, ...props }) => (
    <button
        {...props}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
        {children}
    </button>
);

const AlertDialogAction = ({ children, ...props }) => (
    <button
        {...props}
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    >
        {children}
    </button>
);

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
};
