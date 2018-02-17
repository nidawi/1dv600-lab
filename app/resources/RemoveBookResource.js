const LibraryDAO = require('../dao/LibraryDAO')

module.exports = deleteBook = (bookId) => {
  return new Promise(async (resolve, reject) => {
    // We will let this be a graceful method of deletion. If the book is not found, we won't throw an error.
    try {
      const data = await LibraryDAO.readXMLFile() // Read the books that we currently have.
      if (data.some(a => { return (a.id === bookId) })) {
        // If the book exists, filter away the removed book and then write the file anew.
        await LibraryDAO.writeXMLFile(data.filter(a => { return (a.id !== bookId) }))
      }
      resolve(true) // Then we resolve to true, regardless of whether the book actually existed or not.
    } catch (err) { reject(err) }
  })
}
