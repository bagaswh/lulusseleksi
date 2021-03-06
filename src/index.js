const http = require('http');
const app = require('./app');

const server = http.createServer(app);

const port = process.env.PORT || 3010;
server.listen(port, onListening);

function onListening() {
	console.log(`Listening to port ${port}`);
}
