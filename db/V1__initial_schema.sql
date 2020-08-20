-- TODO: Modify as requirements change
CREATE TABLE contacts (
  id         serial PRIMARY KEY,
  owner      text NOT NULL,
  alias      text NOT NULL,
  tz_address text NOT NULL
);

CREATE TABLE published_operations (
  id        serial PRIMARY KEY,
  hash      text NOT NULL,
  initiator text NOT NULL,
  method    text NOT NULL,
  params    text NOT NULL,
  status    text NOT NULL,
  retry     boolean NOT NULL DEFAULT TRUE
);
