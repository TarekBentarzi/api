-- Idempotent seed data for users
INSERT INTO users (name, email)
VALUES
  ('Bob', 'bob@example.com'),
  ('Carol', 'carol@example.com')
ON CONFLICT (email) DO NOTHING;
