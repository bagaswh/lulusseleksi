const dotenv = require('dotenv');
const { isEmpty } = require('lodash');

dotenv.config();

const cache = {};
module.exports = {
	getConfig(key) {
		const env = process.env;

		if (isEmpty(cache)) {
			for (const key in env) {
				let value;
				if (!Number.isNaN(Number(env[key]))) {
					value = Number(env[key]);
				} else {
					value = env[key];
				}
				cache[key] = value;
			}
		}

		return key ? cache[key] : cache;
	},
};
