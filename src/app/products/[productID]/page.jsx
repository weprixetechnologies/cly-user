'use client'
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import { addToCart as addToCartService } from '@/utils/cartService';
import { IoIosCall } from "react-icons/io";
import { FiShare2 } from "react-icons/fi";
import { BsArrowsAngleExpand, BsStarFill, BsStarHalf, BsStar, BsHandThumbsUp, BsFlag, BsCheckCircleFill } from "react-icons/bs";
import { BiCategory, BiBarcode, BiX } from "react-icons/bi";
import { getCookie } from '@/utils/cookieUtil';
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

    // Reviews & Star Ratings state
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ avgRating: 0.0, reviewCount: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    const [userReviews, setUserReviews] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reviewsSort, setReviewsSort] = useState('newest');
    const [ratingFilter, setRatingFilter] = useState(null);

    // Form/Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalRating, setModalRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [modalTitle, setModalTitle] = useState('');
    const [modalBody, setModalBody] = useState('');
    const [modalImages, setModalImages] = useState([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [imageLightboxUrl, setImageLightboxUrl] = useState(null);

    // Load functions
    const loadSummary = async () => {
        try {
            const res = await axiosInstance.get(`/products/${productID}/reviews/summary`);
            if (res.data?.success) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching rating summary:', err);
        }
    };

    const loadReviews = async (page = 1, sort = 'newest', rating = null) => {
        setReviewsLoading(true);
        try {
            let url = `/products/${productID}/reviews?page=${page}&limit=6&sort=${sort}`;
            if (rating) {
                url += `&rating=${rating}`;
            }
            const res = await axiosInstance.get(url);
            if (res.data?.success) {
                setReviews(res.data.data || []);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setReviewsLoading(false);
        }
    };

    const loadUserReviews = async () => {
        const loggedIn = !!getCookie('_at');
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            try {
                const res = await axiosInstance.get('/users/me/reviews');
                if (res.data?.success) {
                    setUserReviews(res.data.data || []);
                }
            } catch (err) {
                console.error('Error fetching user reviews:', err);
            }
        }
    };

    // Trigger loads
    useEffect(() => {
        loadSummary();
        loadUserReviews();
    }, [productID]);

    useEffect(() => {
        if (summary.reviewCount !== undefined) {
            const totalCount = ratingFilter ? (summary.distribution[ratingFilter] || 0) : summary.reviewCount;
            setTotalPages(Math.max(1, Math.ceil(totalCount / 6)));
            loadReviews(currentPage, reviewsSort, ratingFilter);
        }
    }, [productID, currentPage, reviewsSort, ratingFilter, summary.reviewCount]);

    const handleVoteHelpful = async (reviewID) => {
        if (!isLoggedIn) {
            toast.error('Please login to vote.');
            return;
        }
        try {
            const res = await axiosInstance.post(`/reviews/${reviewID}/vote`);
            if (res.data?.success) {
                toast.success(res.data.message);
                // Update local review object state directly so it increments/decrements dynamically
                setReviews(prev => prev.map(r => {
                    if (r.id === reviewID) {
                        return {
                            ...r,
                            helpfulCount: res.data.data.helpfulCount
                        };
                    }
                    return r;
                }));
            }
        } catch (err) {
            console.error('Error voting helpful:', err);
            toast.error(err.response?.data?.message || 'Failed to vote.');
        }
    };

    const handleReportReview = async (reviewID) => {
        if (!isLoggedIn) {
            toast.error('Please login to report.');
            return;
        }
        const reason = window.prompt('Please enter the reason for reporting this review:');
        if (reason === null) return; // cancelled
        if (reason.trim() === '') {
            toast.error('Reason is required.');
            return;
        }
        try {
            const res = await axiosInstance.post(`/reviews/${reviewID}/report`, { reason });
            if (res.data?.success) {
                toast.success(res.data.message);
            }
        } catch (err) {
            console.error('Error reporting review:', err);
            toast.error(err.response?.data?.message || 'Failed to report review.');
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (modalImages.length + files.length > 3) {
            toast.error('Maximum 3 images are allowed.');
            return;
        }

        setIsUploadingImages(true);
        try {
            // Bunny CDN configuration
            const storageZone = 'cly-bunny';
            const storageRegion = 'storage.bunnycdn.com';
            const pullZoneUrl = 'https://cly-pull-bunny.b-cdn.net';
            const apiKey = '22cfd8b3-8021-40a3-b100a9d48bc0-7dc3-4654';

            const uploadedUrls = [];
            for (const file of files) {
                const randStr = Math.random().toString(36).substring(2, 9);
                const fileName = encodeURIComponent(`review_${productID}_${Date.now()}_${randStr}_${file.name}`);
                const uploadUrl = `https://${storageRegion}/${storageZone}/${fileName}`;
                const publicUrl = `${pullZoneUrl}/${fileName}`;

                const res = await fetch(uploadUrl, {
                    method: 'PUT',
                    headers: {
                        AccessKey: apiKey,
                        'Content-Type': file.type,
                    },
                    body: file,
                });

                if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);
                uploadedUrls.push(publicUrl);
            }

            setModalImages(prev => [...prev, ...uploadedUrls]);
            toast.success('Images uploaded successfully!');
        } catch (err) {
            console.error('Error uploading images to Bunny CDN:', err);
            toast.error('Failed to upload images.');
        } finally {
            setIsUploadingImages(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (modalRating < 1 || modalRating > 5) {
            toast.error('Rating must be between 1 and 5 stars.');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await axiosInstance.post(`/products/${productID}/reviews`, {
                rating: modalRating,
                title: modalTitle,
                body: modalBody,
                images: modalImages
            });
            if (res.data?.success) {
                toast.success(res.data.message);
                setIsModalOpen(false);
                setModalRating(5);
                setModalTitle('');
                setModalBody('');
                setModalImages([]);
                
                // Reload states
                await loadSummary();
                await loadUserReviews();
                setCurrentPage(1);
                loadReviews(1, reviewsSort, ratingFilter);
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            toast.error(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleRemoveModalImage = (indexToRemove) => {
        setModalImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const hasReviewed = userReviews.some(r => r.productID === productID);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<BsStarFill key={i} className="text-amber-400" size={14} />);
            } else if (i === fullStars + 1 && hasHalf) {
                stars.push(<BsStarHalf key={i} className="text-amber-400" size={14} />);
            } else {
                stars.push(<BsStar key={i} className="text-gray-200" size={14} />);
            }
        }
        return stars;
    };
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
                const response = await fetch(`http://localhost:9878/api/products/${productID}`);
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

                            {/* Ratings & Sales (Dynamic) */}
                            <div className="flex items-center flex-wrap gap-4 text-sm mb-5">
                                <div 
                                    className="flex items-center gap-1.5 text-amber-400 cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => {
                                        const el = document.getElementById('reviews-section');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                >
                                    <div className="flex items-center gap-0.5">
                                        {renderStars(summary.avgRating || 0)}
                                    </div>
                                    <span className="text-gray-700 font-semibold ml-1">{Number(summary.avgRating || 0).toFixed(1)}</span>
                                    <span className="text-gray-500">({summary.reviewCount || 0} reviews)</span>
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

                    {/* Reviews & Ratings Module */}
                    <div id="reviews-section" className='mt-8 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm scroll-mt-6'>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-5 mb-6 gap-4">
                            <div>
                                <h3 className='text-xl font-bold text-gray-900 flex items-center gap-2'>
                                    <span className="w-1.5 h-6 bg-[#EF6A22] rounded-full inline-block"></span>
                                    Customer Reviews
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">Read reviews and share your experience with other customers</p>
                            </div>
                            
                            {/* Write Review Trigger Button */}
                            {isLoggedIn ? (
                                !hasReviewed ? (
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="px-4 py-2.5 bg-[#EF6A22] hover:bg-[#d85c1b] text-white font-bold text-sm rounded-xl transition duration-200 active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                                    >
                                        ✍️ Write a Review
                                    </button>
                                ) : (
                                    <span className="text-xs font-semibold px-3 py-2 bg-green-50 border border-green-150 text-green-700 rounded-xl flex items-center gap-1.5">
                                        <BsCheckCircleFill className="text-green-500" size={14} /> You already reviewed this product
                                    </span>
                                )
                            ) : (
                                <button 
                                    onClick={() => window.location.href = '/login'}
                                    className="px-4 py-2.5 border border-gray-200 hover:border-orange-200 hover:bg-orange-50/30 text-gray-700 font-bold text-sm rounded-xl transition duration-200 active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                                >
                                    🔑 Log in to write a review
                                </button>
                            )}
                        </div>

                        {/* Summary Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-center bg-gray-50/50 border border-gray-100 rounded-2xl p-6">
                            {/* Overall Stats */}
                            <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200/60 pb-6 md:pb-0 md:pr-6">
                                <div className="text-5xl font-black text-gray-900 tracking-tight">{Number(summary.avgRating || 0).toFixed(1)}</div>
                                <div className="flex items-center gap-1 text-amber-400 mt-2">
                                    {renderStars(summary.avgRating || 0)}
                                </div>
                                <div className="text-xs text-gray-500 font-medium mt-2">Based on {summary.reviewCount || 0} reviews</div>
                            </div>

                            {/* Breakdown Bars */}
                            <div className="md:col-span-8 space-y-2">
                                {[5, 4, 3, 2, 1].map(stars => {
                                    const count = summary.distribution[stars] || 0;
                                    const percent = summary.reviewCount > 0 ? Math.round((count / summary.reviewCount) * 100) : 0;
                                    const isFiltered = ratingFilter === stars;
                                    return (
                                        <div 
                                            key={stars} 
                                            onClick={() => {
                                                if (summary.reviewCount === 0) return;
                                                setRatingFilter(isFiltered ? null : stars);
                                                setCurrentPage(1);
                                            }}
                                            className={`flex items-center gap-3 text-xs cursor-pointer select-none group py-0.5 px-2 rounded-lg transition ${summary.reviewCount > 0 ? 'hover:bg-orange-50/40' : 'opacity-60 cursor-default'} ${isFiltered ? 'bg-orange-50/80 font-bold' : ''}`}
                                        >
                                            <span className="w-10 text-gray-600 font-semibold group-hover:text-[#EF6A22] transition-colors">{stars} star</span>
                                            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden border border-gray-200/50">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-500" 
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                            <span className="w-8 text-right text-gray-500 group-hover:text-gray-700 transition-colors">{percent}%</span>
                                            <span className="w-8 text-right text-gray-400 font-medium">({count})</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Reviews Filter Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">Sort:</span>
                                <select 
                                    value={reviewsSort} 
                                    onChange={(e) => {
                                        setReviewsSort(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="border border-gray-200 rounded-lg py-1.5 px-3 bg-white outline-none focus:ring-1 focus:ring-[#EF6A22] focus:border-transparent text-xs text-gray-700 font-medium"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="helpful">Most Helpful</option>
                                    <option value="rating_high">Highest Rated</option>
                                    <option value="rating_low">Lowest Rated</option>
                                </select>
                            </div>
                            
                            {ratingFilter && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-medium">
                                        Filtering: {ratingFilter} star reviews
                                    </span>
                                    <button 
                                        onClick={() => setRatingFilter(null)}
                                        className="text-xs text-[#EF6A22] hover:text-[#d85c1b] underline font-bold"
                                    >
                                        Clear Filter
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Reviews List */}
                        {reviewsLoading ? (
                            <div className="py-12 text-center text-sm text-gray-500">Loading reviews...</div>
                        ) : reviews.length === 0 ? (
                            <div className="py-12 text-center text-sm text-gray-400 font-medium border border-dashed border-gray-200 rounded-2xl">
                                {ratingFilter 
                                    ? `No ${ratingFilter} star reviews found for this product.` 
                                    : 'No reviews found. Be the first to write a review!'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map(review => (
                                    <div key={review.id} className="p-5 bg-white border border-gray-150 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4 h-full">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-4">
                                                {/* Reviewer Meta */}
                                                <div className="flex items-center gap-3">
                                                    <img 
                                                        src={review.reviewerPhoto || 'https://picsum.photos/100/100?random=reviewer'} 
                                                        alt={review.reviewerName}
                                                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                                    />
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                            {review.reviewerName}
                                                            <span className="text-[10px] text-green-600 bg-green-50 border border-green-200/60 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                                                                ✓ Verified
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stars */}
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>

                                            {/* Title & Body */}
                                            <div>
                                                {review.title && <h4 className="text-sm font-bold text-gray-900 mb-1">{review.title}</h4>}
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{review.body || 'No description provided.'}</p>
                                            </div>

                                            {/* Images */}
                                            {review.images && review.images.length > 0 && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    {review.images.map((imgUrl, idx) => (
                                                        <img 
                                                            key={idx}
                                                            src={imgUrl}
                                                            alt={`Review photo ${idx + 1}`}
                                                            onClick={() => setImageLightboxUrl(imgUrl)}
                                                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-85 transition-opacity"
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-3">
                                            {/* Actions */}
                                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                                <button 
                                                    onClick={() => handleVoteHelpful(review.id)}
                                                    className="flex items-center gap-1 hover:text-[#EF6A22] transition-colors"
                                                >
                                                    <BsHandThumbsUp size={13} />
                                                    <span>Helpful ({review.helpfulCount || 0})</span>
                                                </button>
                                                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                                                <button 
                                                    onClick={() => handleReportReview(review.id)}
                                                    className="flex items-center gap-1 hover:text-red-500 transition-colors"
                                                >
                                                    <BsFlag size={12} />
                                                    <span>Report</span>
                                                </button>
                                            </div>

                                            {/* Store Reply */}
                                            {review.storeReply && (
                                                <div className="p-3 bg-orange-50/40 border border-orange-100 rounded-xl relative">
                                                    <div className="text-xs font-bold text-[#EF6A22] uppercase tracking-wider flex items-center gap-1">
                                                        🏢 Store Reply
                                                    </div>
                                                    <div className="text-xs text-gray-700 leading-relaxed mt-1">
                                                        {review.storeReply}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 border-t border-gray-100 pt-6 mt-6">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-600 hover:text-[#EF6A22] text-xs font-bold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="text-xs text-gray-500 font-medium">Page {currentPage} of {totalPages}</span>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-gray-200 hover:border-orange-200 hover:bg-orange-50/20 text-gray-600 hover:text-[#EF6A22] text-xs font-bold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Write Review Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
                                <button 
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                                >
                                    <BiX size={20} />
                                </button>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">Write a Review</h3>
                                <p className="text-xs text-gray-500 mb-6 font-medium">Share your rating and thoughts about: <span className="font-bold text-gray-800">{product.productName}</span></p>

                                <form onSubmit={handleSubmitReview} className="space-y-5">
                                    {/* Stars Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Your Rating *</label>
                                        <div className="flex items-center gap-1.5 text-2xl">
                                            {[1, 2, 3, 4, 5].map(val => (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(val)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setModalRating(val)}
                                                    className="focus:outline-none transition-transform active:scale-95 text-yellow-400"
                                                >
                                                    {(hoverRating || modalRating) >= val ? <BsStarFill /> : <BsStar className="text-gray-300" />}
                                                </button>
                                            ))}
                                            <span className="text-xs text-gray-500 font-bold ml-2">
                                                {(() => {
                                                    const current = hoverRating || modalRating;
                                                    if (current === 5) return 'Excellent';
                                                    if (current === 4) return 'Good';
                                                    if (current === 3) return 'Average';
                                                    if (current === 2) return 'Poor';
                                                    return 'Terrible';
                                                })()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Review Title */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Title (Optional)</label>
                                        <input
                                            type="text"
                                            value={modalTitle}
                                            onChange={(e) => setModalTitle(e.target.value)}
                                            placeholder="Example: Outstanding quality / Great value for money"
                                            maxLength={150}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none transition"
                                        />
                                    </div>

                                    {/* Review Body */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Review Details</label>
                                        <textarea
                                            value={modalBody}
                                            onChange={(e) => setModalBody(e.target.value)}
                                            placeholder="What did you like or dislike? How was the service?"
                                            rows={4}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-[#EF6A22] focus:border-transparent outline-none transition resize-none"
                                        />
                                    </div>

                                    {/* Photo Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Add Photos (Max 3)</label>
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Existing Upload Previews */}
                                            {modalImages.map((imgUrl, idx) => (
                                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                                                    <img src={imgUrl} alt="uploaded preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveModalImage(idx)}
                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <BiX size={18} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* File selector trigger */}
                                            {modalImages.length < 3 && (
                                                <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#EF6A22] transition bg-gray-50/50 flex flex-col items-center justify-center cursor-pointer ${isUploadingImages ? 'pointer-events-none opacity-50' : ''}`}>
                                                    <span className="text-xl">+</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">Upload</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        {isUploadingImages && <div className="text-[10px] text-orange-600 font-bold mt-1.5 animate-pulse">Uploading photos...</div>}
                                    </div>

                                    {/* Submit actions */}
                                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submittingReview || isUploadingImages}
                                            className="px-5 py-2.5 bg-[#EF6A22] hover:bg-[#d85c1b] text-white font-bold text-sm rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Image Lightbox Modal */}
                    {imageLightboxUrl && (
                        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" onClick={() => setImageLightboxUrl(null)}>
                            <button 
                                onClick={() => setImageLightboxUrl(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                            >
                                <BiX size={24} />
                            </button>
                            <img 
                                src={imageLightboxUrl} 
                                alt="Expanded view" 
                                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl animate-in zoom-in-95 duration-200" 
                            />
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

