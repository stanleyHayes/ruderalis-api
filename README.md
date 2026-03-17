# Ruderalis API

Backend REST API for a medical marijuana ecommerce platform built with Node.js, Express 5, and MongoDB (Mongoose 9).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose 9
- **Auth:** JWT with OTP verification
- **Email:** SendGrid
- **SMS:** Twilio
- **Images:** Cloudinary
- **Security:** Helmet, CORS, bcryptjs

## User Roles

| Role | Description |
|------|-------------|
| **Client (user)** | Browse products, place orders, write reviews, send messages |
| **Vendor** | Create shops & products, manage orders, view customers, run promotions |
| **Admin** | Manage all users, approve shops/products, moderate content, view dashboard |
| **Super Admin** | All admin permissions + manage other admin accounts |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance
- SendGrid API key
- Cloudinary account
- Twilio account (optional, SMS currently disabled)

### Installation

```bash
git clone <repo-url>
cd ruderalis-api
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=8080
NODE_ENV=development
MONGO_DB_URI=mongodb://localhost:27017/ruderalis
JWT_SECRET=your-jwt-secret
OTP_LENGTH=6
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_PHONE_NUMBER=your-twilio-phone-number
SENDGRID_API_KEY=your-sendgrid-api-key
SENGRID_FROM_EMAIL=your-verified-sender@example.com
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

### Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
node src/index.js
```

## API Endpoints

Base URL: `http://localhost:8080/api/v1`

### Client (User) Endpoints

Clients register with `role: "user"` (default). They can browse, order, review, and message.

#### Authentication (`/user/auth`) — Shared by clients and vendors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | - | Register new client account |
| POST | `/login` | - | Login with credentials |
| POST | `/otp/:token/verify` | - | Verify OTP after login |
| POST | `/otp/resend` | - | Resend OTP |
| GET | `/profile` | User | Get user profile |
| PUT | `/profile` | User | Update profile |
| PUT | `/profile/:token` | - | Verify profile with OTP |
| DELETE | `/profile` | User | Delete account |
| DELETE | `/profile/freeze` | User | Deactivate account |
| PUT | `/profile/activate` | - | Reactivate account |
| PUT | `/passwords/change` | User | Change password |
| PUT | `/passwords/reset` | - | Reset password with token |
| PUT | `/pins/change` | User | Change PIN |
| PUT | `/pins/reset` | - | Reset PIN with token |
| POST | `/logout` | User | Logout current device |
| POST | `/logoutAll` | User | Logout all devices |

#### Products (`/user/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create product (vendor) |
| GET | `/` | User | List products |
| GET | `/:id` | User | Get product details |
| PUT | `/:id` | User | Update product (owner) |
| DELETE | `/:id` | User | Delete product (owner) |

#### Shops (`/user/shops`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create shop (vendor) |
| GET | `/` | User | List shops |
| GET | `/:id` | User | Get shop details |
| PUT | `/:id` | User | Update shop (owner) |
| DELETE | `/:id` | User | Delete shop (owner) |

#### Orders (`/user/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Place an order |
| GET | `/` | User | List orders |
| GET | `/:id` | User | Get order details |
| PUT | `/:id` | User | Update order (pending only) |
| PUT | `/:id/cancel` | User | Cancel order (pending only) |

#### Reviews (`/user/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create product review |
| GET | `/` | User | List reviews |
| GET | `/:id` | User | Get review |
| PUT | `/:id` | User | Update review |
| DELETE | `/:id` | User | Delete review |

#### Shop Reviews (`/user/shop-reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create shop review |
| GET | `/` | User | List shop reviews |
| GET | `/:id` | User | Get shop review |
| PUT | `/:id` | User | Update shop review |
| DELETE | `/:id` | User | Delete shop review |

#### Payments (`/user/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Submit payment |
| GET | `/` | User | List payments |
| GET | `/:id` | User | Get payment details |

#### Promotions (`/user/promotions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create promotion |
| GET | `/` | User | List promotions |
| GET | `/:id` | User | Get promotion details |

#### Testimonials (`/user/testimonials`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Create testimonial |
| GET | `/` | User | List testimonials |
| GET | `/:id` | User | Get testimonial |
| PUT | `/:id` | User | Update testimonial |
| DELETE | `/:id` | User | Delete testimonial |

#### FAQs (`/user/faqs`) - Public

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | - | List visible FAQs |
| GET | `/:id` | - | Get FAQ |

#### Messages (`/user/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Send message to admin |
| GET | `/` | User | List messages |
| GET | `/:id` | User | Get message with reply |

#### Customers (`/user/customers`) - Vendors

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | User | List vendor's customers |

#### Shop Visits (`/user/shop-visits`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | User | Record shop visit |
| GET | `/` | User | List shop visits |

### Vendor Endpoints

Vendors register via `/user/auth/register` with `role: "vendor"` and authenticate through the same user auth flow. The vendor middleware enforces `role === 'vendor'`.

#### Shops (`/vendor/shops`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Vendor | Create shop |
| GET | `/` | Vendor | List own shops |
| GET | `/:id` | Vendor | Get own shop details |
| PUT | `/:id` | Vendor | Update own shop |
| DELETE | `/:id` | Vendor | Delete own shop |

#### Products (`/vendor/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Vendor | Create product |
| GET | `/` | Vendor | List own products |
| GET | `/:id` | Vendor | Get own product details |
| PUT | `/:id` | Vendor | Update own product |
| DELETE | `/:id` | Vendor | Delete own product |

#### Orders (`/vendor/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List orders for own shops |
| GET | `/:id` | Vendor | Get order details |
| PUT | `/:id/status` | Vendor | Update order status (delivering/completed/cancelled) |
| PUT | `/:id/item-status` | Vendor | Update individual item status |

#### Product Reviews (`/vendor/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List reviews on own products |
| GET | `/:id` | Vendor | Get review |
| PUT | `/:id/visibility` | Vendor | Toggle review visibility |

#### Shop Reviews (`/vendor/shop-reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List reviews on own shops |
| GET | `/:id` | Vendor | Get shop review |
| PUT | `/:id/visibility` | Vendor | Toggle review visibility |

#### Customers (`/vendor/customers`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List customers who ordered from your shops |

#### Promotions (`/vendor/promotions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Vendor | Create promotion for shop/product |
| GET | `/` | Vendor | List own promotions |
| GET | `/:id` | Vendor | Get promotion details |

#### Payments (`/vendor/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List own payments |
| GET | `/:id` | Vendor | Get payment details |

#### Shop Visits (`/vendor/shop-visits`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | List visits to own shops |

#### Dashboard (`/vendor/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Vendor | Vendor dashboard (shops, products, orders, revenue) |
| GET | `/analytics` | Vendor | Vendor analytics (orders by date, top products, visits) |

### Admin Endpoints

#### Authentication (`/admin/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | - | Register admin |
| POST | `/login` | - | Admin login |
| POST | `/otp/:token/verify` | - | Verify OTP |
| POST | `/otp/resend` | - | Resend OTP |
| GET | `/profile` | Admin | Get admin profile |
| PUT | `/profile` | Admin | Update profile |
| PUT | `/profile/:token` | - | Verify admin profile |
| PUT | `/passwords/change` | Admin | Change password |
| PUT | `/passwords/reset` | - | Reset password |
| PUT | `/pins/change` | Admin | Change PIN |
| PUT | `/pins/reset` | - | Reset PIN |
| POST | `/logout` | Admin | Logout |
| POST | `/logoutAll` | Admin | Logout all devices |

#### User Management (`/admin/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all users (filter by status, role, search) |
| GET | `/:id` | Admin | Get user details |
| PUT | `/:id/status` | Admin | Update user status |
| PUT | `/:id/permissions` | Admin | Update user permissions |

#### Shop Management (`/admin/shops`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all shops |
| GET | `/:id` | Admin | Get shop details |
| PUT | `/:id/approve` | Admin | Approve shop |
| PUT | `/:id/suspend` | Admin | Suspend shop |
| PUT | `/:id/feature` | Admin | Set featured status |
| PUT | `/:id/status` | Admin | Update shop status |

#### Product Management (`/admin/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all products |
| GET | `/:id` | Admin | Get product details |
| PUT | `/:id/approve` | Admin | Approve product |
| PUT | `/:id/feature` | Admin | Set featured status |
| PUT | `/:id/sale` | Admin | Set sale status |
| PUT | `/:id/status` | Admin | Update product status |

#### Order Management (`/admin/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List all orders |
| GET | `/:id` | Admin | Get order details |
| PUT | `/:id/status` | Admin | Update order status |

#### Review Management (`/admin/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List product reviews |
| GET | `/:id` | Admin | Get review |
| PUT | `/:id/visibility` | Admin | Toggle visibility |
| DELETE | `/:id` | Admin | Delete review |

#### Shop Review Management (`/admin/shop-reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List shop reviews |
| GET | `/:id` | Admin | Get shop review |
| PUT | `/:id/visibility` | Admin | Toggle visibility |
| DELETE | `/:id` | Admin | Delete shop review |

#### Testimonial Management (`/admin/testimonials`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List testimonials |
| GET | `/:id` | Admin | Get testimonial |
| PUT | `/:id/visibility` | Admin | Toggle visibility |
| DELETE | `/:id` | Admin | Delete testimonial |

#### FAQ Management (`/admin/faqs`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Admin | Create FAQ |
| GET | `/` | Admin | List FAQs |
| GET | `/:id` | Admin | Get FAQ |
| PUT | `/:id` | Admin | Update FAQ |
| DELETE | `/:id` | Admin | Delete FAQ |

#### Message Management (`/admin/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List messages |
| GET | `/:id` | Admin | Get message (auto-marks as read) |
| PUT | `/:id/reply` | Admin | Reply to message |

#### Admin Management (`/admin/admins`) - Super Admin Only

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List admins |
| GET | `/:id` | Admin | Get admin |
| PUT | `/:id` | Admin | Update admin (status, role, permissions) |
| DELETE | `/:id` | Admin | Delete admin |

#### Payment Management (`/admin/payments`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List payments |
| GET | `/:id` | Admin | Get payment |
| PUT | `/:id/status` | Admin | Update payment status |

#### Promotion Management (`/admin/promotions`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | List promotions |
| GET | `/:id` | Admin | Get promotion |
| PUT | `/:id/status` | Admin | Update promotion status |

#### Dashboard (`/admin/dashboard`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Admin | Dashboard summary (counts & revenue) |
| GET | `/analytics` | Admin | Analytics (orders by date, top products/shops) |

## Authentication Flow

1. **Register** - Create account with credentials
2. **Verify Profile** - Confirm account via OTP sent to email
3. **Login** - Submit credentials, receive OTP via email
4. **Verify OTP** - Submit OTP to receive JWT token (24h expiry)
5. **Use Token** - Include `Authorization: Bearer <token>` in requests

## Project Structure

```
src/
├── config/
│   └── keys.js              # Environment config
├── controllers/
│   └── v1/
│       ├── admin/            # Admin controllers (14 files)
│       ├── vendor/           # Vendor controllers (10 files)
│       └── user/             # Client controllers (13 files)
├── middleware/
│   └── v1/
│       ├── admin/
│       │   └── authenticate.js
│       ├── vendor/
│       │   └── authenticate.js  # Enforces role=vendor
│       └── user/
│           └── authenticate.js
├── models/
│   └── v1/                   # Mongoose models (14 files)
├── routes/
│   └── v1/
│       ├── admin/            # Admin routes (14 files)
│       ├── vendor/           # Vendor routes (10 files)
│       └── user/             # Client routes (13 files)
├── utils/
│   ├── check-permission.js   # Permission checker
│   ├── emails.js             # SendGrid integration
│   ├── sms.js                # Twilio integration
│   └── upload.js             # Cloudinary integration
└── index.js                  # App entry point
```

## API Documentation

- **OpenAPI Spec:** `openapi.yaml`
- **Postman Collection:** `ruderalis-api.postman_collection.json`

## License

ISC
