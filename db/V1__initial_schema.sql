CREATE TABLE profiles (
  id      serial PRIMARY KEY,
  alias   text UNIQUE,
  address text UNIQUE NOT NULL
);

CREATE TABLE non_fungible_tokens (
  id                serial PRIMARY KEY,
  token_id          text NOT NULL,
  creator_address   text NOT NULL,
  operation_address text NOT NULL
);

CREATE TABLE published_operations (
  id                serial PRIMARY KEY,
  address           text NOT NULL,
  initiator_address text NOT NULL
);
