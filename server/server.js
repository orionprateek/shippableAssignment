'use strict'

const http = require('http')
    , app = require('./app.js')
    , server = http.createServer(app)
    , PORT = require('./config/config.js').SERVER_PORT;

server.listen(PORT, ()=>{
  console.log('Server running on ', PORT);
})
