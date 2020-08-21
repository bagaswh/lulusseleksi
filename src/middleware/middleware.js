function paging(req, res, next) {
	const data = res.locals.page || {};

	const { page: _page = 1, page_size: _page_size = 10 } = Object.assign(
		{},
		req.body,
		req.query
	);
	const page = Math.max(_page, 1);
	const pageSize = Math.max(0, Math.min(_page_size, 300));

	data.offset = page * pageSize - (pageSize - 1) - 1;
	data.limit = pageSize;
	res.locals.page = data;

	return next();
}

function parseQsArray(req, res, next) {}

module.exports = { paging };
