const config = require('../configutils');

const DB_HOST = config.getConfig('DB_HOST');
const DB_NAME = config.getConfig('DB_NAME');
const DB_USER = config.getConfig('DB_USER');
const DB_PASSWORD = config.getConfig('DB_PASSWORD');

console.log(
	'initializing database with configuration:',
	DB_HOST,
	DB_NAME,
	DB_USER,
	DB_PASSWORD
);

const knex = require('knex')({
	client: 'mysql2',
	connection: {
		host: DB_HOST,
		user: DB_USER,
		password: DB_PASSWORD,
		database: DB_NAME,
	},
});

module.exports = knex;
