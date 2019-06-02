'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const record_functions = require('./records-functions');

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const router = new lambdaRouter.Router(event, context, callback);

    /**
     * search records
     */
    router.route(
        'GET',
        '/records/search',
        (event, context, callback) => {
            record_functions.search_records(event.queryStringParameters).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    ...data,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    records: "ERROR",
                    success: false
                }))
            });

        }
    );

    /**
     * get records
     */
    router.route(
        'GET',
        '/records',
        (event, context, callback) => {
            record_functions.fetch_records(event.queryStringParameters).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    ...data,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    records: "ERROR",
                    success: false
                }))
            });

        }
    );

    /**
     * get record
     */
    router.route(
        'GET',
        '/records/{recordId}',
        (event, context, callback) => {
            record_functions.fetch_record(event.pathParameters.recordId).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    ...data,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    records: "ERROR",
                    success: false
                }))
            });

        }
    );

    /**
     * new record
     */
    router.route(
        'POST',
        '/records',
        (event, context, callback) => {
            record_functions.new_record(event.requestContext.authorizer.claims['sub'], event.body).then((recordId) => {
                callback(null, lambdaRouter.builResponse(200, {
                    recordId,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    records: "ERROR",
                    success: false
                }))
            });
        }
    );
}
