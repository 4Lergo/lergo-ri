var controllers = require('../controllers');


exports.getTopTags = {
    'spec': {
        'path': '/tags/get/top',
        'summary': 'Get top tags',
        'method': 'GET'
    },
    'action': controllers.tags.getTopTags
};

exports.getTagByFilter = {
    'spec': {
        'path': '/tags/filter',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get tags by filter',
        'method': 'GET',
        'parameters'    : [{
            'paramType'  : 'query',
            'name'       : 'like',
            required     : true,
            'description': 'filter value',
            'type'       : 'string'
        }]
    },
    'action': controllers.tags.getTagsByFilter
};






