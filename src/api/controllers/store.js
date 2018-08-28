exports.retrieveStore = (req, res, next) => {
  res.status(200).json({
    message: "Store were fetched"
  });
}