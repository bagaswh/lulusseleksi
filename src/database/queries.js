const db = require('./database');
const _ = require('lodash');

function filterColumns(_, col) {
	return ['s_id', 'test_type', 'year'].includes(col);
}

async function all(filter, paging) {
	return {
		records: await db('hasil_utbk')
			.select('*')
			.where(_.pickBy(filter, filterColumns))
			.offset(paging.offset)
			.limit(paging.limit),

		metadata: {
			total_rows: (
				await db('hasil_utbk')
					.count('* as count')
					.where(_.pickBy(filter, filterColumns))
					.first()
			).count,
		},
	};
}

async function search(q, filter, paging, opts = {}) {
	return {
		records: await db('hasil_utbk')
			.select('*')
			.where(_.pickBy(filter, filterColumns))
			.whereRaw(
				'MATCH (s_name) AGAINST (? IN BOOLEAN MODE)',
				opts.exact ? `"${q}"` : `${q}`
			)
			.offset(paging.offset)
			.limit(paging.limit),

		metadata: {
			total_rows: (
				await db('hasil_utbk')
					.count('* as count')
					.where(_.pickBy(filter, filterColumns))
					.whereRaw(
						'MATCH (s_name) AGAINST (? IN BOOLEAN MODE)',
						opts.exact ? `"${q}"` : `${q}`
					)
					.first()
			).count,
		},
	};
}

module.exports = { all, search };
