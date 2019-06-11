'use strict';
const lambdaRouter = require('../utils/lambda-router');
const forum_functions = require('./forum-functions');

exports.main = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const router = new lambdaRouter.Router(event, context, callback);

    /**
     * get post
     */
    router.route(
        'GET',
        '/forum/{postId}',
        (event, context, callback) => {
            forum_functions.retrieve_post(event.pathParameters.postId).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    post: data,
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
     * get posts
     */
    router.route(
        'GET',
        '/forum',
        (event, context, callback) => {
            forum_functions.retrieve_posts(event.queryStringParameters).then((data) => {
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
     * search posts
     */
    router.route(
        'GET',
        '/forum/search',
        (event, context, callback) => {
            forum_functions.search_posts(event.queryStringParameters).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    ...data,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    success: false
                }))
            });
        }
    );

    /**
     * save post
     */
    router.route(
        'POST',
        '/forum',
        (event, context, callback) => {
            console.log(event.requestContext.authorizer.claims)
            forum_functions.save_post(event.requestContext.authorizer.claims['sub'], event.body, null).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    postId: data,
                    success: true
                }))
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    success: false
                }))
            });
        }
    );

    /**
     * update post
     */
    router.route(
        'POST',
        '/forum/{postId}',
        (event, context, callback) => {
            forum_functions.save_post(event.requestContext.authorizer.claims['sub'], event.body, event.pathParameters.postId).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    postId: data,
                    success: true
                }));
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    success: false
                }));
            });
        }
    );

    /**
     * delete post
     */
    router.route(
        'DELETE',
        '/forum/{postId}',
        (event, context, callback) => {
            forum_functions.delete_post(event.requestContext.authorizer.claims['sub'], event.pathParameters.postId).then((data) => {
                callback(null, lambdaRouter.builResponse(200, {
                    success: true
                }));
            }).catch((e) => {
                console.error(e)
                callback(null, lambdaRouter.builResponse(500, {
                    success: false
                }));
            });
        }
    );
}