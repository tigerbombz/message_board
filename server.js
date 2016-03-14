// Require the Express Module
var express = require("express");
// Create an Express App
var app = express();
var mongoose = require('mongoose');
// Require body-parser (to receive post data from clients)
var bodyParser = require("body-parser");
// Integrate body-parser with our App
app.use(bodyParser.urlencoded());
// Require path
var path = require("path");
// Setting our Static Folder Directory
app.use(express.static(__dirname + "./static"));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');
// Routes
// Root Request

mongoose.connect('mongodb://localhost/message_board');

app.listen(8000, function() {
    console.log("listening on port 8000");
})


//RETRIEVING THE DATA
app.get('/messages', function(req, res) {
  Message.find( {})
    .populate('comments')
    .exec(function(err, messages){
  res.render("index", {messages: messages});
  });
});


//ADDING A MESSAGE

var Schema = mongoose.Schema;

var MessageSchema = new mongoose.Schema({
  name: String,
  message: String,
  comments: [ {type: Schema.Types.ObjectId, ref: 'Comment'} ]
})
mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message')



app.post('/messages', function(req, res){
  console.log("POST DATA", req.body);
  var message = new Message( { name: req.body.name, message: req.body.message} );

  message.save(function(err){
    if(err) {
      console.log("Could Not Add Message");
      res.render("index")
    } else {
      console.log("Successfully added message");
      res.redirect('/messages')
    };
    });
  });


//ADDING A COMMENT


var CommentSchema = new mongoose.Schema({
  name: String,
  _message: {type: Schema.Types.ObjectId, ref: 'Message'},
  comment: String,
  created_at: {type: Date, default: new Date}
});

mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment')

app.post('/messages/:id', function(req, res){
  Message.findOne({_id: req.params.id}, function(err, message){
    var comment = new Comment(req.body);
    comment._message = message._id;
    message.comments.push(comment);
    comment.save(function(err){
  message.save(function(err){
    if(err) { console.log('Error'); }
    else { res.redirect('/messages'); }
  });
    });
  });
});

