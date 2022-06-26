const HttpException = require('./http.exception');

class BadRequestException extends HttpException {
  constructor(message = 'Bad request.') {
    super(400, message);
  }
}

module.exports = BadRequestException;
