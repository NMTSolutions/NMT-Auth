import getConnection from "../database/connection";
import NodeError from "../utils/error";
import { APIStatusCode, GenericErrorMessage } from "../utils/enums";

const getUserQuery = "SELECT * FROM users WHERE username = $1 OR email = $2;";

const getUserByUUIDQuery = "SELECT * FROM users WHERE uuid = $1;";

const getUserByPhoneQuery = "SELECT * FROM users WHERE phone = $1;";

const insertUserQuery =
  "INSERT INTO users (name, username, email, password_hash, refresh_token, refresh_token_expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *";

const updateRefreshTokenQuery =
  "UPDATE users SET refresh_token = $1, refresh_token_expires_at = $2 WHERE uuid = $3;";

const updateUserDetailsQuery =
  "UPDATE users SET name = $1, username = $2, phone = $3, birth_date = $4 WHERE uuid = $5;";

const updatePaswordQuery =
  "UPDATE users SET password_hash = $1, refresh_token = $2, refresh_token_expires_at = $3 WHERE uuid = $4;";

export default class User {
  uuid: string | null = null;
  token: string | null = null;
  refreshToken: string | null = null;
  createdAt: string | null = null;
  updatedAt: string | null = null;
  refreshTokenExpiresAt: string | null = null;

  constructor(
    public name: string,
    public username: string,
    public email: string,
    public passwordHash: string,
    public phone?: string | null,
    public dateOfBirth?: string | null,
    public addressLine1?: string | null,
    public addressLine2?: string | null,
    public city?: string | null,
    public state?: string | null,
    public country?: string | null,
    public country_iso?: string | null,
    public region?: string | null,
    public postalCode?: string | null,
  ) {}

  public static findOne = async (
    uniqueIdentifier: string,
    searchBy: "uuid" | "username" | "email" | "phone",
  ) => {
    const connection = await getConnection();
    try {
      const searchParams = {
        query: getUserByUUIDQuery,
        variables: [uniqueIdentifier],
      };

      if (searchBy === "email" || searchBy === "username") {
        searchParams.query = getUserQuery;
        searchParams.variables = [uniqueIdentifier, uniqueIdentifier];
      }

      if (searchBy === "phone") {
        searchParams.query = getUserByPhoneQuery;
        searchParams.variables = [uniqueIdentifier];
      }

      const { query, variables } = searchParams;

      const result = await connection.query(query, variables);

      const rawUser = (result.rowCount as number) > 0 ? result.rows[0] : null;

      if (rawUser) {
        const user = new User(
          rawUser.name,
          rawUser.username,
          rawUser.email,
          rawUser.password_hash,
          rawUser.phone,
          rawUser.birth_date,
        );

        user.uuid = rawUser.uuid;
        user.createdAt = rawUser.created_at;
        user.updatedAt = rawUser.updated_at;
        user.refreshToken = rawUser.refresh_token;
        user.refreshTokenExpiresAt = rawUser.refresh_token_expires_at;

        return user;
      }
    } catch (error: any) {
      const err = new NodeError();
      err.message = error.message;
      err.statusCode = APIStatusCode.INTERNAL_SERVER_ERROR;
      err.code = error.code;
      throw err;
    } finally {
      connection.release();
    }
  };

  public saveRefreshToken = async () => {
    const connection = await getConnection();
    try {
      const result = await connection.query(updateRefreshTokenQuery, [
        this.refreshToken,
        this.refreshTokenExpiresAt,
        this.uuid,
      ]);

      if ((result.rowCount as number) < 1) {
        const err = new NodeError(
          GenericErrorMessage.SAVE_FAILED,
          APIStatusCode.INTERNAL_SERVER_ERROR,
        );
        throw err;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  };

  public save = async () => {
    const connection = await getConnection();
    try {
      const result = await connection.query(insertUserQuery, [
        this.name,
        this.username,
        this.email,
        this.passwordHash,
        this.refreshToken,
        this.refreshTokenExpiresAt,
      ]);

      if ((result.rowCount as number) > 0) {
        const user = result.rows[0];

        this.uuid = user.uuid;
        this.createdAt = user.created_at;
        this.updatedAt = user.updated_at;
      } else {
        const err = new NodeError(
          GenericErrorMessage.SAVE_FAILED,
          APIStatusCode.INTERNAL_SERVER_ERROR,
        );
        throw err;
      }
    } catch (error: any) {
      const err = new NodeError(
        error.message,
        APIStatusCode.INTERNAL_SERVER_ERROR,
        error.code,
      );
      throw err;
    } finally {
      connection.release();
    }
  };

  public update = async () => {
    const connection = await getConnection();
    try {
      const result = await connection.query(updateUserDetailsQuery, [
        this.name,
        this.username,
        this.phone,
        this.dateOfBirth,
        this.uuid,
      ]);

      if ((result.rowCount as number) < 1) {
        const err = new NodeError(
          GenericErrorMessage.SAVE_FAILED,
          APIStatusCode.INTERNAL_SERVER_ERROR,
        );
        throw err;
      }
    } catch (error: any) {
      const err = new NodeError(
        error.message,
        APIStatusCode.INTERNAL_SERVER_ERROR,
        error.code,
      );
      throw err;
    } finally {
      connection.release();
    }
  };

  public updatePassword = async () => {
    const connection = await getConnection();
    try {
      const result = await connection.query(updatePaswordQuery, [
        this.passwordHash,
        this.refreshToken,
        this.refreshTokenExpiresAt,
        this.uuid,
      ]);

      if ((result.rowCount as number) < 1) {
        const err = new NodeError(
          GenericErrorMessage.UPDATE_PASSWORD_FAILED,
          APIStatusCode.INTERNAL_SERVER_ERROR,
        );
        throw err;
      }
    } catch (error: any) {
      const err = new NodeError(
        error.message,
        APIStatusCode.INTERNAL_SERVER_ERROR,
        error.code,
      );
      throw err;
    } finally {
      connection.release();
    }
  };
}
