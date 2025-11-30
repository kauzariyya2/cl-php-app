-- Seed admin user
-- Password: admin123 (hashed with PBKDF2)
-- Format: base64(salt):base64(hash)
-- You should change this password after first login

INSERT INTO "User" ("email", "password", "name", "role")
VALUES (
  'admin@example.com',
  'Yjc4MjBkYjFkNjE0N2Y5NA==:rTF8xFNqKR3XEaAb7jK9ZBWI1amB1VBrF7v+SxIEXnA=',
  'Administrator',
  'admin'
) ON CONFLICT ("email") DO NOTHING;
