class UnknownActionError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = 'UnknownActionError'; // (2)
  }
}

module.exports = UnknownActionError;
