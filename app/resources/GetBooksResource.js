// In this module we will handle some of the logic relating to fetching the list of books.
// Essentially, we will use LibraryDAO.js to read and parse books.xml,
// and then this class will convert the XML objects into Book.js objects
// and put them into an array which it will then return in JSON format.
// I also took the liberty of rewriting this module.

// We will need few other modules
const LibraryDAO = require('../dao/LibraryDAO')

// The title is optional and is only present when searching. (You need yo modify the books.js file first)

// We will re-write this into a promise without a callback.
module.exports = getBooks = title => {
    return new Promise((resolve, reject) => {
        LibraryDAO.readXMLFile(title)
        .then(books => resolve(JSON.stringify(books)))
        .catch(err => reject(err))
    })
}
