function Book (input) {
  Object.keys(input).forEach(a => this[a] = input[a] )
}

module.exports = Book
