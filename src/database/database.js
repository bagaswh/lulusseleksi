const config = require('config');

const dbConfig = config.get('dbConfig');

const knex = require('knex')({
	client: 'mysql2',
	connection: dbConfig,
});

module.exports = knex;
