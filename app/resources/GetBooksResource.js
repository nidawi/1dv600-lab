(function () {
    "use strict";

    var LibraryDAO = require('../dao/LibraryDAO');
    const Book = require('../dao/Book.js')

    // each book we need the information id, title, author, genre, publish date, price and description.
    module.exports = function getBooks (callback, title) { // The title is optional and is only present when searching. (You need yo modify the books.js file first)
        callback(JSON.stringify([
            new Book({ title: 'From C# to JavaScript: God Help Me', id: '1', author: 'Gill Bates', genre: 'Educational', publish: new Date().toLocaleDateString(), price: '$25.99', description: 'How to survive the coming of the end.' }),
            new Book({ title: '101 Reasons Apples Are Good For You', id: '2', author: 'Jobber Steven', genre: '\"Educational\"', publish: new Date().toLocaleDateString(), price: '$899.99', description: 'We like apples here at Apple.' }),
            new Book({ title: 'Java Belongs in a Museum', id: '3', author: 'Common Sense Inc.', genre: 'Religious Texts', publish: new Date().toLocaleDateString(), price: 'FREE', description: 'Why Java belongs in a museum.' })
        ]))
    };

}());
