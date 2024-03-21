interface IResponse {
  success: boolean;
  message?: string;
  data: object;
}

export type ErrorResponse = IResponse & {
  error_code: number;
};

export const createResponse = (data: object, message?: string): IResponse => {
  return { data, message, success: true };
};
