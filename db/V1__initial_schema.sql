CREATE TABLE users (
  id      serial PRIMARY KEY,
  alias   text UNIQUE,
  address text UNIQUE NOT NULL
);

CREATE TABLE contracts (
  id         serial PRIMARY KEY,
  address    text NOT NULL,
  creator_id integer references users(id)
);
