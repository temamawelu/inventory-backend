CREATE DATABASE IF NOT EXISTS inventory_db;
USE inventory_db;

CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (id, name, description) VALUES 
(1, 'admin', 'Full system access'),
(2, 'user', 'Basic access')
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_username (username)
);

CREATE TABLE IF NOT EXISTS articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_threshold INT DEFAULT 0,
    max_stock_threshold INT DEFAULT NULL,
    location VARCHAR(100),
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_sku (sku),
    INDEX idx_name (name),
    INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL,
    user_id INT NOT NULL,
    movement_type ENUM('GOODS_RECEIPT', 'GOODS_ISSUE', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_article (article_id),
    INDEX idx_date (created_at)
);

INSERT INTO users (username, email, password_hash, role_id) VALUES 
('admin', 'admin@inventory.com', '.Mqr7KgKqYxZQKJZqZxZxZxZxZxZxZ', 1)
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO articles (sku, name, description, category, unit_price, current_stock, min_stock_threshold, location, created_by) VALUES
('PRD-001', 'Laptop Pro', 'High-performance laptop', 'Electronics', 999.99, 25, 5, 'A1-Shelf1', 1),
('PRD-002', 'Wireless Mouse', 'Ergonomic wireless mouse', 'Accessories', 29.99, 150, 20, 'B2-Shelf3', 1),
('PRD-003', 'USB-C Cable', '2m USB-C cable', 'Accessories', 12.99, 200, 30, 'B2-Shelf4', 1),
('PRD-004', 'Office Chair', 'Ergonomic chair', 'Furniture', 299.99, 10, 3, 'C1-Shelf1', 1),
('PRD-005', 'Monitor 27"', '4K UHD Monitor', 'Electronics', 399.99, 8, 2, 'A2-Shelf2', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO stock_movements (article_id, user_id, movement_type, quantity, previous_stock, new_stock, notes) VALUES
(1, 1, 'GOODS_RECEIPT', 25, 0, 25, 'Initial stock'),
(2, 1, 'GOODS_RECEIPT', 150, 0, 150, 'Initial stock'),
(3, 1, 'GOODS_RECEIPT', 200, 0, 200, 'Initial stock'),
(4, 1, 'GOODS_RECEIPT', 10, 0, 10, 'Initial stock'),
(5, 1, 'GOODS_RECEIPT', 8, 0, 8, 'Initial stock');

CREATE OR REPLACE VIEW low_stock_alert AS
SELECT a.id, a.sku, a.name, a.current_stock, a.min_stock_threshold, a.location
FROM articles a
WHERE a.is_active = 1 AND a.current_stock <= a.min_stock_threshold
ORDER BY a.current_stock ASC;

SELECT 'Database Setup Complete!' as Status;
