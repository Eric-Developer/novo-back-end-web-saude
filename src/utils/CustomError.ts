class CustomError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: unknown;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export default CustomError;
