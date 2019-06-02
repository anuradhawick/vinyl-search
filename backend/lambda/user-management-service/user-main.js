'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const user_functions = require('./user-functions');

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const router = new lambdaRouter.Router(event, context, callback);

    /**
     * update user
     */
    router.route(
        'POST',
        '/users',
        (event, context, callback) => {
            console.log(event.requestContext.authorizer.claims['sub'])
            user_functions.update_user(event.requestContext.authorizer.claims['sub'], event.body).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    success: true
                  }));
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    records: "ERROR",
                    success: false
                  }));
            });
            
        }
    );
}