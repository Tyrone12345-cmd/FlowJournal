-- Test User anlegen (Passwort: test123)
-- Das Passwort ist bereits mit bcrypt gehashed
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES (
  'test@test.com',
  '$2a$10$rN8qCjLQqX5Y3GJYxw0HVuE1vZ4yQ2xGKzXvYzL8wZk5WqF6nH7Hm',
  'Test',
  'User',
  'trader'
);

-- Du kannst auch einen Admin-User anlegen:
INSERT INTO users (email, password, first_name, last_name, role) 
VALUES (
  'admin@test.com',
  '$2a$10$rN8qCjLQqX5Y3GJYxw0HVuE1vZ4yQ2xGKzXvYzL8wZk5WqF6nH7Hm',
  'Admin',
  'User',
  'admin'
);
