'use client'
import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import axiosInstance from '@/utils/axiosInstance';
import { IoIosCall } from "react-icons/io";

export default function ProductDetail({ params }) {
    const resolvedParams = use(params);
    const { productID } = resolvedParams;
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [minQty, setMinQty] = useState(1);
    const [selectedImage, setSelectedImage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await fetch(`http://72.60.219.181:3300/api/products/${productID}`);
                const data = await response.json();
                setProduct(data.data);
                console.log(data.data.minQty);

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
        setQuantity(prev => prev + minQty);
    };

    const decrementQuantity = () => {
        setQuantity(prev => Math.max(minQty, prev - minQty));
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
            alert('Failed to add to cart. Please try again.');
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
        <div className='px-30 py-5'>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                {/* Left: gallery thumbnails and main image */}
                <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
                        {allImages.length === 0 && (
                            <div style={{ border: '1px solid #eee', borderRadius: 8, width: 80, height: 80 }} />
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
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', border: '1px solid #eee', borderRadius: 12, overflow: 'hidden', background: '#fafafa' }}>
                        {selectedImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={selectedImage} alt={product.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No image</div>
                        )}
                    </div>
                </div>

                {/* Right: product info and CTA */}
                <div>
                    <marquee behavior="" direction="">Cursive Letters ✨ Special Offers 🎉 Free Shipping 🚚</marquee>
                    <p className='text-sm text-gray-500 mt-2' style={{ fontFamily: 'var(--font-montserrat)' }}> {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean).map((c) => (
                        <span key={c} style={{ fontFamily: 'var(--font-montserrat)' }}>{c}</span>
                    ))}</p>
                    <p className='text-2xl font-bold' style={{ fontFamily: 'var(--font-montserrat)' }}>{product.productName}</p>
                    {product.description && (
                        <div className='text-sm text-gray-500 mt-2 line-clamp-3' style={{ fontFamily: 'var(--font-montserrat)' }}>{product.description}</div>
                    )}

                    <p className='text-2xl mt-4 mb-2 text-gray-500 font-bold' style={{ fontFamily: 'var(--font-montserrat)' }}>
                        ₹{currentPrice.toFixed(2)} / Piece <span className={`text-xs font-normal ${(product.inventory || 0) > 0 ? 'text-green-500' : 'text-red-500'}`} style={{ fontFamily: 'var(--font-montserrat)' }}>
                            {(product.inventory || 0) > 0 ? '(Currently In-Stock)' : '(OUT OF STOCK)'}
                        </span>
                    </p>

                    <div className="flex flex-row gap-2 border border-gray-300 rounded-md p-2 mt-3">

                        <section className='flex-1'>
                            <p>Box Qty : {product.boxQty}</p>
                        </section>
                        <section className='flex-1'>
                            <p>Unit Qty : {quantity}</p>
                        </section>
                        <section className='flex-1'>
                            <p className='text-sm text-gray-600'>Min Qty : {minQty}</p>
                        </section>
                    </div>
                    {/* Quantity selector */}
                    <div className='flex flex-row gap-2 w-full  items-end'>
                        <div style={{ marginTop: 20 }}>
                            <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                                Quantity (in multiples of {minQty})
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                                <button
                                    onClick={decrementQuantity}
                                    disabled={quantity <= minQty}
                                    style={{
                                        padding: '10px 16px',
                                        background: quantity <= minQty ? '#f9fafb' : '#f3f4f6',
                                        color: quantity <= minQty ? '#9ca3af' : '#374151',
                                        cursor: quantity <= minQty ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    –
                                </button>
                                <div style={{ minWidth: 56, textAlign: 'center', fontWeight: 700 }}>{quantity}</div>
                                <button
                                    onClick={incrementQuantity}
                                    style={{ padding: '10px 16px', background: '#111', color: '#fff' }}
                                >
                                    +
                                </button>
                            </div>

                        </div>
                        <button
                            onClick={addToCart}
                            disabled={(product.inventory || 0) <= 0}
                            className={`flex-1 px-4 py-2 rounded-md h-[50px] flex justify-center items-center transition-all duration-300 ${(product.inventory || 0) <= 0
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-[#EF6A22] text-white hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] hover:cursor-pointer'
                                }`}
                        >
                            {(product.inventory || 0) <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button className='bg-[#2862AD] flex-1 text-white px-4 py-2 rounded-md h-[50px] flex justify-center items-center hover:bg-[#fff]/80 hover:text-[#EF6A22] hover:border hover:border-[#EF6A22] transition-all duration-300 hover:cursor-pointer'><IoIosCall size={20} /> Contact Us</button>
                    </div>


                    {/* Meta */}
                    <div style={{ marginTop: 18, fontSize: 14, color: '#666' }}>SKU: {product.sku || '—'}</div>
                    <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280' }}>Categories:</span>
                        {(Array.isArray(product.categories) ? product.categories : [product.categoryName]).filter(Boolean).map((c) => (
                            <span key={c} style={{ background: '#f3f4f6', padding: '6px 10px', borderRadius: 999, fontSize: 13 }}>{c}</span>
                        ))}
                    </div>
                    <div className="flex border border-gray-200 p-2 bg-gray-200 rounded-md mt-3">
                        <p className='text-sm text-gray-500'>These products require admin approval. Once you place an order, our team will review it and get back to you shortly.</p>
                    </div>
                </div>
            </div>

            {/* Benefits row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 28 }}>
                <Feature label="Quality Assured Products" />
                <Feature label="Fastrack & Free Shipping" />
                <Feature label="Cash on Delivery Available" />
                <Feature label="5 Days Return Policy" />
            </div>

            {/* Description */}
            {
                product.description && (
                    <div style={{ marginTop: 28, color: '#4b5563', lineHeight: 1.7 }}>{product.description}</div>
                )
            }
        </div >
    );
}

function Feature({ label }) {
    return (
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, textAlign: 'center', background: '#fff' }}>
            <div style={{ fontWeight: 600 }}>{label}</div>
        </div>
    )
}


