
# app.coffee - Test server for the application
express = require('express');
app = express()

app.use(express.static(__dirname ))


app.listen 7076
