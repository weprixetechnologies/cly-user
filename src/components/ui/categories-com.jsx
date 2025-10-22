import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CategoriesCom = ({ categories = [] }) => {
    return (
        <div className="flex flex-wrap gap-10 px-10 justify-center mt-[30px]">
            {categories.slice(0, 8).map((category, index) => (
                <div className='flex flex-col items-center justify-center gap-2 group' key={index}>
                    <Link href={`/categories/${category.categoryID}`} className='flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform duration-300'>
                        <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <Image
                                src={category.image || category.imgUrl || 'https://picsum.photos/200'}
                                alt='categories'
                                width={100}
                                height={100}
                                className='rounded-lg group-hover:scale-110 transition-transform duration-300'
                            />
                        </div>
                        <p className='text-sm max-w-[120px] text-center line-clamp-1 group-hover:text-blue-600 transition-colors duration-300' style={{ fontFamily: 'var(--font-montserrat)' }}>
                            {category.categoryName || category.name}
                        </p>
                    </Link>
                </div>
            ))}

            {/* View All Categories Button */}
            {categories.length > 8 && (
                <div className='flex flex-col items-center justify-center gap-2 group'>
                    <Link href="/categories" className='flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform duration-300'>
                        <div className="relative overflow-hidden rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-500 to-purple-600 w-[100px] h-[100px] flex items-center justify-center">
                            <div className="text-white text-2xl font-bold">+</div>
                        </div>
                        <p className='text-sm max-w-[120px] text-center line-clamp-1 group-hover:text-blue-600 transition-colors duration-300' style={{ fontFamily: 'var(--font-montserrat)' }}>
                            View All
                        </p>
                    </Link>
                </div>
            )}
        </div>
    )
}

export default CategoriesCom
