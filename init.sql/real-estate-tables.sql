-- Create real estate related tables for the platform

-- Listings table for realtors
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  purchase_price DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2),
  square_footage INTEGER,
  year_built INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  monthly_rent DECIMAL(10, 2),
  commission_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'active',
  listed_date DATE DEFAULT CURRENT_DATE,
  sold_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table for realtors
CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'new',
  property_interest TEXT,
  budget DECIMAL(12, 2),
  last_contact DATE DEFAULT CURRENT_DATE,
  source VARCHAR(100) DEFAULT 'Unknown',
  listing_id INTEGER REFERENCES listings(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buyer profiles table
CREATE TABLE IF NOT EXISTS buyer_profiles (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  pre_approved_amount DECIMAL(12, 2) DEFAULT 0,
  monthly_budget DECIMAL(10, 2) DEFAULT 0,
  down_payment_saved DECIMAL(12, 2) DEFAULT 0,
  credit_score INTEGER,
  employment_status VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved properties table for buyers
CREATE TABLE IF NOT EXISTS saved_properties (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  property_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  purchase_price DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2),
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  status VARCHAR(50) DEFAULT 'saved',
  saved_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_is_active ON leads(is_active);

CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_is_active ON buyer_profiles(is_active);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_status ON saved_properties(status);
CREATE INDEX IF NOT EXISTS idx_saved_properties_is_active ON saved_properties(is_active);

-- Insert sample data
INSERT INTO listings (user_id, name, address, city, state, zip_code, property_type, purchase_price, current_value, square_footage, bedrooms, bathrooms, monthly_rent, commission_amount, status) VALUES
('test-user', 'Modern Downtown Condo', '123 Main St', 'Downtown', 'CA', '90210', 'residential', 450000, 475000, 1200, 2, 2, 3200, 14250, 'active'),
('test-user', 'Family Suburban Home', '456 Oak Ave', 'Suburbia', 'CA', '90211', 'residential', 650000, 680000, 2500, 4, 3, 4200, 20400, 'active'),
('test-user', 'Luxury Penthouse', '789 Sky Tower', 'Downtown', 'CA', '90212', 'residential', 1200000, 1250000, 3000, 3, 3, 8000, 37500, 'sold')
ON CONFLICT DO NOTHING;

INSERT INTO leads (user_id, name, email, phone, status, property_interest, budget, last_contact, source) VALUES
('test-user', 'Sarah Johnson', 'sarah.j@email.com', '(555) 123-4567', 'new', '3BR Condo Downtown', 450000, '2024-01-15', 'Website'),
('test-user', 'Mike Chen', 'mike.chen@email.com', '(555) 987-6543', 'viewing', 'Family Home Suburbs', 650000, '2024-01-14', 'Referral'),
('test-user', 'Emily Rodriguez', 'emily.r@email.com', '(555) 456-7890', 'offer', 'Townhouse', 380000, '2024-01-13', 'Social Media')
ON CONFLICT DO NOTHING;

INSERT INTO buyer_profiles (user_id, pre_approved_amount, monthly_budget, down_payment_saved, credit_score, employment_status) VALUES
('test-user', 500000, 2500, 75000, 750, 'employed')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO saved_properties (user_id, property_id, name, address, city, state, zip_code, property_type, purchase_price, current_value, square_footage, bedrooms, bathrooms, status, saved_date, notes, rating) VALUES
('test-user', 'prop-1', 'Charming Family Home', '123 Oak Street', 'Springfield', 'IL', '62701', 'residential', 350000, 365000, 1800, 3, 2, 'saved', '2024-01-10', 'Great neighborhood, good schools', 4),
('test-user', 'prop-2', 'Modern Downtown Condo', '456 Main St', 'Springfield', 'IL', '62702', 'residential', 280000, 295000, 1200, 2, 2, 'saved', '2024-01-08', 'Close to work, modern amenities', 5)
ON CONFLICT DO NOTHING;
