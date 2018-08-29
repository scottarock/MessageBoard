const express = require('express'),
      parser = require('body-parser'),
      path = require('path'),
      port = process.env.PORT || 8000,
      mongoose = require('mongoose'),
      { Schema } = mongoose,
      app = express();

mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost/messages:27017',
  { useNewUrlParser: true }
)
mongoose.connection.on('connected', () => console.log('Mongo DB connected'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));
app.use(express.static(path.resolve('static')));
app.use(parser.urlencoded({ extended: true }));

app.get('/', function(request, response) {
  response.render('index');
});

app.listen(port, () => console.log(`Message app listening on port ${port}`));
