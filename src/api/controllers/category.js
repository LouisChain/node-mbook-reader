const Exceptions = require("../utils/exception");
const Category = require("../models/category");

exports.getCategory = (req, res, next) => {
  let { id } = req.params;
  Category
    .findById(id)
    .exec()
    .then(doc => {
      if (doc) {
        res.status(200).json({
          data: doc
        });
      } else {
        res.status(404).json(Exceptions.item_not_found)
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(Exceptions.unknown_error);
    })
}