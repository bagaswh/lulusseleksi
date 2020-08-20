const express = require('express');
const morgan = require('morgan');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms')
);
app.use(express.static('public'));
app.use(express.json());

app.use('/', indexRouter);
app.use('/api', apiRouter);

module.exports = app;
