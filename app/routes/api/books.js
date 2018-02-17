// I had to rewrite this module. It was a mess.
const express = require('express')
const router = express.Router()

const AddBookResource = require('../../resources/AddBookResource')
const EditBookResource = require('../../resources/EditBookResource')
const GetBookResource = require('../../resources/GetBookResource')
const GetBooksResource = require('../../resources/GetBooksResource')
const RemoveBookResource = require('../../resources/RemoveBookResource')

router.get('/', function (req, res) {
  res.type('json')

  // It's a fancy promise now.
  GetBooksResource()
  .then(books => res.send(books))
  .catch(err => res.status(500).send('Error 500 - Internal Server Error\n' + err.message))
})


router.put('/', function (req, res) {
  res.type('json')

  AddBookResource(req.body)
  .then(data => res.send('{}'))
  .catch(err => res.status(500).send('Error 500 - Internal Server Error\n' + err.message))
})


router.route('/:bookId')
  .get(function (req, res) {
      res.type('json');
      GetBookResource(req.params.bookId, function (data) {
          res.send(data);
      });
  })

  .post(function (req, res) {
      res.type('json');
      EditBookResource(req.params.bookId, req.body, function () {
          res.send("{}");
      });
  })

  .delete(function (req, res) {
      res.type('json')

      RemoveBookResource(req.params.bookId)
      .then(data => res.send('{}'))
      .catch(err => res.status(500).send('Error 500 - Internal Server Error\n' + err.message))
  })

module.exports = router
