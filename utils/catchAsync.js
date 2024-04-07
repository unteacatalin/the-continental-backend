module.exports = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
    console.error(err);
    return res.status(400).json({
      status: 'error',
      data: { },
      error: 'unknown error',
    });
  });
};
