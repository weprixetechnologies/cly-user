'use client'
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import { addToCart as addToCartService } from '@/utils/cartService';
import { IoIosCall } from "react-icons/io";
import { FiShare2 } from "react-icons/fi";
import { BsArrowsAngleExpand, BsStarFill, BsStarHalf } from "react-icons/bs";
import { BiCategory, BiBarcode } from "react-icons/bi";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineShield, MdOutlineLocalShipping, MdOutlinePayment, MdOutlineDiamond } from "react-icons/md";

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

        try {
            await addToCartService({
                productID: product.productID,
                productName: product.productName,
                featuredImage: product.featuredImages,
                boxQty: product.boxQty || 0,
                units: quantity,
                productPrice: Number(product.productPrice || 0),
                minQty: minQty,
                discount: Number(product.pricing?.discount) || 0
            });
            toast(
                <div className="flex items-center gap-2 text-sm font-bold justify-center">
                    <span className="text-lg">🛍️</span> Yay! Added to Cart!
                </div>,
                {
                    position: "bottom-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: true,
                    style: {
                        backgroundColor: '#fff0f5',
                        color: '#ff6b81',
                        borderRadius: '999px',
                        boxShadow: '0 8px 20px -6px rgba(255, 107, 129, 0.5)',
                        border: '2px solid #ffccd5',
                        padding: '10px 20px',
                        margin: '0 auto 20px',
                        width: 'max-content',
                        textAlign: 'center'
                    }
                }
            );
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error adding to cart. Please try again.');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!product) return <div>Not found</div>;

    const gallery = Array.isArray(product.galleryImages) ? product.galleryImages : [];
    const allImages = [product.featuredImages, ...gallery].filter(Boolean);

    const isVideoUrl = (url) => {
        if (typeof url !== 'string') return false;
        const base = url.split('?')[0];
        return /\.(mp4|webm|ogg|mov|m4v)$/i.test(base);
    };

    const currentPrice = Number(product.productPrice || 0);
    const mrpCandidate = [product.mrp, product.productMRP, product.compareAtPrice, product.originalPrice]
        .find(v => typeof v !== 'undefined' && v !== null);
    const mrp = Number(mrpCandidate || 0);

    return (
        <>
            <div className="bg-[#FAFAFA] min-h-screen pb-12">
                <div className='px-4 sm:px-6 lg:px-12 xl:px-24 py-4 sm:py-6 max-w-[1600px] mx-auto'>
                    {/* Breadcrumbs */}
                    <nav className="flex text-sm text-gray-500 mb-6 font-medium">
                        <ol className="flex items-center space-x-2">
                            <li><a href="/" className="hover:text-[#004aad]">Home</a></li>
                            <li><span className="mx-2 text-gray-400">›</span></li>
                            <li>
                                <a href={product.categoryID ? `/categories/${product.categoryID}` : "/products"} className="hover:text-[#004aad]">
                                    {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean)[0] || 'Category'}
                                </a>
                            </li>
                            <li><span className="mx-2 text-gray-400">›</span></li>
                            <li className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-none">{product.productName}</li>
                        </ol>
                    </nav>

                    <div className='grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-12'>
                        {/* Left: gallery thumbnails and main image */}
                        <div className='flex flex-col lg:flex-row gap-4'>
                            {/* Thumbnails - vertical on desktop */}
                            <div className='hidden lg:flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar w-[90px] shrink-0'>
                                {allImages.length === 0 && (
                                    <div className='border border-gray-200 rounded-lg w-full aspect-square bg-gray-50' />
                                )}
                                {allImages.map((src, idx) => {
                                    const isVideo = isVideoUrl(src);
                                    const isActive = selectedImage === src;
                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedImage(src)}
                                            className={`w-full aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${isActive ? 'border-[#004aad] shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                                        >
                                            {isVideo ? (
                                                <video src={src} className="w-full h-full object-cover" muted loop playsInline />
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Main image */}
                            <div className='relative w-full bg-[#FDEAEF] rounded-2xl overflow-hidden shadow-sm flex-1'>
                                {/* Badges and Icons */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-[#004aad] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-sm">
                                        {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean)[0] || 'EXTRA ITEMS'}
                                    </span>
                                </div>
                                <button className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-gray-600 hover:text-gray-900 transition-colors">
                                    <BsArrowsAngleExpand size={16} />
                                </button>

                                {selectedImage ? (
                                    isVideoUrl(selectedImage) ? (
                                        <video src={selectedImage} controls className="w-full h-auto" />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={selectedImage} alt={product.productName} className="w-full h-auto" />
                                    )
                                ) : (
                                    <div className='flex items-center justify-center h-full text-gray-500'>No image</div>
                                )}
                            </div>

                            {/* Mobile thumbnails - horizontal scroll */}
                            <div className='lg:hidden mt-2 w-full'>
                                <div className='flex gap-3 overflow-x-auto pb-2 custom-scrollbar'>
                                    {allImages.map((src, idx) => {
                                        const isVideo = isVideoUrl(src);
                                        const isActive = selectedImage === src;
                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedImage(src)}
                                                className={`w-20 h-20 shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 ${isActive ? 'border-[#004aad] shadow-sm' : 'border-transparent hover:border-gray-300'}`}
                                            >
                                                {isVideo ? (
                                                    <video src={src} className="w-full h-full object-cover" muted loop playsInline />
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right: product info and CTA */}
                        <div className="flex flex-col pt-2 lg:pt-0">
                            <p className='text-sm font-semibold text-[#004aad] mb-1'>Cursive Letters</p>
                            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3 tracking-tight'>
                                {product.productName}
                            </h1>

                            {/* Ratings & Sales (Placeholder values as per mockup) */}
                            <div className="flex items-center flex-wrap gap-4 text-sm mb-5">
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <BsStarFill size={16} />
                                    <BsStarFill size={16} />
                                    <BsStarFill size={16} />
                                    <BsStarFill size={16} />
                                    <BsStarHalf size={16} />
                                    <span className="text-gray-700 font-semibold ml-1">4.8</span>
                                    <span className="text-gray-500">(128 reviews)</span>
                                </div>
                                <div className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></div>
                                <div className="text-gray-600 flex items-center gap-1.5">
                                    📈 <span>200+ sold</span>
                                </div>
                            </div>

                            {/* Price Area */}
                            <div className='flex items-baseline gap-3 mb-6'>
                                <p className='text-3xl sm:text-4xl font-bold text-[#004aad] tracking-tight'>
                                    ₹{currentPrice.toFixed(2)}
                                </p>
                                <span className="text-gray-600 font-medium text-lg">/ Piece</span>
                                <span className={`text-sm font-semibold ml-2 ${(product.inventory || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {(product.inventory || 0) > 0 ? '(Currently In-Stock)' : '(OUT OF STOCK)'}
                                </span>
                            </div>

                            {/* Quantity Info Box */}
                            <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6'>
                                <div className="flex-1 grid grid-cols-3 gap-0 border border-gray-200 rounded-xl divide-x divide-gray-200 bg-white overflow-hidden shadow-sm">
                                    <div className='text-center py-4 px-2 hover:bg-gray-50 transition-colors'>
                                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider mb-1'>Box Qty</p>
                                        <p className='font-bold text-lg text-gray-900'>{product.boxQty || 1}</p>
                                    </div>
                                    <div className='text-center py-4 px-2 bg-blue-50/30'>
                                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider mb-1'>Selected Qty</p>
                                        <p className='font-bold text-lg text-[#004aad]'>{quantity}</p>
                                    </div>
                                    <div className='text-center py-4 px-2 hover:bg-gray-50 transition-colors'>
                                        <p className='text-xs text-gray-500 font-medium uppercase tracking-wider mb-1'>Min Qty</p>
                                        <p className='font-bold text-lg text-gray-900'>{minQty}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsShareOpen(true)}
                                    className='flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-[0.98]'
                                >
                                    <FiShare2 size={18} />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Action Area */}
                            <div className="mb-6">
                                <p className='text-sm font-medium text-gray-700 mb-2'>
                                    Quantity (in multiples of {minQty})
                                </p>
                                <div className='flex flex-col sm:flex-row gap-3 items-stretch'>
                                    {/* Stepper */}
                                    <div className='flex items-center justify-between border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden sm:w-[160px] shrink-0 h-[52px]'>
                                        <button
                                            onClick={decrementQuantity}
                                            disabled={quantity <= minQty || isEditingQuantity}
                                            className={`w-12 h-full flex items-center justify-center text-xl transition-colors ${quantity <= minQty || isEditingQuantity ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'}`}
                                        >
                                            −
                                        </button>
                                        {isEditingQuantity ? (
                                            <input
                                                type="number"
                                                value={inputQuantity}
                                                onChange={handleQuantityChange}
                                                onBlur={handleQuantityBlur}
                                                onKeyDown={handleQuantityKeyDown}
                                                className='flex-1 text-center font-bold text-lg text-gray-900 border-none outline-none bg-transparent w-full'
                                                autoFocus
                                                min={minQty}
                                            />
                                        ) : (
                                            <div
                                                className='flex-1 text-center font-bold text-lg text-gray-900 cursor-pointer h-full flex items-center justify-center'
                                                onClick={handleQuantityClick}
                                                title="Click to edit quantity"
                                            >
                                                {quantity}
                                            </div>
                                        )}
                                        <button
                                            onClick={incrementQuantity}
                                            disabled={isEditingQuantity}
                                            className={`w-12 h-full flex items-center justify-center text-xl transition-colors ${isEditingQuantity ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 active:bg-gray-200'}`}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Action buttons */}
                                    <div className='flex gap-3 flex-1 h-[52px]'>
                                        <button
                                            onClick={addToCart}
                                            disabled={(product.inventory || 0) <= 0}
                                            className={`flex-1 rounded-xl font-bold text-white shadow-md shadow-[#EF6A22]/20 flex justify-center items-center gap-2 transition-all duration-300 active:scale-[0.98] ${(product.inventory || 0) <= 0
                                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                                : 'bg-[#EF6A22] hover:bg-[#d85c1b]'
                                                }`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            {(product.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>

                                        <button
                                            className='flex-1 bg-[#004aad] text-white rounded-xl font-bold flex justify-center items-center shadow-md shadow-[#004aad]/20 hover:bg-[#003882] transition-all duration-300 active:scale-[0.98]'
                                            onClick={() => window.location.href = '/contact'}
                                        >
                                            <IoIosCall size={20} className='mr-2' />
                                            <span>Get In Touch</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className='flex items-center border border-gray-200 rounded-xl bg-white p-3 divide-x divide-gray-200 shadow-sm mb-4'>
                                <div className="flex items-center gap-2 px-3 flex-1 text-sm text-gray-600">
                                    <BiBarcode size={18} className="text-gray-400" />
                                    <span className="font-semibold text-gray-800">SKU:</span>
                                    <span>{product.sku || '—'}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 flex-1 text-sm text-gray-600">
                                    <BiCategory size={18} className="text-gray-400" />
                                    <span className="font-semibold text-gray-800">Category:</span>
                                    <span className="uppercase text-[#004aad] font-bold">
                                        {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean)[0] || 'EXTRA ITEMS'}
                                    </span>
                                </div>
                            </div>

                            {/* Admin Approval Notice */}
                            <div className="bg-[#FFF8F1] border border-[#FFE7D1] rounded-xl p-4 flex gap-3 text-[#D97A26]">
                                <MdOutlineShield size={24} className="shrink-0 mt-0.5" />
                                <p className='text-sm leading-relaxed font-medium'>
                                    These products require admin approval. Once you place an order, our team will review it and get back to you shortly.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Benefits row */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 mb-8'>
                        <Feature
                            icon={<MdOutlineShield size={32} className="text-[#004aad]" />}
                            label="Quality Assured Products"
                            desc="We ensure the best quality"
                        />
                        <Feature
                            icon={<MdOutlineLocalShipping size={32} className="text-[#EF6A22]" />}
                            label="Fastrack Shipping"
                            desc="On time, every time"
                        />
                        <Feature
                            icon={<MdOutlinePayment size={32} className="text-green-600" />}
                            label="Advance Payment Available"
                            desc="Flexible & secure payments"
                        />
                        <Feature
                            icon={<MdOutlineDiamond size={32} className="text-blue-600" />}
                            label="Exclusive Products"
                            desc="Unique range for you"
                        />
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className='mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm'>
                            <h3 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                                <span className="w-1.5 h-6 bg-[#004aad] rounded-full inline-block"></span>
                                Product Description
                            </h3>
                            <div className='text-gray-700 leading-relaxed max-w-4xl'>{product.description}</div>
                        </div>
                    )}
                </div>
            </div>
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

function Feature({ icon, label, desc }) {
    return (
        <div className='border border-gray-100 rounded-2xl p-5 text-left bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-4'>
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div>
                <h4 className='font-bold text-gray-900 text-sm sm:text-base leading-tight mb-1'>{label}</h4>
                <p className='text-xs text-gray-500 font-medium'>{desc}</p>
            </div>
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

