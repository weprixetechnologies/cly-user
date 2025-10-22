# Cart Page Implementation

This document describes the cart page implementation with modern design and functionality.

## Features

### 🛒 Cart Management
- **Cart Items Display**: Shows all cart items with product images, names, variations, and pricing
- **Item Removal**: Remove items with confirmation dialog
- **Combo Items Support**: Displays combo items as part of main products
- **Quantity Management**: Shows selected quantities and variations

### 💰 Order Summary
- **Price Breakdown**: Subtotal, delivery fees, and total
- **Coupon Support**: Apply and remove discount coupons
- **Free Delivery**: Shows free delivery eligibility for orders over ₹499
- **Savings Display**: Shows amount saved with coupons

### 📍 Address & Payment
- **Address Selection**: Choose from saved addresses or add new ones
- **Payment Methods**: Support for COD and PhonePe payments
- **Step-by-step Process**: Clear progression through cart → address → payment

### 🎨 Modern UI/UX
- **Responsive Design**: Works on mobile and desktop
- **Loading States**: Skeleton loaders and spinners
- **Toast Notifications**: Success/error messages
- **Smooth Animations**: Transitions and hover effects

## Components Structure

```
src/
├── app/cart/page.js                 # Main cart page
├── components/
│   ├── pageComponents/
│   │   ├── cartItems.jsx           # Cart items display
│   │   ├── breakdownCart.jsx       # Order summary
│   │   ├── selectAddress.jsx       # Address selection
│   │   ├── selectPayment.jsx       # Payment method selection
│   │   └── validateCoupon.jsx      # Coupon validation
│   ├── ui/
│   │   ├── CheckoutLoadingModal.jsx # Payment processing modal
│   │   └── alert-dialog.jsx        # Confirmation dialogs
│   └── providers/
│       └── ReduxProvider.jsx       # Redux store provider
└── redux/
    ├── store.js                    # Redux store configuration
    └── slices/
        └── cartSlice.js            # Cart state management
```

## Redux State Management

The cart uses Redux Toolkit for state management with the following structure:

```javascript
{
  cart: {
    cart: [],           // Array of cart items
    cartDetail: {},     // Cart summary with totals
    loading: false,     // Loading state
    error: null         // Error messages
  }
}
```

### Available Actions
- `getCartAsync()` - Fetch cart data
- `removeCartItemAsync(cartItemID)` - Remove item from cart
- `updateCartItemAsync({cartItemID, quantity})` - Update item quantity
- `clearCartAsync()` - Clear entire cart

## API Endpoints

The cart integrates with the following backend endpoints:

- `GET /cart` - Fetch cart data
- `DELETE /cart/item/:cartItemID` - Remove cart item
- `PUT /cart/item/:cartItemID` - Update cart item
- `DELETE /cart/clear` - Clear cart
- `POST /coupon/validate` - Validate coupon code
- `GET /user/addresses` - Fetch user addresses
- `POST /order/place-order` - Place order

## Dependencies

- `@reduxjs/toolkit` - State management
- `react-redux` - React Redux bindings
- `react-spinners` - Loading spinners
- `react-toastify` - Toast notifications
- `react-icons` - Icon components
- `axios` - HTTP client

## Usage

The cart page is automatically available at `/cart` route. It includes:

1. **Step 1 - Cart**: View items, apply coupons, manage quantities
2. **Step 2 - Address & Payment**: Select delivery address and payment method
3. **Order Placement**: Process payment and redirect to success page

## Styling

The implementation uses Tailwind CSS with custom utility classes:
- `.line-clamp-1` - Text truncation
- `.text-secondary-text-deep` - Secondary text color
- `.bg-primary-yellow` - Primary yellow background
- `.mb-15` - Custom margin bottom

## Mobile Responsiveness

- Fixed bottom button on mobile for easy checkout
- Responsive grid layout for cart items
- Touch-friendly interface elements
- Optimized spacing and typography for small screens
