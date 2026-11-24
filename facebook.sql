CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255),
  email VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  in_stock BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID,
  total DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID,
  title VARCHAR(255),
  content TEXT,
  visibility VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE friendships (
  id UUID PRIMARY KEY,
  user_id UUID,
  friend_id UUID,
  status VARCHAR(20),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (friend_id) REFERENCES users(id)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  type VARCHAR(20)
);

CREATE TABLE conversation_members (
  conversation_id UUID,
  user_id UUID,
  joined_at TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID,
  sender_id UUID,
  content TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id),
  FOREIGN KEY (sender_id) REFERENCES users(id)
);