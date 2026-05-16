export interface ApiErrorShape {
  message?: string;
  error?: string;
  code?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}
