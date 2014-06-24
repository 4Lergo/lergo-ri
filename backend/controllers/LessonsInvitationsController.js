var managers = require('../managers');

var _ = require('lodash');
var logger = require('log4js').getLogger('LessonsInvitationsController');

// finds a lesson owned by currently logged in user
function findLesson(req, res, next) {
    var lessonId = req.params.lessonId;
    logger.info('finding lesson', JSON.stringify(lessonId));
    managers.lessons.getLesson({ '_id': managers.db.id(lessonId)    , 'userId': req.user._id }, function (err, result) {
        if (!!err) {
            logger.error('unable to findLesson', err);
            err.send(res);
            return;
        } else {
            logger.info('putting lesson on request', result);
            req.lesson = result;
            next();
        }
    });
}


// find a lesson only by id -- use only when required.. prefer to use other methods.
function findAnyLesson( req, res, next ) {
    var lessonId = req.params.lessonId;
    managers.lessons.getLesson({'_id': managers.db.id(lessonId) }, function (err, result) {
        if (!!err) {
            logger.error('unable to find lesson', err);
            err.send(res);
        } else {
            req.lesson = result;
            next();
        }
    });
}

// verifies that the lesson is public
// guy - commenting for now because it is never used!
/*function findPublicLesson( req, res, next ){
    var lessonId = req.params.lessonId;
    managers.lessons.getLesson({'_id' : managers.db.id(lessonId), 'public' : {'$exists' : true } }, function( err, result ){
        if ( !!err ){
            logger.error('unable to find lesson', err);
            err.send(res);
        }else{
            req.lesson = result;
            next();
        }
    });
}*/


exports.create = function (req, res) {
    findAnyLesson(req, res, function () {
        logger.info('creating invitation for lesson', req.lesson);
        var invitation = req.body;

        if ( !invitation.invitee || !invitation.invitee.name ){
            new managers.error.InternalServerError(null, 'missing invitee').send(res);
            return;
        }
        var invitationObj = _.merge({'lessonId': req.lesson._id}, invitation );


        if (!!req.user) {  // add inviter in case we have details
            invitationObj.inviter = req.user._id;
        }
        managers.lessonsInvitations.create(invitationObj, function (err, result) {
            if (!!err) {
                logger.error('unable to create lesson invitation', err);
                err.send(res);
                return;
            } else {
                logger.info('sending invitation email');
                res.send(  result );
//                managers.lessonsInvitations.sendInvitationMail(req.emailResources, result, function( err ){
//                    if ( !!err ){
//                        logger.info('error while sending invitation');
//                        err.send(res);
//                        return;
//                    }
//                    res.send(result);
//                });

            }
        });
    });
};

exports.createAnonymous = function (req, res) {
    findAnyLesson(req, res, function () {
        logger.info('creating invitation for lesson', req.lesson);
        var invitation = { 'anonymous' : true, 'lessonId' : req.lesson._id };

        managers.lessonsInvitations.create(invitation, function (err, result) {
            if (!!err) {
                logger.error('unable to create lesson invitation', err);
                err.send(res);
                return;
            } else {
                res.send(result);
            }
        });
    });
};

exports.report = function( req, res ){
    managers.lessonsInvitations.updateReport( req.params.invitationId, req.body , function(err, result){
        if ( !!err ){
            err.send(res);
            return;
        }else{
            res.send(result);
        }
    });
};

exports.sendLessonInviteReportReady = function(req, res ){
    managers.lessonsInvitations.sendReportLink( req.emailResources, req.params.invitationId, function( err ){
        if ( !!err ){
            err.send(res);
            return;
        }

        res.send(200);

    });
};


exports.getReport = function( req, res ){
    managers.lessonsInvitations.getReport( req.params.invitationId, function( err, report ){
        if ( !!err ){
            err.send(res);
            return;
        }

        res.send(report);
    });
};


exports.list = function (req, res) {
    findLesson( req, res, function(){
        managers.lessonsInvitations.find({ 'lessonId': req.lesson._id }, function( err, result){
            if ( !!err ){
                logger.error('unable to find invitations',err );
                err.send(res);
                return;
            }else{
                res.send(result);
            }
        });
    });

};


/**
 * <p>
 * When we generate an invite, we simply save invitation details.<br/>
 * To start the lesson from the invitation, we first construct a copy of the lesson <br/>
 * </p>
 *
 * <p>
 * We use a copy because otherwise the report might be out of sync.<br/>
 * </p>
 *
 *
 *
 *
 * @param req
 * @param res
 */
exports.build = function( req, res ){
    var id = req.params.id;
    var construct = req.query.construct;
    var constructForce = req.query.constructForce;

    logger.info('building the invitation', id, construct, constructForce );
    managers.lessonsInvitations.find({'_id' : managers.db.id(id)}, {},  function ( err, result){
        if ( !!err ){
            err.send(res);
            return;
        }
        if ( ( !!constructForce ||  !result.lesson ) && construct  ){
            logger.info('constructing invitation');
            managers.lessonsInvitations.buildLesson( result, function( err, constructed ){
                if ( !!err ) {
                    logger.error('error while constructing lesson', err);
                    res.send(500);
                    return;
                }
                res.send(constructed);
            });
        }else{
            res.send(result);
        }

    });
};
