export type UUID = string;

export type DateISO = string;

export type Result<T, E extends Error = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type PaginationQuery = {
  readonly page: number;
  readonly pageSize: number;
};

export type Paginated<T> = {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly total: number;
};
