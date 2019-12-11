'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const selling_functions = require('./selling-functions');

exports.main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new lambdaRouter.Router(event, context, callback);

  /**
   * search posts
   */
  router.route(
    'GET',
    '/search',
    (event, context, callback) => {
      selling_functions.search_posts(event.queryStringParameters).then((data) => {
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
   * get posts
   */
  router.route(
    'GET',
    '/',
    (event, context, callback) => {
      selling_functions.fetch_posts(event.queryStringParameters).then((data) => {
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
   * get post
   */
  router.route(
    'GET',
    '/{postId}',
    (event, context, callback) => {
      selling_functions.fetch_post(event.pathParameters.postId).then((data) => {
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
   * new post
   */
  router.route(
    'POST',
    '/',
    (event, context, callback) => {
      selling_functions.new_sell(
        event.requestContext.authorizer.claims['sub'],
        event.body
      ).then((id) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...id,
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

  // /**
  //  * update record
  //  */
  // router.route(
  //   'POST',
  //   '/{id}',
  //   (event, context, callback) => {
  //     record_functions.update_record(
  //       event.requestContext.authorizer.claims['sub'],
  //       event.pathParameters.recordId,
  //       event.body
  //     ).then((recordId) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         recordId,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e)
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //   }
  // );

  // /**
  //  * fetch record history
  //  */
  // router.route(
  //   'GET',
  //   '/records/{recordId}/revisions',
  //   (event, context, callback) => {
  //     record_functions.fetch_history(
  //       event.pathParameters.recordId
  //     ).then((history) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         history,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e);
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //   }
  // );
  //
  // /**
  //  * fetch record revision
  //  */
  // router.route(
  //   'GET',
  //   '/records/{recordId}/revisions/{revisionId}',
  //   (event, context, callback) => {
  //     record_functions.fetch_revision(
  //       event.pathParameters.revisionId
  //     ).then((record) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         ...record,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e);
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //   }
  // );
};
