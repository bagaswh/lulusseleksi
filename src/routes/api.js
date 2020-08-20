const fs = require('fs');
const express = require('express');
const middleware = require('../middleware/middleware');
const { all, search } = require('../database/queries');

const router = express.Router();
router.use(middleware.paging);

router.get('/data', async (req, res) => {
	return res.json(await all(req.query, res.locals.page));
});

router.get('/data/search', async (req, res) => {
	const { q, exact } = req.query;
	return res.json(await search(q, req.query, res.locals.page, { exact }));
});

module.exports = router;
