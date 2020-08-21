const { allHasil, search } = require('../src/database/queries');

allHasil({ year: 2020, 'majors.group': 1 }, { offset: 0, limit: 100 }).then(
	console.log
);
