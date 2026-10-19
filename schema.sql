CREATE TYPE account_state AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
);

CREATE TYPE trade_state AS ENUM (
  'OPEN',
  'CLOSE',
  'BREAKE_EVEN',
  'STOP_PROFIT'
);

CREATE TABLE users (
    id CHAR(26) PRIMARY KEY,
    email VARCHAR(250) NOT NULL UNIQUE,
    password VARCHAR(250) NOT NULL,
    username VARCHAR(250) NOT NULL UNIQUE
);

CREATE TABLE account (
    id CHAR(26) PRIMARY KEY,
    user_id CHAR(26) NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    broker VARCHAR(100),
    balance NUMERIC(15,2) DEFAULT 0,
    currency CHAR(3) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    state account_state NOT NULL DEFAULT 'ACTIVE',
    deleted_at TIMESTAMP
);

CREATE TABLE strategy (
  id CHAR(26) PRIMARY KEY,
  name VARCHAR(250),
  description TEXT
);

CREATE TABLE trade (
  id CHAR(26) PRIMARY KEY,
  account_id CHAR(26) NOT NULL REFERENCES account(id),
  symbol VARCHAR(10) NOT NULL,
  market VARCHAR(30) NOT NULL,
  direction VARCHAR(5) NOT NULL,
  entry_price NUMERIC(15,5) DEFAULT 0,
  stop_loss NUMERIC(15,5),
  take_profit NUMERIC(15,5),
  exit_price NUMERIC(15,5) DEFAULT 0,
  quantity NUMERIC(15,3) DEFAULT 0,
  risk_reward VARCHAR(10),
  pnl NUMERIC (15,3) DEFAULT 0,
  commision NUMERIC(10,3) DEFAULT 0,
  swap NUMERIC (15,3) DEFAULT 0,
  open_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  close_at TIMESTAMP NOT NULL,
  status trade_state NOT NULL DEFAULT 'OPEN',
  strategy CHAR(26) NOT NULL REFERENCES strategy(id),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE trade_img (
  id CHAR(26) PRIMARY KEY,
  trade_id CHAR(26) NOT NULL REFERENCES trade(id),
  url VARCHAR(250)
);

CREATE TABLE tag (
  id CHAR(26) PRIMARY KEY,
  name VARCHAR(250),
  color VARCHAR(50)
);

CREATE TABLE trade_tag(
  trade_id CHAR(26) NOT NULL REFERENCES trade(id),
  tag_id CHAR(26) NOT NULL REFERENCES tag(id)
);
