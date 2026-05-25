-- ENUMS
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'COMMITTEE_HEAD', 'STUDENT');
CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE registration_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'WAITLISTED');

-- USERS TABLE
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'STUDENT',
    college_id VARCHAR(50), 
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMMITTEES TABLE
CREATE TABLE committees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    logo_url VARCHAR(255),
    established_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COMMITTEE_MEMBERS (Mapping users to committees)
CREATE TABLE committee_members (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    committee_id INT REFERENCES committees(id) ON DELETE CASCADE,
    position VARCHAR(100), 
    UNIQUE(user_id, committee_id)
);

-- EVENTS TABLE
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    committee_id INT REFERENCES committees(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    banner_url VARCHAR(255),
    event_type VARCHAR(50), 
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    venue VARCHAR(150) NOT NULL,
    capacity INT NOT NULL,
    status event_status DEFAULT 'DRAFT',
    is_paid BOOLEAN DEFAULT FALSE,
    fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- REGISTRATIONS TABLE
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    event_id INT REFERENCES events(id) ON DELETE CASCADE,
    status registration_status DEFAULT 'PENDING',
    payment_status VARCHAR(50) DEFAULT 'NOT_APPLICABLE',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

-- ATTENDANCE TABLE
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id) ON DELETE CASCADE,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    marked_by INT REFERENCES users(id), 
    check_in_method VARCHAR(50) DEFAULT 'QR_SCAN'
);

-- CERTIFICATES TABLE
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    registration_id INT REFERENCES registrations(id) ON DELETE CASCADE,
    certificate_url VARCHAR(255) NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    certificate_code VARCHAR(100) UNIQUE NOT NULL 
);

-- NOTIFICATIONS / EMAILS LOG
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(150),
    subject VARCHAR(200),
    status VARCHAR(50), 
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
