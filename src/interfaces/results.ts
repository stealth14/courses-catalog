export type Meta = {
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
};

export interface Idle {
  status: "idle";
}

export interface Loading {
  status: "loading";
}

export interface Success<T> {
  status: "success";
  items: T[];
  meta: Meta;
}

export interface Failure {
  status: "error";
  error: unknown;
}

export interface NotFound {
  status: "not-found";
}

export type Results<T> = Idle | Loading | Success<T> | Failure | NotFound;

export type Dataset<T> =
  | (Idle & { refresh: () => Promise<void> })
  | (Loading & { refresh: () => Promise<void> })
  | (Success<T> & { refresh: () => Promise<void> })
  | (Failure & { refresh: () => Promise<void> })
  | (NotFound & { refresh: () => Promise<void> });


export default Results;
