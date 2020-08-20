const fs = require('fs');
const express = require('express');
const middleware = require('../middleware/middleware');
const {
	allHasil,
	searchHasil,
	allUniversities,
	allMajors,
} = require('../database/queries');

const router = express.Router();
router.use(middleware.paging);

router.get('/hasil', async (req, res) => {
	return res.json(await allHasil(req.query, res.locals.page));
});

router.get('/hasil/search', async (req, res) => {
	const { q, exact } = req.query;
	return res.json(await searchHasil(q, req.query, res.locals.page, { exact }));
});

router.get('/universities', async (req, res) => {
	return res.json(await allUniversities(req.query, res.locals.page));
});

router.get('/majors', async (req, res) => {
	return res.json(await allMajors(req.query, res.locals.page));
});

module.exports = router;
