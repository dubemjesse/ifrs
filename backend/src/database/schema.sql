-- IFRS Portal Authentication Database Schema
-- Create database tables for user authentication system

-- Users table - stores user account information
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    is_active BIT DEFAULT 1,
    email_verified BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    updated_at DATETIME2 DEFAULT GETUTCDATE(),
    last_login DATETIME2 NULL
);

-- Password Reset Tokens table - stores temporary tokens for password reset
CREATE TABLE PasswordResetTokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token NVARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    used BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- User Sessions table - stores active user sessions (optional for JWT stateless approach)
CREATE TABLE UserSessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    session_token NVARCHAR(500) NOT NULL UNIQUE,
    expires_at DATETIME2 NOT NULL,
    created_at DATETIME2 DEFAULT GETUTCDATE(),
    last_accessed DATETIME2 DEFAULT GETUTCDATE(),
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    is_active BIT DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IX_Users_Email ON Users(email);
CREATE INDEX IX_Users_IsActive ON Users(is_active);
CREATE INDEX IX_PasswordResetTokens_Token ON PasswordResetTokens(token);
CREATE INDEX IX_PasswordResetTokens_ExpiresAt ON PasswordResetTokens(expires_at);
CREATE INDEX IX_UserSessions_SessionToken ON UserSessions(session_token);
CREATE INDEX IX_UserSessions_UserId ON UserSessions(user_id);
CREATE INDEX IX_UserSessions_ExpiresAt ON UserSessions(expires_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER TR_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET updated_at = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.id = i.id;
END;

-- Clean up expired tokens procedure
CREATE PROCEDURE CleanupExpiredTokens
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Remove expired password reset tokens
    DELETE FROM PasswordResetTokens 
    WHERE expires_at < GETUTCDATE();
    
    -- Remove expired sessions
    DELETE FROM UserSessions 
    WHERE expires_at < GETUTCDATE();
END;

-- Sample data insertion (for testing - remove in production)
-- INSERT INTO Users (email, password_hash, first_name, last_name, email_verified)
-- VALUES ('admin@ifrs.com', '$2b$10$example_hash', 'Admin', 'User', 1);