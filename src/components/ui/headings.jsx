import React from 'react'

const Headings = ({ heading, subHeading }) => {
    return (
        <div className='mt-10'>
            <p className='text-sm text-center'>{subHeading}</p>
            <p className='text-2xl text-center'>{heading}</p>
        </div>
    )
}

export default Headings
