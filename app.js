const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Library to generate random strings used for the bucket id
const randomstring = require("randomstring");

// Serve static pages
app.use(express.static(__dirname + "/public"));

// Generate a new bucket and open the page
app.get("/", function(req, res) {
  // generate random ID
  let codeId = randomstring.generate({
    length: 6,
    charset: "alphabetic",
    readable: true
  });

  // open the new bucket with it's id
  res.redirect("/" + codeId);
});

// Serve the html page
app.get("/:id", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// Handle socket io connection
io.on("connection", function(socket) {
  let bucket = false;
  // Join a bucket
  socket.on("bucket", function(bucketId) {
    // add the current connected user to this bucket
    socket.join(bucketId);

    // save the bucket it to this user
    bucket = bucketId;
    socket.bucket = bucketId;

    // get the total amount of connected users within this bucket
    io.to(bucket).emit("usersConnected", getBucketUsers(bucket).length);
  });

  // Add a link to bucket
  socket.on("addLink", function(link) {
    // just emit the new link to the bucket
    io.to(bucket).emit("newLink", link);
  });

  socket.on("disconnect", function() {
    // get the total amount of remaining users within this bucket
    io.to(bucket).emit("usersConnected", getBucketUsers(bucket).length);
  });
});

// Start the server on the given port
server.listen(process.env.PORT || 3001);

// Helper function that gets the users that are connected within a specific bucket
function getBucketUsers(bucket) {
  var connectedUsers = Object.keys(io.sockets.connected)
    .map(function(socketId) {
      return {
        id: socketId,
        bucket: io.sockets.connected[socketId].bucket
      };
    })
    .filter(function(user) {
      return user.bucket == bucket;
    });

  return connectedUsers;
}
