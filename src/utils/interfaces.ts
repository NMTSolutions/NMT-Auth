export interface IResultSetHeader {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  info: string;
  serverStatus: number;
  warninStatus: number;
}

export interface IRawUser {
  uid: number;
  fullname: string;
  username: string;
  email: string;
  password_hash: string;
  phone: string | null;
  birth_date: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  created_at: string | null;
  updated_at: string | null;
  refresh_token: string | null;
  refresh_token_expires_at: string | null;
  region: string | null;
  country: string | null;
  country_iso: string | null;
}
