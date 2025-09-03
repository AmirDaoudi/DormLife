-- DormLife PostgreSQL Database Schema
-- Production-ready boarding school dorm management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    logo_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(50),
    profile_photo_url VARCHAR(500),
    year VARCHAR(50),
    graduation_year INTEGER,
    emergency_contact VARCHAR(255),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'staff')),
    preferences JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temperature zones table
CREATE TABLE temperature_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    current_temperature DECIMAL(4,1),
    target_temperature DECIMAL(4,1),
    min_temperature DECIMAL(4,1) DEFAULT 65.0,
    max_temperature DECIMAL(4,1) DEFAULT 80.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Temperature votes table
CREATE TABLE temperature_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES temperature_zones(id) ON DELETE CASCADE,
    temperature DECIMAL(4,1) NOT NULL,
    vote_weight DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, zone_id, created_at)
);

-- Temperature history table
CREATE TABLE temperature_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID REFERENCES temperature_zones(id) ON DELETE CASCADE,
    temperature DECIMAL(4,1) NOT NULL,
    target_temperature DECIMAL(4,1),
    average_vote DECIMAL(4,1),
    total_votes INTEGER DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request categories table
CREATE TABLE request_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES request_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    photos JSONB DEFAULT '[]',
    upvotes INTEGER DEFAULT 0,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request comments table
CREATE TABLE request_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request upvotes table
CREATE TABLE request_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(request_id, user_id)
);

-- Announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'emergency', 'maintenance', 'event')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    target_audience JSONB DEFAULT '[]',
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push tokens table
CREATE TABLE push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    device_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, token)
);

-- Activity logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social features tables
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    max_attendees INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'not_attending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- Room bookings table
CREATE TABLE room_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    purpose TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laundry machines table
CREATE TABLE laundry_machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_number VARCHAR(20) NOT NULL,
    machine_type VARCHAR(20) CHECK (machine_type IN ('washer', 'dryer')),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'out_of_order')),
    time_remaining INTEGER DEFAULT 0,
    current_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_users_room_number ON users(room_number);
CREATE INDEX idx_temperature_votes_user_id ON temperature_votes(user_id);
CREATE INDEX idx_temperature_votes_zone_id ON temperature_votes(zone_id);
CREATE INDEX idx_temperature_votes_created_at ON temperature_votes(created_at);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_requests_category_id ON requests(category_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_request_comments_request_id ON request_comments(request_id);
CREATE INDEX idx_announcements_school_id ON announcements(school_id);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_temperature_zones_updated_at BEFORE UPDATE ON temperature_zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_comments_updated_at BEFORE UPDATE ON request_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_bookings_updated_at BEFORE UPDATE ON room_bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default request categories
INSERT INTO request_categories (name, description, icon, color) VALUES
('Maintenance', 'Building and room maintenance issues', '🔧', '#FF9500'),
('Noise Complaint', 'Noise disturbances and violations', '🔇', '#FF3B30'),
('Suggestion', 'Ideas and suggestions for improvement', '💡', '#007AFF'),
('Emergency', 'Urgent issues requiring immediate attention', '🚨', '#FF3B30'),
('Lost & Found', 'Lost or found items', '🔍', '#8E8E93'),
('Package Pickup', 'Package delivery notifications', '📦', '#34C759'),
('Cleaning', 'Cleaning requests and issues', '🧹', '#5856D6'),
('Technology', 'WiFi, computer, and tech support', '💻', '#00C7BE');

-- Create Georgetown Preparatory School
INSERT INTO schools (id, name, address, timezone) VALUES
('georgetown-prep', 'Georgetown Preparatory School', '10900 Rockville Pike, North Bethesda, MD 20852', 'America/New_York');

-- Create default temperature zone
INSERT INTO temperature_zones (name, description, school_id, current_temperature, target_temperature)
SELECT 'Main Floor', 'Primary temperature zone for dormitory main floor', id, 72.0, 72.0
FROM schools WHERE name = 'Georgetown Preparatory School';