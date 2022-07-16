var express = require('express');
const logger = require('../config/winston');
var router = express.Router();
const fnftServiceModule = require('../modules/fnftServiceModule');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

const getSuccessJson = function(data) 
{
    return {
        success: true,
        data: data,
        message: ``
    };
};

const getErrorJson = function(error) {
    return {
        success: false,
        data: ``,
        message: error.message
    };
};

const createToken = async function(req, res) {
    try {
        console.log('req------->>',req.body);
        console.log('Inside createToken route');
        const serviceResponse = await fnftServiceModule.createToken(req.body);
        res.status(200).json(getSuccessJson(serviceResponse));
    } catch (error) {
        logger.error(`Exception occurred in method getTokenDetails: ${error.stack}`);
        res.status(500).json(getErrorJson(error));
    }
};

router.post('/createToken',createToken);
module.exports = router;
