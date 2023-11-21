CREATE USER DEVNMT with ENCRYPTED PASSWORD 'NMT-HAS-DEV';

REVOKE connect ON DATABASE dev_auth FROM PUBLIC;

GRANT CONNECT ON DATABASE dev_auth TO DEVNMT;

GRANT ALL PRIVILEGES ON DATABASE dev_auth to DEVNMT;

GRANT ALL PRIVILEGES ON TABLE users TO DEVNMT;
