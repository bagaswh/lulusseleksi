const fs = require('fs');
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
	fs.createReadStream('../../public/index.html').pipe(res);
});

module.exports = router;
