-- ==============================================================================
-- SHOPSPHERE - COMPLETE SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- ==============================================================================
-- Execute this entire file in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (Extends Supabase auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on role & phone
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- Auto-create profile trigger on new auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price IS NULL OR discount_price < price),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ==============================================================================
-- 4. CART TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON public.cart(user_id);

-- ==============================================================================
-- 5. CART ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.cart(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_cart_product UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- ==============================================================================
-- 6. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'cod',
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- 7. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT (role = 'admin')
        FROM public.profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public can view active profiles or own profile" ON public.profiles;
CREATE POLICY "Public can view active profiles or own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- CATEGORIES POLICIES
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories"
    ON public.categories FOR SELECT
    USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories FOR DELETE
    USING (public.is_admin());

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- CART POLICIES
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart;
CREATE POLICY "Users can view own cart"
    ON public.cart FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create own cart" ON public.cart;
CREATE POLICY "Users can create own cart"
    ON public.cart FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart" ON public.cart;
CREATE POLICY "Users can update own cart"
    ON public.cart FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart" ON public.cart;
CREATE POLICY "Users can delete own cart"
    ON public.cart FOR DELETE
    USING (auth.uid() = user_id);

-- CART ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own cart items" ON public.cart_items;
CREATE POLICY "Users can view own cart items"
    ON public.cart_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cart
            WHERE cart.id = cart_items.cart_id
            AND cart.user_id = auth.uid()
        ) OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can insert own cart items" ON public.cart_items;
CREATE POLICY "Users can insert own cart items"
    ON public.cart_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.cart
            WHERE cart.id = cart_items.cart_id
            AND cart.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update own cart items" ON public.cart_items;
CREATE POLICY "Users can update own cart items"
    ON public.cart_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.cart
            WHERE cart.id = cart_items.cart_id
            AND cart.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete own cart items" ON public.cart_items;
CREATE POLICY "Users can delete own cart items"
    ON public.cart_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.cart
            WHERE cart.id = cart_items.cart_id
            AND cart.user_id = auth.uid()
        )
    );

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Users can create own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        ) OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can create own order items" ON public.order_items;
CREATE POLICY "Users can create own order items"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 9. SUPABASE STORAGE SETUP FOR PRODUCT IMAGES
-- ==============================================================================
-- Create the storage bucket for product images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users or admin can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users or admin can upload product images"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
CREATE POLICY "Admins can update product images"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
CREATE POLICY "Admins can delete product images"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'product-images' AND public.is_admin());

-- ==============================================================================
-- 10. REALISTIC SEED DATA (5 CATEGORIES & 18 PRODUCTS)
-- ==============================================================================

-- Seed Categories
INSERT INTO public.categories (id, name, slug, description, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Electronics', 'electronics', 'Smartphones, audio gear, laptops and modern gadgets', true),
    ('c2222222-2222-2222-2222-222222222222', 'Fashion', 'fashion', 'Designer clothing, jackets, sneakers, and apparel', true),
    ('c3333333-3333-3333-3333-333333333333', 'Accessories', 'accessories', 'Watches, premium leather bags, sunglasses and wallets', true),
    ('c4444444-4444-4444-4444-444444444444', 'Home', 'home', 'Modern furniture, ambient lighting, kitchenware and decor', true),
    ('c5555555-5555-5555-5555-555555555555', 'Beauty', 'beauty', 'Organic skincare, fragrances, cosmetics and personal care', true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    description = EXCLUDED.description;

-- Seed Products (18 products across all 5 categories with high-quality images)
INSERT INTO public.products (id, name, description, price, discount_price, category_id, stock, image_url, status)
VALUES
    -- Electronics
    (
        'a0000001-0000-0000-0000-000000000001',
        'Aura Pro Noise-Cancelling Headphones',
        'Experience immersive spatial audio with industry-leading active noise cancellation, 40-hour battery life, and plush memory foam ear cushions.',
        299.99,
        249.99,
        'c1111111-1111-1111-1111-111111111111',
        25,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        'active'
    ),
    (
        'a0000002-0000-0000-0000-000000000002',
        'PulseFit Ultra Smartwatch GPS',
        'Advanced fitness tracking with continuous heart rate, blood oxygen monitor, sleep analysis, and high-resolution OLED always-on display.',
        199.99,
        169.99,
        'c1111111-1111-1111-1111-111111111111',
        40,
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'active'
    ),
    (
        'a0000003-0000-0000-0000-000000000003',
        'Studio Sound Wireless Earbuds',
        'Crystal-clear audio with dual beamforming microphones, IPX5 water resistance, wireless charging case, and 30-hour total playtime.',
        129.99,
        99.99,
        'c1111111-1111-1111-1111-111111111111',
        65,
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
        'active'
    ),
    (
        'a0000004-0000-0000-0000-000000000004',
        'Lumix Pro 4K Action Camera',
        'Ultra HD 4K recording at 60fps with 6-axis gyro stabilization, dual screens, waterproof up to 30 meters, and voice commands.',
        349.99,
        null,
        'c1111111-1111-1111-1111-111111111111',
        15,
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
        'active'
    ),

    -- Fashion
    (
        'a0000005-0000-0000-0000-000000000005',
        'Vintage Distressed Denim Jacket',
        'Crafted from 100% heavyweight organic cotton denim with subtle vintage wash, relaxed contemporary fit, and branded antique brass buttons.',
        119.00,
        89.00,
        'c2222222-2222-2222-2222-222222222222',
        30,
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80',
        'active'
    ),
    (
        'a0000006-0000-0000-0000-000000000006',
        'CloudWalk Minimalist White Sneakers',
        'Ultra-comfortable everyday low-top sneakers with supple full-grain Italian leather, recycled rubber sole, and cushioned antibacterial insole.',
        149.00,
        null,
        'c2222222-2222-2222-2222-222222222222',
        45,
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
        'active'
    ),
    (
        'a0000007-0000-0000-0000-000000000007',
        'Merino Wool Crewneck Sweater',
        'Extrafine Australian merino wool that regulates temperature naturally. Soft handfeel, ribbed cuffs, and versatile modern silhouette.',
        95.00,
        79.00,
        'c2222222-2222-2222-2222-222222222222',
        20,
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80',
        'active'
    ),
    (
        'a0000008-0000-0000-0000-000000000008',
        'Urban Tailored Trench Coat',
        'Timeless water-repellent trench coat with double-breasted closure, storm flap, waist belt, and premium acetate lining.',
        220.00,
        189.00,
        'c2222222-2222-2222-2222-222222222222',
        12,
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80',
        'active'
    ),

    -- Accessories
    (
        'a0000009-0000-0000-0000-000000000009',
        'Chronograph Classic Sapphire Watch',
        'Precision Japanese quartz movement housed in surgical stainless steel with scratch-resistant sapphire crystal and genuine top-grain leather strap.',
        185.00,
        149.00,
        'c3333333-3333-3333-3333-333333333333',
        18,
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
        'active'
    ),
    (
        'a0000010-0000-0000-0000-000000000010',
        'Heritage Leather Messenger Bag',
        'Full-grain vegetable-tanned leather handcrafted with brass hardware, padded 15-inch laptop compartment, and adjustable shoulder strap.',
        240.00,
        null,
        'c3333333-3333-3333-3333-333333333333',
        10,
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
        'active'
    ),
    (
        'a0000011-0000-0000-0000-000000000011',
        'Polarized Aviator Sunglasses',
        'Lightweight titanium frame with UV400 polarized optical lenses offering maximum clarity and glare protection in golden sunlight.',
        89.00,
        69.00,
        'c3333333-3333-3333-3333-333333333333',
        50,
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
        'active'
    ),
    (
        'a0000012-0000-0000-0000-000000000012',
        'Slim RFID-Blocking Cardholder Wallet',
        'Minimalist front-pocket bifold wallet in matte black calfskin with aluminum RFID-shielded card ejector mechanism.',
        45.00,
        35.00,
        'c3333333-3333-3333-3333-333333333333',
        80,
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80',
        'active'
    ),

    -- Home
    (
        'a0000013-0000-0000-0000-000000000013',
        'Nordic Minimalist Desk Lamp',
        'Dimmable LED architect desk lamp with matte aluminum arm, brass accents, warm ambient light, and integrated Qi wireless charging pad.',
        89.99,
        69.99,
        'c4444444-4444-4444-4444-444444444444',
        22,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
        'active'
    ),
    (
        'a0000014-0000-0000-0000-000000000014',
        'Handmade Ceramic Pour-Over Kettle & Cup',
        'Artisanal stoneware coffee dripper and matching textured ceramic mug crafted by Japanese master potters for a mindful morning brew.',
        58.00,
        null,
        'c4444444-4444-4444-4444-444444444444',
        35,
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
        'active'
    ),
    (
        'a0000015-0000-0000-0000-000000000015',
        'Ultrasonic Aromatherapy Diffuser',
        'Whisper-quiet essential oil diffuser with real bamboo base, ambient 7-color LED halo light, and automatic waterless shut-off.',
        49.99,
        39.99,
        'c4444444-4444-4444-4444-444444444444',
        40,
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
        'active'
    ),

    -- Beauty
    (
        'a0000016-0000-0000-0000-000000000016',
        'Hydra-Glow Vitamin C Facial Serum',
        'Potent botanical formula with 15% pure L-ascorbic acid, hyaluronic acid, and ferulic acid for radiant, visibly smoother skin.',
        54.00,
        42.00,
        'c5555555-5555-5555-5555-555555555555',
        60,
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
        'active'
    ),
    (
        'a0000017-0000-0000-0000-000000000017',
        'Botanical Rose Water Balancing Mist',
        '100% pure organic distilled Moroccan rose water to calm, tone, and rehydrate thirsty complexion anytime throughout the day.',
        28.00,
        null,
        'c5555555-5555-5555-5555-555555555555',
        50,
        'https://images.unsplash.com/photo-1608248597359-245722f671c6?w=800&q=80',
        'active'
    ),
    (
        'a0000018-0000-0000-0000-000000000018',
        'Velvet Matte Cashmere Lipstick',
        'Richly pigmented luxury lipstick enriched with argan butter and vitamin E for velvety 12-hour comfortable wear.',
        32.00,
        24.00,
        'c5555555-5555-5555-5555-555555555555',
        75,
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
        'active'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    discount_price = EXCLUDED.discount_price,
    category_id = EXCLUDED.category_id,
    stock = EXCLUDED.stock,
    image_url = EXCLUDED.image_url,
    status = EXCLUDED.status;

-- ==============================================================================
-- 11. HELPER INSTRUCTIONS FOR ADMIN SETUP
-- ==============================================================================
-- After you register an account in the customer website or Supabase Auth,
-- run the following command in SQL Editor to grant admin privileges:
--
-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your_admin_email@example.com');
--
-- Once this is updated, you can log in at http://localhost:5173/admin/login
-- ==============================================================================
