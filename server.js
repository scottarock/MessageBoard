const express = require('express'),
      parser = require('body-parser'),
      path = require('path'),
      port = process.env.PORT || 8000,
      mongoose = require('mongoose'),
      { Schema } = mongoose,
      app = express();

let messageWarnings = {},
    commentWarnings = {};

// set up and connect to mongo db
mongoose.Promise = global.Promise;
mongoose.connect(
  'mongodb://localhost:27017/messages',
  { useNewUrlParser: true }
)
mongoose.connection.on('connected', () => console.log('Mongo DB connected'));

// create schemas for the comments and messages
const commentSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [
      true,
      'Name is required'
    ]
  },
  comment: {
    type: String,
    trim: true,
    required: [
      true,
      'Comment is required'
    ]
  },
}, { timestamps: true });

const messageSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [
      true,
      'Name is required'
    ]
  },
  message: {
    type: String,
    trim: true,
    required: [
      true,
      'Message is required'
    ]
  },
  comments: [commentSchema],
}, { timestamps: true });

// register the schemas
const Comment = mongoose.model('Comment', commentSchema);
const Message = mongoose.model('Message', messageSchema);

// set up the server
app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));
app.use(express.static(path.resolve('static')));
app.use(parser.urlencoded({ extended: true }));

// ROUTES

// root route - this is a single page app
app.get('/', function(request, response) {
  Message.find({})
    .then(messages => {
      response.render('index', { messages, messageWarnings, commentWarnings });
      messageWarnings = {};
      commentWarnings = {};
    })
    .catch(console.log);
});

// create a message
app.post('/messages', function(request, response) {
  Message.create(request.body)
    .then(message => response.redirect('/'))
    .catch(error => {
      messageWarnings.name = request.body.name;
      messageWarnings.message = request.body.message;
      messageWarnings.warnings = Object.keys(error.errors).map(key => error.errors[key].message);
      response.redirect('/');
    });
});

// add a comment to a message (no other form of editing possible)
app.post('/messages/edit/:id', function(request, response) {
  Comment.create(request.body)
    .then(comment => {
      return Message.findByIdAndUpdate(request.params.id, {$push: {comments: comment}})
        .then(message => response.redirect('/'))
    })
    .catch(error => {
      commentWarnings.id = request.params.id;
      commentWarnings.name = request.body.name;
      commentWarnings.comment = request.body.comment;
      commentWarnings.warnings = Object.keys(error.errors).map(key => error.errors[key].message);
      response.redirect('/');
    });
});

// start the server
app.listen(port, () => console.log(`Message app listening on port ${port}`));
