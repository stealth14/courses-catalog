export interface Idle<T> {
  item?: T;
  status: "idle";
}

export interface Loading {
  status: "loading";
}

export interface Success<T> {
  status: "success";
  item: T;
}

export interface Failure {
  status: "error";
  error: unknown;
}

export interface NotFound {
  status: "not-found";
}

export interface Refreshing<T> {
  status: "refreshing";
  item?: T;
}


export type Result<T> = Idle<T> | Loading | Refreshing<T> | Success<T> | Failure | NotFound;

export type Dataset<T> =
  | (Idle<T> & { refresh: () => Promise<void> })
  | (Loading & { refresh: () => Promise<void> })  | (Refreshing<T> & { refresh: () => Promise<void> })  | (Success<T> & { refresh: () => Promise<void> })
  | (Failure & { refresh: () => Promise<void> })
  | (NotFound & { refresh: () => Promise<void> })
  | (Refreshing<T> & { refresh: () => Promise<void> });


export default Result;
