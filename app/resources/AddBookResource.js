// I decided to add this one as well for debugging purposes.
const LibraryDAO = require('../dao/LibraryDAO')

const getNextID = books => {
  for (let i = 0; i < books.length; i++) {
    if ((i + 1) !== parseInt(books[i].id)) return i + 1
  }
  return books.length + 1
}

module.exports = addBook = (book) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await LibraryDAO.readXMLFile() // Read the books that we currently have.
      data.push(Object.assign(book, { id: getNextID(data) })) // Add new book to current book list, and give it an id
      await LibraryDAO.writeXMLFile(data) // Re-write book list to xml file.
      resolve(true) // Then we resolve to true
    } catch (err) { reject(err) }
  })
}
