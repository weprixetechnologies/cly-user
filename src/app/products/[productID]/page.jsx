'use client'
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import { IoIosCall } from "react-icons/io";
import { FiShare2 } from "react-icons/fi";

export default function ProductDetail({ params }) {
    const resolvedParams = use(params);
    const { productID } = resolvedParams;
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [minQty, setMinQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditingQuantity, setIsEditingQuantity] = useState(false);
    const [inputQuantity, setInputQuantity] = useState('');
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const shareProduct = async () => {
        try {
            const url = typeof window !== 'undefined' ? window.location.href : '';
            const title = product?.productName || 'Check this product';
            const text = `Take a look at ${title}`;
            if (navigator.share) {
                await navigator.share({ title, text, url });
            } else {
                setIsShareOpen(true);
            }
        } catch (err) {
            setIsShareOpen(true);
        }
    };

    const copyLink = async () => {
        try {
            const url = typeof window !== 'undefined' ? window.location.href : '';
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1500);
            setTimeout(() => setCopied(false), 1500);
        } catch (_) {
            // no-op
        }
    };

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`https://api.cursiveletters.in/api/products/${productID}`);
                const data = await response.json();
                setProduct(data.data);
                console.log(data.minQty);

                const productMinQty = data.data?.minQty || 1;
                setMinQty(productMinQty);
                setQuantity(productMinQty); // Initialize to minQty
                const galleryInit = Array.isArray(data?.data?.galleryImages) ? data.data.galleryImages : [];
                const firstImage = data?.data?.featuredImages || galleryInit[0] || '';
                setSelectedImage(firstImage);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [productID]);

    // Helper functions for quantity management
    const incrementQuantity = () => {
        if (!isEditingQuantity) {
            setQuantity(prev => prev + minQty);
        }
    };

    const decrementQuantity = () => {
        if (!isEditingQuantity) {
            setQuantity(prev => Math.max(minQty, prev - minQty));
        }
    };

    // Function to round input to nearest multiple of minQty
    const roundToMinQtyMultiple = (value) => {
        const numValue = parseInt(value) || 0;
        if (numValue <= 0) return minQty;
        const rounded = Math.round(numValue / minQty) * minQty;
        return Math.max(minQty, rounded); // Ensure it's at least minQty
    };

    // Handle quantity editing
    const handleQuantityClick = () => {
        setIsEditingQuantity(true);
        setInputQuantity(quantity.toString());
    };

    const handleQuantityChange = (e) => {
        setInputQuantity(e.target.value);
    };

    const handleQuantityBlur = () => {
        const roundedValue = roundToMinQtyMultiple(inputQuantity);
        setQuantity(roundedValue);
        setIsEditingQuantity(false);
        setInputQuantity('');
    };

    const handleQuantityKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleQuantityBlur();
        } else if (e.key === 'Escape') {
            setIsEditingQuantity(false);
            setInputQuantity('');
        }
    };

    const addToCart = async () => {
        // Check if product is in stock
        if ((product.inventory || 0) <= 0) {
            alert('This product is currently out of stock.');
            return;
        }

        const uid = typeof window !== 'undefined' ? localStorage.getItem('uid') : null;

        try {
            await axiosInstance.post(`/cart/${uid}/add`, {
                productID: product.productID,
                productName: product.productName,
                featuredImage: product.featuredImages,
                boxQty: 0,
                units: quantity
            });
            alert('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Please Login to Add To Cart');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Not found</div>;

    const gallery = Array.isArray(product.galleryImages) ? product.galleryImages : [];
    const allImages = [product.featuredImages, ...gallery].filter(Boolean);


    const currentPrice = Number(product.productPrice || 0);
    const mrpCandidate = [product.mrp, product.productMRP, product.compareAtPrice, product.originalPrice]
        .find(v => typeof v !== 'undefined' && v !== null);
    const mrp = Number(mrpCandidate || 0);

    return (
        <>
            <div className='px-4 sm:px-30 py-4 sm:py-5'>
                <div className='grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-24'>
                    {/* Left: gallery thumbnails and main image */}
                    <div className='grid grid-cols-1 lg:grid-cols-[90px_1fr] gap-4 lg:gap-16'>
                        {/* Thumbnails - hidden on mobile, shown on desktop */}
                        <div className='hidden lg:flex flex-col gap-2 max-h-[520px] overflow-y-auto'>
                            {allImages.length === 0 && (
                                <div className='border border-gray-200 rounded-lg w-20 h-20' />
                            )}
                            {allImages.map((src, idx) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={idx}
                                    src={src}
                                    alt={`thumb-${idx}`}
                                    onClick={() => setSelectedImage(src)}
                                    style={{
                                        width: 80,
                                        height: 80,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: selectedImage === src ? '2px solid #111' : '1px solid #eee',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Main image */}
                        <div className='relative w-full aspect-square border border-gray-200 rounded-xl overflow-hidden bg-gray-50'>
                            {selectedImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={selectedImage} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <div className='flex items-center justify-center h-full text-gray-500'>No image</div>
                            )}
                        </div>

                        {/* Mobile thumbnails - horizontal scroll */}
                        <div className='lg:hidden mt-4'>
                            <div className='flex gap-2 overflow-x-auto pb-2'>
                                {allImages.map((src, idx) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`thumb-${idx}`}
                                        onClick={() => setSelectedImage(src)}
                                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-all duration-200 flex-shrink-0 ${selectedImage === src
                                            ? 'border-2 border-gray-900 ring-2 ring-gray-200'
                                            : 'border border-gray-200 hover:border-gray-400'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: product info and CTA */}
                    <div>
                        <marquee behavior="" direction="">Cursive Letters ✨ Special Offers 🎉 </marquee>
                        <p className='text-sm text-gray-500 mt-2' style={{ fontFamily: 'var(--font-montserrat)' }}> {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean).map((c) => (
                            <span key={c} style={{ fontFamily: 'var(--font-montserrat)' }}>{c}</span>
                        ))}</p>
                        <p className='text-xl sm:text-2xl font-bold' style={{ fontFamily: 'var(--font-montserrat)' }}>{product.productName}</p>
                        {/* {product.description && (
                        <div className='text-sm text-gray-500 mt-2 line-clamp-3' style={{ fontFamily: 'var(--font-montserrat)' }}>{product.description}</div>
                    )} */}

                        <p className='text-lg sm:text-2xl mt-4 mb-2 text-gray-500 font-bold' style={{ fontFamily: 'var(--font-montserrat)' }}>
                            ₹{currentPrice.toFixed(2)} / Piece <span className={`text-xs font-normal ${(product.inventory || 0) > 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontFamily: 'var(--font-montserrat)' }}>
                                {(product.inventory || 0) > 0 ? '(Currently In-Stock)' : '(OUT OF STOCK)'}
                            </span>
                        </p>
                        <div className='flex items-center justify-between gap-2'>

                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 border border-gray-300 rounded-md p-2 sm:p-3 mt-3 flex-1">
                                <section className='text-center sm:text-left'>
                                    <p className='text-xs sm:text-sm text-gray-600'>Box Qty</p>
                                    <p className='font-semibold'>{product.boxQty}</p>
                                </section>
                                <section className='text-center sm:text-left'>
                                    <p className='text-xs sm:text-sm text-gray-600'>Selected Qty</p>
                                    <p className='font-semibold'>{quantity}</p>
                                </section>
                                <section className='text-center sm:text-left'>
                                    <p className='text-xs sm:text-sm text-gray-600'>Min Qty</p>
                                    <p className='font-semibold'>{minQty}</p>
                                </section>

                            </div>
                            <section className='flex items-center justify-center sm:justify-end'>
                                <button
                                    onClick={() => setIsShareOpen(true)}
                                    className='inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors'
                                    title='Share product'
                                >
                                    <FiShare2 size={18} />
                                    <span className='hidden sm:inline'>Share</span>
                                </button>
                            </section>
                        </div>

                        {/* Quantity selector */}
                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-2 w-full items-start sm:items-end'>
                            <div className='w-full sm:w-auto'>
                                <div className='text-sm text-gray-600 mb-2'>
                                    Quantity (in multiples of {minQty})
                                </div>
                                <div className='inline-flex items-center border border-gray-300 rounded-full overflow-hidden'>
                                    <button
                                        onClick={decrementQuantity}
                                        disabled={quantity <= minQty || isEditingQuantity}
                                        className={`px-4 py-2 transition-colors ${quantity <= minQty || isEditingQuantity
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        –
                                    </button>
                                    {isEditingQuantity ? (
                                        <input
                                            type="number"
                                            value={inputQuantity}
                                            onChange={handleQuantityChange}
                                            onBlur={handleQuantityBlur}
                                            onKeyDown={handleQuantityKeyDown}
                                            className='min-w-[56px] text-center font-bold text-gray-900 px-4 py-2 border-none outline-none bg-transparent'
                                            autoFocus
                                            min={minQty}
                                        />
                                    ) : (
                                        <div
                                            className='min-w-[56px] text-center font-bold text-gray-900 px-4 py-2 cursor-pointer hover:bg-gray-50 hover:border hover:border-gray-300 transition-colors rounded-sm'
                                            onClick={handleQuantityClick}
                                            title="Click to edit quantity"
                                        >
                                            {quantity}
                                        </div>
                                    )}
                                    <button
                                        onClick={incrementQuantity}
                                        disabled={isEditingQuantity}
                                        className={`px-4 py-2 transition-colors ${isEditingQuantity
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                            }`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons - stack on mobile, side by side on desktop */}
                            <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
                                <button
                                    onClick={addToCart}
                                    disabled={(product.inventory || 0) <= 0}
                                    className={`flex-1 px-4 py-3 sm:py-2 rounded-md h-[50px] flex justify-center items-center transition-all duration-300 ${(product.inventory || 0) <= 0
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-[#EF6A22] text-white hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] hover:cursor-pointer'
                                        }`}
                                >
                                    {(product.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                </button>

                                <button className='bg-[#2862AD] flex-1 text-white px-4 py-3 sm:py-2 rounded-md h-[50px] flex justify-center items-center hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] transition-all duration-300 hover:cursor-pointer' onClick={() => window.location.href = '/contact'}>
                                    <IoIosCall size={20} className='mr-2' />
                                    <span className='hidden sm:inline'>Get In Touch</span>
                                    <span className='sm:hidden'>Get In Touch</span>
                                </button>
                            </div>
                        </div>


                        {/* Meta */}
                        <div className='text-sm text-gray-600 mt-6'>
                            <span className='font-medium'>SKU:</span> {product.sku || '—'}
                        </div>
                        <div className='mt-4'>
                            <span className='text-sm text-gray-600 font-medium'>Categories:</span>
                            <div className='flex flex-wrap gap-2 mt-2'>
                                {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean).map((c) => (
                                    <span key={c} className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium'>
                                        {c}
                                    </span>
                                ))}
                                {product.themeCategory && (
                                    <span key={product.themeCategory} className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium'>
                                        {product.themeCategory}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="border border-gray-200 p-3 sm:p-4 bg-gray-50 rounded-lg mt-4">
                            <p className='text-sm text-gray-600 leading-relaxed'>
                                These products require admin approval. Once you place an order, our team will review it and get back to you shortly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits row */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8'>
                    <Feature label="Quality Assured Products" />
                    <Feature label="Fastrack Shipping" />
                    <Feature label="Cash on Delivery Available" />
                    <Feature label="Exclusive Products" />
                </div>

                {/* Description */}
                {product.description && (
                    <div className='mt-8 p-4 sm:p-6 bg-gray-50 rounded-lg'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Product Description</h3>
                        <div className='text-gray-700 leading-relaxed'>{product.description}</div>
                    </div>
                )}
            </div >
            {isShareOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                    <div className='absolute inset-0 bg-black/40' onClick={() => setIsShareOpen(false)} />
                    <div className='relative bg-white rounded-xl shadow-xl w-[90%] max-w-md p-5 border border-gray-200'>
                        <h3 className='text-lg font-semibold text-gray-900 mb-2'>Share this product</h3>
                        <p className='text-sm text-gray-600 mb-3'>Copy the link and share it with others.</p>
                        <div className='flex items-center gap-2'>
                            <input
                                readOnly
                                value={typeof window !== 'undefined' ? window.location.href : ''}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 bg-gray-50'
                            />
                            <button
                                onClick={copyLink}
                                className={`px-4 py-2 rounded-md text-white ${copied ? 'bg-green-600' : 'bg-gray-900 hover:bg-gray-800'}`}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                        <button
                            onClick={() => setIsShareOpen(false)}
                            className='mt-4 text-sm text-gray-600 hover:text-gray-800 underline'
                        >
                            Close
                        </button>

                        {showConfetti && <ConfettiBurst />}
                    </div>
                </div>
            )}
        </>
    );
}

function Feature({ label }) {
    return (
        <div className='border border-gray-200 rounded-xl p-4 sm:p-6 text-center bg-white hover:shadow-md transition-shadow duration-200'>
            <div className='font-semibold text-gray-900 text-sm sm:text-base'>{label}</div>
        </div>
    )
}

function ConfettiBurst() {
    const pieces = 60;
    const colors = ['#EF6A22', '#2862AD', '#22c55e', '#eab308', '#f43f5e'];
    const items = Array.from({ length: pieces });

    return (
        <div className='pointer-events-none absolute inset-0 overflow-hidden'>
            <style>{`
              @keyframes confetti-fall {
                0% { transform: translateY(-20%) rotate(0deg); opacity: 1; }
                100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
              }
            `}</style>
            {items.map((_, i) => {
                const left = Math.random() * 100; // vw
                const delay = Math.random() * 0.2; // s
                const size = 6 + Math.random() * 8; // px
                const duration = 0.9 + Math.random() * 0.9; // s
                const bg = colors[i % colors.length];
                const style = {
                    position: 'absolute',
                    top: '-10%',
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size * 0.6}px`,
                    backgroundColor: bg,
                    borderRadius: '2px',
                    transform: 'translateY(0)',
                    animation: `confetti-fall ${duration}s linear ${delay}s forwards`,
                };
                return <span key={i} style={style} />
            })}
        </div>
    );
}

