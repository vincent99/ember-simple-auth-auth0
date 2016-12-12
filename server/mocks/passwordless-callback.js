module.exports = function(app) {
  app.get('/passwordless', function(req, res) {
    res.send('hello');
  });
};
