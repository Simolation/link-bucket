var socket = io();

// create the vue js instance
var app = new Vue({
  el: "#app",
  data: {
    links: [],
    linkInput: "",
    bucketCode: false,
    connectedCount: 0
  },
  methods: {
    // add a new link and send it to the socket
    addLink: function() {
      // emit the added link
      socket.emit("addLink", { time: new Date(), link: this.linkInput });

      // empty the input field
      this.linkInput = "";

      // focus the input field again
      this.$refs.linkInput.focus();
    }
  },
  computed: {
    // enhance and sort all links
    getLinks: function() {
      return this.links
        .map(x => {
          return {
            time: x.time,
            link: x.link,
            favicon:
              "https://www.google.com/s2/favicons?domain=" +
              encodeURIComponent(x.link)
          };
        })
        .sort(function(a, b) {
          return new Date(b.time) - new Date(a.time);
        });
    },

    // get the current url
    currentUrl: function() {
      return window.location.href;
    }
  },
  created: function() {
    // get the bucket code from the url
    var bucketCode = window.location.pathname.replace("/", "");

    // Set the current bucket Code
    this.bucketCode = bucketCode;

    socket.on("connect", function() {
      // Send the bucket code and join bucket
      socket.emit("bucket", bucketCode);
    });

    // somebody added a new link
    socket.on("newLink", link => {
      // add the link to the list
      this.links.push(link);
    });

    // a user joined or left the bucket
    socket.on("usersConnected", count => {
      this.connectedCount = count;
    });
  }
});
