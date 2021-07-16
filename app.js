require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5500;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const routes = require('./routes/index');
app.use('/', routes);

require('./config/connection');

app.listen(PORT, () => {
    console.log(`Server has started and can be seen at: http://localhost:${PORT}`)
});

