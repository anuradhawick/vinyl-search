import { Router, builResponse } from './utils/lambda-router.js';
import * as forum_functions from './forum-functions.js';


export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new Router(event, context, callback);

  /**
   * get post
   */
  router.route(
    'GET',
    '/forum/{postId}',
    (event, context, callback) => {
      forum_functions.retrieve_post(event.pathParameters.postId).then((data) => {
        callback(null, builResponse(200, {
          post: data,
          success: true
        }))
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
    '/forum/{postId}/comments',
    (event, context, callback) => {
      forum_functions.retrieve_post_comments(event.pathParameters.postId).then((data) => {
        callback(null, builResponse(200, {
          comments: data,
          success: true
        }))
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
        callback(null, builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
        callback(null, builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
      forum_functions.save_post(event.requestContext.authorizer.claims['custom:uid'], event.body, null).then((data) => {
        callback(null, builResponse(200, {
          postId: data,
          success: true
        }))
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
      forum_functions.save_post(event.requestContext.authorizer.claims['custom:uid'], event.body, event.pathParameters.postId).then((data) => {
        callback(null, builResponse(200, {
          postId: data,
          success: true
        }));
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
    '/forum/{postId}/comments',
    (event, context, callback) => {
      forum_functions.save_post(event.requestContext.authorizer.claims['custom:uid'], event.body, event.pathParameters.postId).then((data) => {
        callback(null, builResponse(200, {
          postId: data,
          success: true
        }));
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
      forum_functions.delete_post(event.requestContext.authorizer.claims['custom:uid'], event.pathParameters.postId).then((data) => {
        callback(null, builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
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
    '/forum/{postId}/comments/{commentId}',
    (event, context, callback) => {
      forum_functions.delete_post(event.requestContext.authorizer.claims['custom:uid'], event.pathParameters.commentId).then((data) => {
        callback(null, builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e)
        callback(null, builResponse(500, {
          success: false
        }));
      });
    }
  );
};
