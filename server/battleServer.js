var Firebase = require('firebase');

require('./auth')
 .then(function() {
    console.log('Connected');
  }, function(err) {
    console.log(err);
  });
