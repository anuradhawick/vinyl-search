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
    '/{postId}',
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
   * get post comments
   */
  router.route(
    'GET',
    '/{postId}/comments',
    (event, context, callback) => {
      forum_functions.retrieve_post_comments(event.pathParameters.postId).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          comments: data,
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
    '/',
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
    '/search',
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
    '/',
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
    '/{postId}',
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
   * comment post
   */
  router.route(
    'POST',
    '/{postId}/comments',
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
    '/{postId}',
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

  /**
   * delete comment on a post
   */
  router.route(
    'DELETE',
    '/{postId}/comments/{commentId}',
    (event, context, callback) => {
      forum_functions.delete_post(event.requestContext.authorizer.claims['sub'], event.pathParameters.commentId).then((data) => {
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
};
