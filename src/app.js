const express = require('express');
const cors = require('cors');
const { NotFoundException } = require('./common/exceptions');
const errorMiddleware = require('./middlewares/error-handler.middleware');

require('dotenv').config();

const PORT = process.env.PORT || 8080;

class App {
  constructor(controllers) {
    this.app = express();
    this.#initializeCors();
    this.#initializeMiddlewares();
    this.#initialzeControllers(controllers);
    this.#initializeNotFoundMiddleware();
    this.#initializeErrorHandling();
  }

  listen() {
    this.app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on ${PORT}`);
    });
  }

  #initializeCors() {
    const domains = ['localhost:3000'];
    this.app.use(
      cors({
        origin(origin, callback) {
          const isTrue = domains.indexOf(origin) !== -1;
          callback(null, isTrue);
        },
        allowHeaders: 'Origin, Content-Type, X-Requested-With, Accept',
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
        preflightContinue: false,
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
  }

  #initializeMiddlewares() {
    this.app.use(express.json({ extended: true, limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  #initialzeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  #initializeNotFoundMiddleware() {
    this.app.use((req, _res, next) => {
      if (!req.route) next(new NotFoundException());
      next();
    });
  }

  #initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

module.exports = App;
