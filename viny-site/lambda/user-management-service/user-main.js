'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const user_functions = require('./user-functions');
const _ = require('lodash');

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const router = new lambdaRouter.Router(event, context, callback);

    /**
     * fetch user
     */
    router.route(
        'GET',
        '/users',
        (event, context, callback) => {
            user_functions.get_user(event.requestContext.authorizer.claims['sub'])
              .then((user) => {
                callback(null, lambdaRouter.builResponse(200, {
                    ...user,
                  success: true
                }))
              }).catch((e) => {
              console.error(e);
              callback(null, lambdaRouter.builResponse(500, {
                records: "ERROR",
                success: false
              }))
            });
        }
    );

    /**
     * update user
     */
    router.route(
        'POST',
        '/users',
        (event, context, callback) => {


        }
    );
};
