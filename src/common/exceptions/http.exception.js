class HttpException extends Error {
  constructor(status = 500, message = 'Internal Server Error.') {
    super(message);
    this.status = status;
    this.message = message;
  }
}

module.exports = HttpException;
