-- ============================================================================
-- MWG RETAIL SYSTEM — MYSQL 8.0 DDL (10 BẢNG QUAN HỆ CHUẨN)
-- Dùng để:
--   1. Import trực tiếp vào web draw.io: Arrange (+) -> Insert -> Advanced -> SQL...
--   2. Hoặc chạy trực tiếp trên MySQL Workbench để khởi tạo cấu trúc 10 bảng.
-- ============================================================================

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100),
    description VARCHAR(255)
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    price DOUBLE NOT NULL,
    description TEXT,
    category_id BIGINT NOT NULL,
    brand_id BIGINT,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

CREATE TABLE store_branches (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20)
);

CREATE TABLE inventories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    branch_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    UNIQUE (product_id, branch_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (branch_id) REFERENCES store_branches(id)
);

CREATE TABLE customers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(150),
    address VARCHAR(255)
);

CREATE TABLE promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    promo_code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DOUBLE NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL
);

CREATE TABLE product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    customer_id BIGINT NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    review_date DATETIME NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE customer_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    total_amount DOUBLE NOT NULL,
    status VARCHAR(50) NOT NULL,
    order_date DATETIME NOT NULL,
    customer_id BIGINT,
    promotion_id BIGINT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
);

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DOUBLE NOT NULL,
    FOREIGN KEY (order_id) REFERENCES customer_orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
