const request = require('request');
const { promisify } = require('util');
const { Cookie } = require('request-cookies');

const promiseRequest = promisify(request);

class httpRequestHandler {
  static async post(url, body) {
    return promiseRequest({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
  }

  static async get(url, headers) {
    return promiseRequest({
      url,
      headers,
    });
  }

  /**
   * @param { String } url
   * @param { String } body
   * @returns
   */
  static async getLoginCookie(url, body) {
    const res = this.post(url, body);
    if (!res) {
      throw new Error('Login request failed.');
    }
    const rawCookies = res.headers['set-cookie'];
    if (!rawCookies) {
      throw new Error('Login request failed.');
    }
    const parsedCookies = await Promise.all(
      rawCookies.map((rawCookie) => {
        const parsedCookie = new Cookie(rawCookie);
        return `${parsedCookie.key}=${parsedCookie.value}`;
      })
    );
    return parsedCookies.join('; ');
  }

  static async getContentsRequest(url, cookie) {
    const res = this.get(url, { Cookie: cookie });
    if (!res || res.statusCode !== 200) {
      throw new Error('Response status code is not 200. (spacetrack)');
    }
    // TODO: 중복 tle 처리
    return res.body;
  }
}

module.exports = httpRequestHandler;
