const mongoose = require("mongoose");

const Book = require("../models/book");
const Category = require("../models/category");

exports.fetchStore = (req, res, next) => {
  Category.find()
    .select("_id name")
    .exec()
    .then(categories => {
      let limit = req.query.limit;
      limit = parseInt(limit);
      Book.aggregate([
        {
          "$match": {
            "format": { "$in": ["epub", "audio"] }
          }
        },
        {
          "$sort": { "_id": -1 }
        },
        {
          "$group": {
            "_id": "$format",
            "docs": { $push: "$$ROOT" },
            "count": { $sum: 1 }
          }
        }
      ]).exec()
        .then(queries => {
          let result = {};
          for (let prop in queries) {
            let obj = queries[prop];
            let i = 0;
            for (let element in obj.docs) {
              if (i === limit) {
                break;
              }
              i++;
            }
            obj.docs = obj.docs.slice(0, i);
            obj.count = i;
            result[obj._id] = obj.docs;
          }
          result["categories"] = categories;

          res.status(200).json({ data: result });
        })
        .catch(error => {
          console.log(error);
          res.status(500).json({ error });
        })
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    })
}

exports.getByCategory = (req, res, next) => {
  let { category, offset, limit } = req.query;
  Book.find({
    category: new mongoose.Types.ObjectId(category)
  }).skip(parseInt(offset))
    .limit(parseInt(limit))
    .exec()
    .then(docs => {
      res.status(200).json({
        data: docs
      })
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
}

exports.search = (req, res, next) => {
  let { keyword } = req.query;
  Book.find(
    {
      $or: [
        { "title": { $regex: keyword, $options: "i" } },
        { "author": { $regex: keyword, $options: "i" } }
      ]
    }).exec()
    .then(docs => {
      res.status(200).json({ data: docs });
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
}