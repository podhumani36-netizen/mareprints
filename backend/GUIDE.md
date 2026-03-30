# Django E-Commerce Backend — Complete Guide

## Project Structure

```
ecommerce_backend/
├── ecommerce/          ← Main Django project (settings, urls)
│   ├── settings.py
│   └── urls.py
├── accounts/           ← Users, Login, Register, OTP, Google OAuth
│   ├── models.py       ← User, OTP, Address
│   ├── serializers.py
│   ├── views.py
│   ├── google_auth.py  ← Google Login
│   ├── urls.py
│   └── admin.py
├── products/           ← Products, Categories, Reviews, Wishlist
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── cart/               ← Shopping Cart
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── orders/             ← Place Order, Track Order
│   ├── models.py
│   ├── serializers.py
│   ├── views.py
│   └── urls.py
├── payments/           ← Payment Verify
│   ├── views.py
│   └── urls.py
├── requirements.txt
└── manage.py
```

---

## STEP 1 — Install Python & Django

### 1.1 Install Python
Download Python 3.11+ from https://python.org/downloads
During install: ✅ Check "Add Python to PATH"

### 1.2 Create Virtual Environment
```bash
# Open Command Prompt (cmd) as Administrator
cd C:\

# Create project folder
mkdir ecommerce_project
cd ecommerce_project

# Create virtual environment (isolates packages)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate
# You will see (venv) at the start of the line ✅
```

### 1.3 Install All Packages
```bash
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install djangorestframework-simplejwt==5.3.0
pip install django-cors-headers==4.3.1
pip install django-filter==23.3
pip install mysqlclient==2.2.0
pip install Pillow==10.1.0
pip install requests==2.31.0
```

Or install all at once using requirements.txt:
```bash
pip install -r requirements.txt
```

---

## STEP 2 — Create Django Project

```bash
# Create the Django project
django-admin startproject ecommerce

cd ecommerce

# Create all the apps
python manage.py startapp accounts
python manage.py startapp products
python manage.py startapp cart
python manage.py startapp orders
python manage.py startapp payments
```

Now copy all the provided code files into the matching folders.

---

## STEP 3 — Setup MySQL Database

### 3.1 Create Database in MySQL Workbench
Open MySQL Workbench → Connect to your E_commerce connection → Run:
```sql
CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3.2 Verify Settings Match Your MySQL Config
In `ecommerce/settings.py`, the database is already configured for your setup:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'ecommerce_db',
        'USER': 'root',
        'PASSWORD': '',        # ← Add your MySQL password if you have one
        'HOST': '127.0.0.1',
        'PORT': '3306',        # ← Your custom port from MySQL screenshot
    }
}
```

---

## STEP 4 — Run Migrations (Create Tables)

```bash
# This creates all database tables from the models
python manage.py makemigrations accounts
python manage.py makemigrations products
python manage.py makemigrations cart
python manage.py makemigrations orders
python manage.py makemigrations payments
python manage.py migrate

# Create admin user
python manage.py createsuperuser
# Enter: email, password

# Start server
python manage.py runserver
```

Server runs at: http://127.0.0.1:8000
Admin panel:    http://127.0.0.1:8000/admin

---

## STEP 5 — Google OAuth Setup

### 5.1 Your Google Credentials
- Client ID:     730804878496-opudg8u44obs5pt74cre44g36g25n9jf.apps.googleusercontent.com
- Client Secret: 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

⚠️  IMPORTANT: Store these in a .env file, NOT in code, for production!

### 5.2 Configure Google Console
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials → Your OAuth Client
3. Add Authorized JavaScript Origins:
   - http://localhost:3000
   - http://127.0.0.1:3000
4. Add Authorized Redirect URIs:
   - http://localhost:3000
   - http://127.0.0.1:3000
5. Save

### 5.3 How Google Login Works
```
User clicks "Sign in with Google" on Next.js frontend
    ↓
Google shows consent screen
    ↓
Google sends authorization code to frontend
    ↓
Frontend sends code to: POST /api/google-login/
    ↓
Django exchanges code for access_token with Google
    ↓
Django fetches user info (email, name) from Google
    ↓
Django creates or finds the user in MySQL
    ↓
Django returns JWT tokens + user data to frontend
```

---

## FULL API REFERENCE

### AUTH ENDPOINTS

| Method | URL | Body | Auth | Description |
|--------|-----|------|------|-------------|
| POST | /api/register/ | email, first_name, last_name, password, confirm_password | No | Register |
| POST | /api/login/ | email, password | No | Login → returns tokens |
| POST | /api/logout/ | refresh (token) | Yes | Logout |
| POST | /api/google-login/ | code OR access_token | No | Google OAuth |
| POST | /api/forgot-password/ | email | No | Send OTP to email |
| POST | /api/verify-otp/ | email, otp | No | Verify 6-digit OTP |
| POST | /api/reset-password/ | email, otp, new_password, confirm_password | No | Reset password |
| GET | /api/profile/ | — | Yes | Get my profile |
| PUT | /api/profile/ | first_name, last_name, phone | Yes | Update profile |
| POST | /api/change-password/ | old_password, new_password | Yes | Change password |
| POST | /api/token/refresh/ | refresh | No | Get new access token |

### PRODUCT ENDPOINTS

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/categories/ | All categories |
| GET | /api/products/ | All products (with filters) |
| GET | /api/products/?search=phone | Search products |
| GET | /api/products/?category=1 | Filter by category |
| GET | /api/products/?min_price=100&max_price=5000 | Price range filter |
| GET | /api/products/?ordering=-price | Sort by price (desc) |
| GET | /api/products/featured/ | Featured products (home page) |
| GET | /api/products/{slug}/ | Single product detail |
| GET | /api/products/{id}/reviews/ | Product reviews |
| POST | /api/products/{id}/reviews/ | Add review (auth) |

### CART ENDPOINTS (Auth required)

| Method | URL | Body | Description |
|--------|-----|------|-------------|
| GET | /api/cart/ | — | View my cart |
| POST | /api/cart/add/ | product_id, quantity | Add item |
| PUT | /api/cart/update/{item_id}/ | quantity | Update quantity |
| DELETE | /api/cart/remove/{item_id}/ | — | Remove item |
| DELETE | /api/cart/clear/ | — | Clear all items |

### ORDER ENDPOINTS (Auth required)

| Method | URL | Body | Description |
|--------|-----|------|-------------|
| POST | /api/orders/place/ | address_id, payment_method, notes | Place order |
| GET | /api/orders/ | — | My orders list |
| GET | /api/orders/{id}/ | — | Order detail |
| POST | /api/orders/{id}/cancel/ | — | Cancel order |

### ADDRESS ENDPOINTS (Auth required)

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/addresses/ | My addresses |
| POST | /api/addresses/ | Add address |
| PUT | /api/addresses/{id}/ | Update address |
| DELETE | /api/addresses/{id}/ | Delete address |

---

## HOW TO USE JWT AUTH IN NEXT.JS FRONTEND

```javascript
// After login, store tokens:
localStorage.setItem('access_token', data.tokens.access);
localStorage.setItem('refresh_token', data.tokens.refresh);

// For protected API calls, send token in header:
const res = await fetch('http://127.0.0.1:8000/api/profile/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Content-Type': 'application/json',
  }
});

// If you get 401, refresh the token:
const refreshRes = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') })
});
const refreshData = await refreshRes.json();
localStorage.setItem('access_token', refreshData.access);
```

## HOW TO CONNECT FORGOT PASSWORD FLOW (Frontend → Backend)

Update your `ForgotPasswordPage` to call the real API:

```javascript
// Step 1: Send OTP
const handleSubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('http://127.0.0.1:8000/api/forgot-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (data.success) {
    router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
  }
};

// Step 2: Verify OTP
const handleVerify = async (e) => {
  e.preventDefault();
  const res = await fetch('http://127.0.0.1:8000/api/verify-otp/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await res.json();
  if (data.success) {
    router.push(`/forgot-password/reset?email=${encodeURIComponent(email)}`);
  }
};

// Step 3: Reset Password
const handleReset = async (e) => {
  e.preventDefault();
  const res = await fetch('http://127.0.0.1:8000/api/reset-password/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, new_password, confirm_password })
  });
  const data = await res.json();
  if (data.success) router.push('/login');
};
```

---

## DATABASE TABLES CREATED

| Table | Description |
|-------|-------------|
| accounts_user | All users (email login) |
| accounts_otp | OTP codes for password reset |
| accounts_address | Saved shipping addresses |
| products_category | Product categories |
| products_product | Products |
| products_productimage | Multiple images per product |
| products_review | Customer reviews |
| products_wishlist | Saved products |
| cart_cart | User carts |
| cart_cartitem | Items in cart |
| orders_order | Placed orders |
| orders_orderitem | Items in each order |

---

## COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| `ModuleNotFoundError: No module named 'MySQLdb'` | Run: `pip install mysqlclient` |
| `django.db.utils.OperationalError: Can't connect to MySQL` | Check MySQL port is 3307, check password |
| `CORS error in browser` | Check CORS_ALLOWED_ORIGINS in settings.py includes http://localhost:3000 |
| `401 Unauthorized` | Send Authorization: Bearer <token> in request headers |
| `No module named 'rest_framework'` | Run: `pip install djangorestframework` |




# E-Commerce API Documentation

## Base URL

```
http://127.0.0.1:8000
```

---

## AUTH ENDPOINTS

| Method | URL                                          | Description            |
| ------ | -------------------------------------------- | ---------------------- |
| POST   | `http://127.0.0.1:8000/api/register/`        | Register user          |
| POST   | `http://127.0.0.1:8000/api/login/`           | Login → returns tokens |
| POST   | `http://127.0.0.1:8000/api/logout/`          | Logout user            |
| POST   | `http://127.0.0.1:8000/api/google-login/`    | Google OAuth login     |
| POST   | `http://127.0.0.1:8000/api/forgot-password/` | Send OTP               |
| POST   | `http://127.0.0.1:8000/api/verify-otp/`      | Verify OTP             |
| POST   | `http://127.0.0.1:8000/api/reset-password/`  | Reset password         |
| GET    | `http://127.0.0.1:8000/api/profile/`         | Get profile            |
| PUT    | `http://127.0.0.1:8000/api/profile/`         | Update profile         |
| POST   | `http://127.0.0.1:8000/api/change-password/` | Change password        |
| POST   | `http://127.0.0.1:8000/api/token/refresh/`   | Refresh token          |

---

## PRODUCT ENDPOINTS

| Method | URL                                                                | Description        |
| ------ | ------------------------------------------------------------------ | ------------------ |
| GET    | `http://127.0.0.1:8000/api/categories/`                            | Get categories     |
| GET    | `http://127.0.0.1:8000/api/products/`                              | Get all products   |
| GET    | `http://127.0.0.1:8000/api/products/?search=phone`                 | Search products    |
| GET    | `http://127.0.0.1:8000/api/products/?category=1`                   | Filter by category |
| GET    | `http://127.0.0.1:8000/api/products/?min_price=100&max_price=5000` | Filter by price    |
| GET    | `http://127.0.0.1:8000/api/products/?ordering=-price`              | Sort products      |
| GET    | `http://127.0.0.1:8000/api/products/featured/`                     | Featured products  |
| GET    | `http://127.0.0.1:8000/api/products/{slug}/`                       | Product detail     |
| GET    | `http://127.0.0.1:8000/api/products/{id}/reviews/`                 | Get reviews        |
| POST   | `http://127.0.0.1:8000/api/products/{id}/reviews/`                 | Add review         |

---

## CART ENDPOINTS (Auth Required)

| Method | URL                                                | Description |
| ------ | -------------------------------------------------- | ----------- |
| GET    | `http://127.0.0.1:8000/api/cart/`                  | View cart   |
| POST   | `http://127.0.0.1:8000/api/cart/add/`              | Add item    |
| PUT    | `http://127.0.0.1:8000/api/cart/update/{item_id}/` | Update item |
| DELETE | `http://127.0.0.1:8000/api/cart/remove/{item_id}/` | Remove item |
| DELETE | `http://127.0.0.0:8000/api/cart/clear/`            | Clear cart  |

---

## ORDER ENDPOINTS (Auth Required)

| Method | URL                                             | Description  |
| ------ | ----------------------------------------------- | ------------ |
| POST   | `http://127.0.0.1:8000/api/orders/place/`       | Place order  |
| GET    | `http://127.0.0.1:8000/api/orders/`             | My orders    |
| GET    | `http://127.0.0.1:8000/api/orders/{id}/`        | Order detail |
| POST   | `http://127.0.0.1:8000/api/orders/{id}/cancel/` | Cancel order |

---

## ADDRESS ENDPOINTS (Auth Required)

| Method | URL                                         | Description    |
| ------ | ------------------------------------------- | -------------- |
| GET    | `http://127.0.0.1:8000/api/addresses/`      | Get addresses  |
| POST   | `http://127.0.0.1:8000/api/addresses/`      | Add address    |
| PUT    | `http://127.0.0.1:8000/api/addresses/{id}/` | Update address |
| DELETE | `http://127.0.0.1:8000/api/addresses/{id}/` | Delete address |

---

## Notes

* Replace:

  * `{id}` → actual ID
  * `{slug}` → product slug

* Auth Header:

```
Authorization: Bearer <access_token>
```
