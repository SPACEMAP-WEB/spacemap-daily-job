class StringHandler {
  static isNumeric(inputString) {
    if (!inputString) {
      return false;
    }
    const stringId = inputString.replace(/^\s*|\s*$/g, '');
    return stringId !== '' && !Number.isNaN(Number(stringId));
  }

  static isValidString(string) {
    return string && string.length > 0;
  }
}

module.exports = StringHandler;
