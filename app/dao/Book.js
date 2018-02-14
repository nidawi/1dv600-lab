const Vault = require('../assets/Vault')

class Book extends Vault {
  /**
   * 
   * @param {Object} input Input to apply to book.
   * @param {string} input.title Book title.
   * @param {string} input.id Book id.
   * @param {string} input.author Book author.
   * @param {string} input.genre Book genre.
   * @param {string} input.publish_date Book publish date.
   * @param {string} input.price Book price.
   * @param {string} input.description Book description.
   * @extends {Vault}
   */
  constructor (input) {
    super({
        title: '', 
        id: '', 
        author: '', 
        genre: '', 
        publishDate: '', 
        price: '', 
        description: '' // Define all properties of a book object.
    }, {
      publishDate: { alias: ['publish_date'] } // By providing "publish_date" as an alias, XML data will be correctly assigned to the publishDate variable.
    })

    // The Vault super has been initiated using the pre-defined book values
    // Now we iterate through the input and add it all.
    Object.keys(input).forEach(a => this.setItem(a, input[a])) // Since we're potentially dealing with aliases, we need to use the setItem method.

    // We can later add Book-specific methods here if that becomes relevant.
  }
}

module.exports = Book
