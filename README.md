# ShopFlow Backend API

## Setup
```bash
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## API Endpoints

### Auth
| Method | Route | Auth |
|---|---|---|
| POST | /api/auth/register | Public |
| POST | /api/auth/login | Public |
| POST | /api/auth/logout | Protected |
| POST | /api/auth/refresh | Public |
| POST | /api/auth/forgot-password | Public |
| POST | /api/auth/reset-password | Public |
| PUT | /api/auth/change-password | Protected |
| GET | /api/auth/me | Protected |
| PUT | /api/auth/me | Protected |

### Shops, Branches, Categories, Items
- GET /api/shops — Public
- POST /api/shops — Admin
- PUT/DELETE /api/shops/:id — Admin
- Same pattern for /branches, /categories, /items

### Cart (Customer)
- GET/POST/PUT/DELETE /api/cart/*

### Orders
- GET/POST /api/orders
- PATCH /api/orders/:id/status — Admin

### Coupons, Wallet, Notifications, Analytics, Users
- All protected with JWT
- Admin routes guarded with roleGuard('admin')
