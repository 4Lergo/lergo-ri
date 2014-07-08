'use strict';

var logger = require('log4js').getLogger('ErrorManager');
logger.info('initializing ErrorManager');

function createSendFn( err ){
    return function(res){
        res.send( err.responseCode, JSON.stringify(err) );
    };
}


function createNewError( code, message, responseCode ){
    return function( e, description ){
//        debugger;
        this.code = code;
        this.message = message;
        this.responseCode = responseCode;
        this.cause = e;
        this.description = description;
        this.send = createSendFn( this );
    };
}

var errorsDefinition = {
    'InvalidUsername' : createNewError(1,'invalid username',500),
    'InternalServerError' : createNewError(2, 'unknown error', 500),
    'NotLoggedIn' : createNewError(3, 'not logged in', 401),
    'NotAdmin' : createNewError(4, 'requires admin permissions', 401),
    'WrongLogin' : createNewError(5, 'wrong login', 401),
    'InvalidEmail': createNewError(6, 'invalid email', 500),
    'UserNotValidated' : createNewError(7, 'user not validated', 500),
    'UserValidationError' : createNewError( 8, 'unable to validate user', 500),
    'UserValidationFailed' : createNewError(9, 'user validation failed', 401),
    'UserAlreadyValidated' : createNewError(10, 'user already validated', 500),
    'ErrorSendingValidationEmail' : createNewError(11, 'unable to send validation email', 500),
    'NotFound' : createNewError(12, 'resource not found', 404),
    'UsernameAlreadyExists' : createNewError( 13, 'username already exists', 500 )
};


for ( var errDefinition in errorsDefinition ){
    if ( errorsDefinition.hasOwnProperty(errDefinition)){
        module.exports[errDefinition] = errorsDefinition[errDefinition];
    }
}



