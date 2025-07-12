-- Insert admin user
INSERT INTO users (email, password_hash, name, age, blood_group, phone, district, role, points) VALUES
('admin@bloodbond.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Admin User', 30, 'O+', '+1234567890', 'Central', 'admin', 0);

-- Insert sample donors
INSERT INTO users (email, password_hash, name, age, blood_group, phone, district, role, is_available, total_donations, points) VALUES
('john.doe@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'John Doe', 28, 'O+', '+1234567891', 'Central', 'donor', true, 5, 250),
('jane.smith@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Jane Smith', 32, 'A+', '+1234567892', 'North', 'donor', true, 8, 400),
('mike.wilson@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Mike Wilson', 25, 'B+', '+1234567893', 'South', 'donor', false, 3, 150),
('sarah.johnson@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Sarah Johnson', 29, 'AB+', '+1234567894', 'East', 'donor', true, 12, 600),
('david.brown@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'David Brown', 35, 'O-', '+1234567895', 'West', 'donor', true, 15, 750);

-- Insert sample recipients
INSERT INTO users (email, password_hash, name, age, blood_group, phone, district, role) VALUES
('alice.cooper@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Alice Cooper', 26, 'A+', '+1234567896', 'Central', 'recipient'),
('bob.taylor@email.com', '$2b$10$rQZ9QmjKjKjKjKjKjKjKjOeX8X8X8X8X8X8X8X8X8X8X8X8X8X8X8', 'Bob Taylor', 31, 'B+', '+1234567897', 'North', 'recipient');

-- Insert sample blood requests
INSERT INTO blood_requests (recipient_id, blood_group, district, urgency_level, hospital_name, message) VALUES
((SELECT id FROM users WHERE email = 'alice.cooper@email.com'), 'A+', 'Central', 'high', 'Central General Hospital', 'Urgent need for surgery tomorrow morning'),
((SELECT id FROM users WHERE email = 'bob.taylor@email.com'), 'B+', 'North', 'medium', 'North Medical Center', 'Required for planned surgery next week');

-- Insert sample donations
INSERT INTO donations (donor_id, status, points_awarded, verified_at) VALUES
((SELECT id FROM users WHERE email = 'john.doe@email.com'), 'verified', 50, NOW() - INTERVAL '1 month'),
((SELECT id FROM users WHERE email = 'john.doe@email.com'), 'verified', 50, NOW() - INTERVAL '2 months'),
((SELECT id FROM users WHERE email = 'jane.smith@email.com'), 'verified', 50, NOW() - INTERVAL '1 week'),
((SELECT id FROM users WHERE email = 'sarah.johnson@email.com'), 'verified', 50, NOW() - INTERVAL '3 days');
