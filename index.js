const express = require('express');
const app = express();
app.use(express.static('client/dist'));
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://127.0.0.1:5173"
  }
});

const port = process.env.PORT;
const MONGODB_URL = process.env.MONGODB_URL;

const mongoose = require("mongoose");
mongoose.connect(MONGODB_URL, { useNewUrlParser: true });

// Database options
const options = {
  timestamps: true, // add timestamp
  toJSON: { // change the way how data is converted to JSON
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => { delete ret._id; return ret; }
  } 
};

// Define the shape of data (= schema) to be saved, and construct a model from the schema.
const postSchema = new mongoose.Schema({ name: String, msg: String, count: Number }, options);
const Post = mongoose.model("Post", postSchema);

app.get('/plain', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('login', async (name) => {
    try {
      const posts = await Post.find({}).limit(10); // fetch 10 latest posts from database
      posts.forEach(p => socket.emit('chat message', p));
    } catch (e) { console.error(e); }

    io.emit('login', name);

    socket.on('chat message', async (msg) => {
      try {
        const p = await Post.create({ name, msg, count: 0 }); // save data to database
        io.emit('chat message', p);          
      } catch (e) { console.error(e); }
    });

    socket.on('fav', async id => {
      const update = { $inc: { count: 1 }};
      const options = { new: true };
      try {
        const p = await Post.findByIdAndUpdate(id, update, options);
        io.emit('fav', p);
      } catch (e) { console.error(e); }
    });

    socket.on('typing', () => {
      console.log('typing')
      io.emit('typing', name);
    })
  })
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log('listening on port:' + port);
});