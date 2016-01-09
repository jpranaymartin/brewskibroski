// var controllers = require('./controllers');
var router = require('express').Router();

// returns a json
router.get('/', function(request, response) {
    res.json({
        'home': 'it'
    });
});

module.exports = router;
