// Again, we need to import a few modules.

const fs = require('fs-extra') // We will use fs-extra instead of standard fs.
const xml2js = require('xml2js')

const parseXML = data => {
  return new Promise((resolve, reject) => {
    xml2js.parseString(data, (err, result) => {
      if (err) reject(err.message)
      else resolve(result)
    })
  })
}

module.exports.readXMLFile = async filter => {
  const data = (await parseXML(await fs.readFile(__dirname.replace('/app/dao', '/books.xml'), 'utf8'))).catalog.book
  if (Array.isArray(data) && data.length > 0) {
    const booksXML = data.map(a => {
      return {
        id: a['$'].id,
        author: a.author[0],
        title: a.title[0],
        genre: a.genre[0],
        price: a.price[0],
        publishDate: a.publish_date[0],
        description: a.description[0]
      }
    })
    
    return booksXML
  } else {
    // If the file is empty, simply return an empty array instead.
    return []
  }
}

module.exports.writeXMLFile = async data => {
  // We need to convert the data into appropriate XML "structure".
  const structure = {
    catalog: {
      book: (!data) ? [] : data.sort((a, b) => { return (parseInt(a.id) - parseInt(b.id)) }).map(a => {
        return {
          '$': { id: a.id },
          author: a.author.trim(),
          title: a.title.trim(),
          genre: a.genre.trim(),
          price: a.price.trim(),
          publish_date: a.publishDate || a.publish_date,
          description: a.description.trim()
        }
      })
    }
  }
  // Parse into XML and write it to the file.
  const xml = new xml2js.Builder().buildObject(structure)
  await fs.writeFile(__dirname.replace('/app/dao', '/books.xml'), xml)
}
