-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE newsletter_status AS ENUM ('draft', 'scheduled', 'published');
CREATE TYPE send_status AS ENUM ('pending', 'sent', 'failed', 'bounced');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletters table
CREATE TABLE newsletters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    is_published BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status newsletter_status DEFAULT 'draft'
);

-- Create subscribers table
CREATE TABLE subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, email)
);

-- Create newsletter_sends table
CREATE TABLE newsletter_sends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
    subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status send_status DEFAULT 'pending',
    error_message TEXT,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(newsletter_id, subscriber_id)
);

-- Create indexes for better performance
CREATE INDEX idx_newsletters_user_id ON newsletters(user_id);
CREATE INDEX idx_newsletters_status ON newsletters(status);
CREATE INDEX idx_newsletters_scheduled_at ON newsletters(scheduled_at);
CREATE INDEX idx_subscribers_user_id ON subscribers(user_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_is_active ON subscribers(is_active);
CREATE INDEX idx_newsletter_sends_newsletter_id ON newsletter_sends(newsletter_id);
CREATE INDEX idx_newsletter_sends_subscriber_id ON newsletter_sends(subscriber_id);
CREATE INDEX idx_newsletter_sends_status ON newsletter_sends(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at 
    BEFORE UPDATE ON newsletters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for newsletters table
CREATE POLICY "Users can view their own newsletters" ON newsletters
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own newsletters" ON newsletters
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own newsletters" ON newsletters
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own newsletters" ON newsletters
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for subscribers table
CREATE POLICY "Users can view their own subscribers" ON subscribers
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own subscribers" ON subscribers
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own subscribers" ON subscribers
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own subscribers" ON subscribers
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- RLS Policies for newsletter_sends table
CREATE POLICY "Users can view their newsletter sends" ON newsletter_sends
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM newsletters n 
            WHERE n.id = newsletter_sends.newsletter_id 
            AND auth.uid()::text = n.user_id::text
        )
    );

CREATE POLICY "Users can insert their newsletter sends" ON newsletter_sends
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM newsletters n 
            WHERE n.id = newsletter_sends.newsletter_id 
            AND auth.uid()::text = n.user_id::text
        )
    );

CREATE POLICY "Users can update their newsletter sends" ON newsletter_sends
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM newsletters n 
            WHERE n.id = newsletter_sends.newsletter_id 
            AND auth.uid()::text = n.user_id::text
        )
    );

-- Function to handle user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get newsletter statistics
CREATE OR REPLACE FUNCTION get_newsletter_stats(user_uuid UUID)
RETURNS TABLE (
    total_newsletters BIGINT,
    total_subscribers BIGINT,
    total_sends BIGINT,
    this_month_sends BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM newsletters WHERE user_id = user_uuid),
        (SELECT COUNT(*) FROM subscribers WHERE user_id = user_uuid AND is_active = true),
        (SELECT COUNT(*) FROM newsletter_sends ns 
         JOIN newsletters n ON ns.newsletter_id = n.id 
         WHERE n.user_id = user_uuid AND ns.status = 'sent'),
        (SELECT COUNT(*) FROM newsletter_sends ns 
         JOIN newsletters n ON ns.newsletter_id = n.id 
         WHERE n.user_id = user_uuid 
         AND ns.status = 'sent' 
         AND ns.sent_at >= date_trunc('month', CURRENT_DATE));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 