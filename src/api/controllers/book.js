const mongoose = require("mongoose");

const Book = require("../models/book");

exports.getAllBooks = (req, res, next) => {
  Book
    .find()
    .select("name price _id file")
    .exec()
    .then(docs => {
      console.log(docs);
      let result = {
        count: docs.length,
        data: docs
      }
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

exports.createBook = (req, res, next) => {
  console.log(req.file);
  let book = new Book({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    file: req.file.path
  });
  book
    .save()
    .then(doc => {
      console.log(doc);
      res.status(201).json({
        message: "Handling POST requests to /books",
        bookCreated: book
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err })
    });
}

exports.getBook = (req, res, next) => {
  let id = req.params.id;
  Book
    .findById(id)
    .select("name price _id file")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No valid entry found for id: " + id });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
}

exports.updateBook = (req, res, next) => {
  let id = req.params.id;
  let updateOps = {};
  for (op of req.body) {
    updateOps[op.propName] = op.value;
  }
  Book
    .update({ _id: id }, { $set: updateOps })
    .exec()
    .then(result => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
}

exports.deleteBook = (req, res, next) => {
  let id = req.params.id;
  Book
    .remove({ _id: id })
    .exec()
    .then(doc => {
      console.log("Deleted ", id);
      if (doc.length >= 0) {
        res.status(200).json(doc);
      } else {
        res.status(404).json({ message: "No entries found" })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
}