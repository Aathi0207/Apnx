# 🛍️ ShopSphere — Full-Stack E-Commerce Platform

ShopSphere is a full-stack e-commerce web application featuring two dedicated, responsive interfaces:
1. **Customer Website** — A shopping storefront featuring dynamic catalog browsing, debounced search, faceted category/price filters, cart management with stock enforcement, address & payment checkout (Cash on Delivery & Mock Card), order tracking, order details timeline, and user account management.
2. **Admin Dashboard** — A dedicated back-office management panel at `/admin` featuring store overview KPIs & charts (Recharts), complete product CRUD with Supabase Storage image uploads, category management, real-time order lifecycle status management, and customer account moderation.

All data, authentication, cart persistence, orders, and image storage are powered by **Supabase (PostgreSQL + Supabase Auth + Supabase Storage)** with Row Level Security (RLS) policies.

---

## 🚀 Technologies

- **Frontend Framework**: [React.js 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: JavaScript (ES Modules, Modern ES6+)
- **Routing**: [React Router v6](https://reactrouter.com/) (Nested Layouts, Route Guards)
- **State & Context**: React Context API (`AuthContext`, `CartContext`)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL 15)
- **Authentication**: Supabase Auth (Email & Password with Session Persistence)
- **Storage**: Supabase Storage (Bucket: `product-images`)
- **Visuals & Charts**: [Recharts](https://recharts.org/) (Bar charts, Revenue breakdown)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **Styling**: CSS3 Design System with CSS Variables, Flexbox, CSS Grid, and responsive media queries

---

## 📂 Project Structure

```text
eco/
├── public/
├── src/
│   ├── assets/              # Static assets & logos
│   ├── components/
│   │   ├── common/          # Reusable shared components
│   │   │   ├── AdminRoute.jsx        # Admin role route guard
│   │   │   ├── ConfirmDialog.jsx     # Reusable confirmation modal
│   │   │   ├── EmptyState.jsx        # Empty search / cart / order state
│   │   │   ├── ImageWithFallback.jsx # Fallback handling for images
│   │   │   ├── LoadingSpinner.jsx    # Animated spinner & full-page loader
│   │   │   ├── Modal.jsx             # Accessible modal dialog
│   │   │   ├── OrderStatusBadge.jsx  # Color-coded order status chip
│   │   │   ├── Pagination.jsx        # Ellipsis-aware pagination
│   │   │   ├── ProtectedRoute.jsx    # Customer auth guard
│   │   │   └── SkeletonCard.jsx      # Skeleton shimmer placeholders
│   │   └── customer/        # Customer storefront components
│   │       ├── Footer.jsx            # Responsive footer with links
│   │       ├── Navbar.jsx            # Sticky navbar with live search & cart badge
│   │       ├── ProductCard.jsx       # Card with pricing, badges & add-to-cart
│   │       └── ProductGrid.jsx       # Grid with skeletons and empty states
│   ├── context/
│   │   ├── AuthContext.jsx  # User session, profile fetching & role state
│   │   └── CartContext.jsx  # Database-backed cart state & stock checks
│   ├── layouts/
│   │   ├── AdminLayout.jsx    # Dark sidebar, topbar, mobile drawer
│   │   └── CustomerLayout.jsx # Storefront wrapper with navbar & footer
│   ├── pages/
│   │   ├── admin/           # Admin Dashboard Pages (/admin)
│   │   │   ├── AdminLogin.jsx        # Dedicated admin login screen
│   │   │   ├── AdminOrderDetails.jsx # Detailed order info & status updates
│   │   │   ├── AdminOrders.jsx       # Orders data table, search & filter
│   │   │   ├── AdminProducts.jsx     # Products catalog table with toggles
│   │   │   ├── Categories.jsx        # Category CRUD and active switch
│   │   │   ├── Customers.jsx         # Registered customer list & order history
│   │   │   ├── Dashboard.jsx         # KPI metric cards, charts & recent orders
│   │   │   └── ProductForm.jsx       # Add & Edit product with image upload
│   │   ├── auth/            # Customer Auth Pages
│   │   │   ├── ForgotPassword.jsx    # Password reset email trigger
│   │   │   ├── Login.jsx             # Customer sign-in
│   │   │   └── Register.jsx          # Customer registration
│   │   ├── customer/        # Customer Storefront Pages
│   │   │   ├── Cart.jsx              # Database-backed shopping cart
│   │   │   ├── Checkout.jsx          # Shipping address & payment options
│   │   │   ├── Home.jsx              # Hero, categories, featured, latest
│   │   │   ├── MyOrders.jsx          # Customer order history list
│   │   │   ├── OrderDetails.jsx      # Order tracker timeline & receipt
│   │   │   ├── OrderSuccess.jsx      # Order confirmation & next steps
│   │   │   ├── ProductDetails.jsx    # Detail view, quantity, stock, buy now
│   │   │   ├── Products.jsx          # Catalog with sidebar filters & sorting
│   │   │   └── Profile.jsx           # User profile & security settings
│   │   └── NotFound.jsx     # 404 error page
│   ├── services/
│   │   ├── adminService.js    # KPIs, top products, revenue analytics
│   │   ├── authService.js     # Supabase auth & profile queries
│   │   ├── cartService.js     # Cart & cart items DB queries
│   │   ├── categoryService.js # Category queries & mutations
│   │   ├── orderService.js    # Order & order items DB queries
│   │   ├── productService.js  # Product queries, filters, search & CRUD
│   │   ├── storageService.js  # Supabase Storage file uploads
│   │   └── supabase.js        # Supabase client initialization
│   ├── styles/
│   │   ├── admin.css        # Admin panel specific styling
│   │   ├── customer.css     # Customer storefront styling
│   │   ├── globals.css      # Design tokens, typography, utilities
│   │   └── variables.css    # Colors, spacing, shadows, radii
│   ├── utils/
│   │   ├── constants.js     # Statuses, payment methods, defaults
│   │   ├── formatters.js    # Currency, dates, discounts, slugs
│   │   └── validators.js    # Field validation helpers
│   ├── App.jsx              # React Router route tree
│   └── main.jsx             # React entry point
├── .env.example             # Environment variables documentation
├── index.html               # Main HTML entry with Inter font
├── package.json             # Dependencies and build scripts
├── supabase-schema.sql      # Complete SQL schema, RLS policies & seed data
└── vite.config.js           # Vite build config
```

---

## 🛠️ Step-by-Step Supabase Setup

### 1. Create a Supabase Project
1. Go to [database.new](https://database.new) and sign in or create an account.
2. Click **New project**, select an organization, name it (e.g. `shopsphere`), choose a region close to you, and set a database password.

### 2. Run the SQL Schema & Seed Data
1. Open your Supabase Project Dashboard.
2. In the left navigation, click on **SQL Editor**.
3. Click **New query**.
4. Open the file `supabase-schema.sql` from this project, copy all its contents, and paste them into the SQL Editor.
5. Click **Run** (or press `Ctrl+Enter`).
6. The query will create:
   - 7 PostgreSQL tables (`profiles`, `categories`, `products`, `cart`, `cart_items`, `orders`, `order_items`)
   - Automated trigger to create a profile whenever a new user signs up
   - Row Level Security (RLS) policies for secure customer and admin access
   - Supabase Storage bucket `product-images` with public read access and authenticated upload permissions
   - 5 sample categories (`Electronics`, `Fashion`, `Accessories`, `Home`, `Beauty`)
   - 18 realistic sample products with pricing, stock, descriptions, and high-resolution Unsplash imagery.

### 3. Retrieve Your API Credentials
1. In your Supabase Dashboard, click on **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL** (`https://<project-ref>.supabase.co`).
3. Under **Project API keys**, copy the `anon` / `public` key.

### 4. Create an Admin Account
1. Start the app locally and navigate to [http://localhost:5173/register](http://localhost:5173/register) (or register via Supabase Dashboard -> **Authentication** -> **Users**).
2. Register an account with your desired admin email (e.g., `admin@shopsphere.com`).
3. Head back to Supabase **SQL Editor** and run this command:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@shopsphere.com');
   ```
4. Now you can log in at [http://localhost:5173/admin/login](http://localhost:5173/admin/login) to access the complete admin panel.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-public-key
```

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL from Settings -> API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key from Settings -> API |

---

## 💻 Local Installation & Development

### 1. Install Dependencies
```bash
npm install
```

*(Note: On Windows PowerShell if script execution is restricted, you can also run `npm.cmd install` or run terminal with appropriate ExecutionPolicy).*

### 2. Start Local Development Server
```bash
npm run dev
```

The application will start on:
- Customer Storefront: **http://localhost:5173**
- Admin Portal: **http://localhost:5173/admin/login**

### 3. Production Build & Preview
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🔒 Security & Row Level Security (RLS)

ShopSphere does not rely solely on frontend route guards:
- **Products**: Any visitor can view `active` products. Only users with `role = 'admin'` in `profiles` can INSERT, UPDATE, or DELETE products.
- **Categories**: Any visitor can view active categories. Only `admin` can mutate categories.
- **Cart & Cart Items**: Row-level policies enforce that authenticated users can only view, insert, update, or delete items in their own cart (`user_id = auth.uid()`).
- **Orders & Order Items**: Customers can only view and create their own orders. Only `admin` can inspect all store orders and update order statuses.
- **Profiles**: Customers can read and update only their own profile details. Admins can view customer profiles in the Customers management view.
- **Storage**: Storage policies allow public downloads for product images and enforce authenticated/admin privileges for uploads and deletions.

---

## 📦 Deployment Instructions

### Vercel / Netlify
1. Push your repository to GitHub / GitLab.
2. In Vercel or Netlify, import the repository.
3. Set the Framework Preset to **Vite**.
4. Set Build Command to `npm run build` and Output Directory to `dist`.
5. Under Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**.
7. For client-side routing on Netlify, ensure a `_redirects` file exists in `public/` containing `/* /index.html 200`. For Vercel, a `vercel.json` rewrites rule handles SPAs automatically.

---

## 📄 License
MIT License. Built for full-stack e-commerce demonstration.
