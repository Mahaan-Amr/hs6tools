# Coupon/Discount System Implementation Guide

## Overview

A complete coupon and discount system has been implemented to allow administrators to create promotional codes and customers to apply discounts during checkout.

## Database Schema

### Coupon Model

```prisma
model Coupon {
  id                String        @id @default(cuid())
  code              String        @unique
  description       String?
  discountType      DiscountType  // PERCENTAGE or FIXED_AMOUNT
  discountValue     Decimal       @db.Decimal(10, 2)
  minimumAmount     Decimal?     @db.Decimal(10, 2)
  maximumDiscount   Decimal?     @db.Decimal(10, 2)
  usageLimit        Int?         // Total usage limit (null = unlimited)
  usageCount        Int          @default(0)
  userUsageLimit    Int          @default(1) // Per user usage limit
  validFrom         DateTime
  validUntil        DateTime
  isActive          Boolean       @default(true)
  applicableTo      CouponApplicableTo @default(ALL)
  categoryIds       String[]     @default([])
  productIds        String[]     @default([])
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  orders            Order[]
}
```

### Enums

```prisma
enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum CouponApplicableTo {
  ALL
  CATEGORIES
  PRODUCTS
}
```

### Order Model Updates

Added fields to Order model:
- `couponId`: Reference to the coupon used
- `couponCode`: Stored coupon code for reference

## API Endpoints

### 1. List Coupons (Admin)
**GET** `/api/coupons`

Query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by code or description
- `isActive`: Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

### 2. Create Coupon (Admin)
**POST** `/api/coupons`

**Request Body:**
```json
{
  "code": "SAVE20",
  "description": "20% off on all products",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "minimumAmount": 100000,
  "maximumDiscount": 50000,
  "usageLimit": 100,
  "userUsageLimit": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "isActive": true,
  "applicableTo": "ALL",
  "categoryIds": [],
  "productIds": []
}
```

### 3. Get Coupon (Admin)
**GET** `/api/coupons/[id]`

### 4. Update Coupon (Admin)
**PUT** `/api/coupons/[id]`

### 5. Delete Coupon (Admin)
**DELETE** `/api/coupons/[id]`

- If coupon has been used, it will be deactivated instead of deleted
- If unused, it will be permanently deleted

### 6. Validate Coupon (Public)
**POST** `/api/coupons/validate`

**Request Body:**
```json
{
  "code": "SAVE20",
  "subtotal": 200000,
  "items": [
    {
      "productId": "product-id-1"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupon": {
      "id": "coupon-id",
      "code": "SAVE20",
      "description": "20% off",
      "discountType": "PERCENTAGE",
      "discountValue": 20
    },
    "discountAmount": 40000
  }
}
```

## Validation Rules

The coupon validation endpoint checks:

1. **Coupon Existence**: Code must exist in database
2. **Active Status**: Coupon must be active
3. **Validity Dates**: Current date must be between `validFrom` and `validUntil`
4. **Usage Limit**: Total usage count must be less than `usageLimit` (if set)
5. **Minimum Amount**: Order subtotal must meet `minimumAmount` (if set)
6. **User Usage Limit**: User must not have exceeded `userUsageLimit`
7. **Applicability**:
   - `ALL`: Applies to all products
   - `CATEGORIES`: At least one item must belong to specified categories
   - `PRODUCTS`: At least one item must be in specified products

## Discount Calculation

### Percentage Discount
```
discountAmount = (subtotal * discountValue) / 100
```

### Fixed Amount Discount
```
discountAmount = discountValue
```

### Maximum Discount Cap
If `maximumDiscount` is set:
```
discountAmount = Math.min(discountAmount, maximumDiscount)
```

### Final Validation
```
discountAmount = Math.min(discountAmount, subtotal)
```

## UI Integration

### Checkout Page

The checkout page includes:
- Coupon code input field
- Apply button
- Applied coupon display with discount amount
- Remove coupon option
- Error messages for invalid codes
- Real-time discount calculation in order summary

**Location**: `src/app/[locale]/checkout/CheckoutPageClient.tsx`

## Order Creation

When an order is created:
1. Coupon is re-validated at order creation time
2. Coupon ID and code are stored in the order
3. Discount amount is applied to order total
4. Coupon usage count is incremented

**Location**: `src/app/api/customer/orders/route.ts`

## Usage Examples

### Creating a Percentage Discount Coupon

```json
{
  "code": "WELCOME10",
  "description": "10% off for new customers",
  "discountType": "PERCENTAGE",
  "discountValue": 10,
  "minimumAmount": 50000,
  "usageLimit": 1000,
  "userUsageLimit": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "isActive": true,
  "applicableTo": "ALL"
}
```

### Creating a Fixed Amount Discount

```json
{
  "code": "SAVE50K",
  "description": "50,000 Toman off",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50000,
  "minimumAmount": 200000,
  "maximumDiscount": 50000,
  "usageLimit": 500,
  "userUsageLimit": 1,
  "validFrom": "2025-01-01T00:00:00Z",
  "validUntil": "2025-12-31T23:59:59Z",
  "isActive": true,
  "applicableTo": "ALL"
}
```

### Creating a Category-Specific Coupon

```json
{
  "code": "TOOLS20",
  "description": "20% off on tools",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "applicableTo": "CATEGORIES",
  "categoryIds": ["category-id-1", "category-id-2"]
}
```

## Security Considerations

1. **Admin-Only Access**: All coupon management endpoints require ADMIN or SUPER_ADMIN role
2. **Validation at Order Creation**: Coupons are re-validated when orders are created to prevent race conditions
3. **Usage Tracking**: Coupon usage is tracked per user and globally
4. **Case Insensitive**: Coupon codes are stored in uppercase for consistency

## Future Enhancements

Potential improvements:
- Admin UI for coupon management
- Coupon analytics and reporting
- Automatic coupon generation
- Customer-specific coupons
- Coupon expiration notifications
- Bulk coupon creation

## Related Files

- Database Schema: `prisma/schema.prisma`
- Coupon APIs: 
  - `src/app/api/coupons/route.ts`
  - `src/app/api/coupons/[id]/route.ts`
  - `src/app/api/coupons/validate/route.ts`
- Checkout Integration: `src/app/[locale]/checkout/CheckoutPageClient.tsx`
- Order Creation: `src/app/api/customer/orders/route.ts`

