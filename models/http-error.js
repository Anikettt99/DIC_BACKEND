class HttpError extends Error {
  constructor(message, errorCode) {
    /* calls the constructor of base class ..i.e here Error
     */
    super(message); // Add a message property
    this.code = errorCode; // Adds a "code" property
  }
}

module.exports = HttpError;
