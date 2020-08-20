const db = require('./database');
const _ = require('lodash');

function filterColumns(_, col) {
	return [
		's_id',
		'test_type',
		'year',
		'majors.code',
		'majors.group',
		'majors.name',
		'univ.code',
		'univ.name',
	].includes(col);
}

async function allHasil(filter, paging) {
	return {
		records: await db('hasil_utbk')
			.select([
				's_id',
				's_name',
				'test_type',
				'year',
				'majors.code AS major_code',
				'majors.group AS major_group',
				'majors.name AS major_name',
				'univ.code AS uni_code',
				'univ.name AS uni_name',
			])
			.leftJoin('majors', 'hasil_utbk.major_id', 'majors.code')
			.leftJoin('univ', 'majors.university_code', 'univ.code')
			.where(_.pickBy(filter, filterColumns))
			.offset(paging.offset)
			.limit(paging.limit),

		metadata: {
			total_rows: (
				await db('hasil_utbk')
					.count('* as count')
					.leftJoin('majors', 'hasil_utbk.major_id', 'majors.code')
					.leftJoin('univ', 'majors.university_code', 'univ.code')
					.where(_.pickBy(filter, filterColumns))
					.first()
			).count,
		},
	};
}

async function searchHasil(q, filter, paging, opts = {}) {
	return {
		records: await db('hasil_utbk')
			.select([
				's_id',
				's_name',
				'test_type',
				'year',
				'majors.code AS major_code',
				'majors.group AS major_group',
				'majors.name AS major_name',
				'univ.code AS uni_code',
				'univ.name AS uni_name',
			])
			.leftJoin('majors', 'hasil_utbk.major_id', 'majors.code')
			.leftJoin('univ', 'majors.university_code', 'univ.code')
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
					.leftJoin('majors', 'hasil_utbk.major_id', 'majors.code')
					.leftJoin('univ', 'majors.university_code', 'univ.code')
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

async function allUniversities(filter, paging) {
	return {
		records: await db('univ')
			.select('*')
			.where(_.pickBy(filter, filterColumns))
			.offset(paging.offset)
			.limit(paging.limit),
		metadata: {
			total_rows: (
				await db('univ')
					.count('* as count')
					.where(_.pickBy(filter, filterColumns))
					.first()
			).count,
		},
	};
}

async function allMajors(filter, paging) {
	return {
		records: await db('majors')
			.select('*')
			.where(_.pickBy(filter, filterColumns))
			.offset(paging.offset)
			.limit(paging.limit),
		metadata: {
			total_rows: (
				await db('majors')
					.count('* as count')
					.where(_.pickBy(filter, filterColumns))
					.first()
			).count,
		},
	};
}

module.exports = { allHasil, searchHasil, allUniversities, allMajors };
