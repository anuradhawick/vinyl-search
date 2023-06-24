import { Router, builResponse } from './utils/lambda-router.js';
import * as selling_functions from './selling-functions.js';


export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new Router(event, context, callback);

  /**
   * search posts
   */
  router.route(
    'GET',
    '/market/search',
    (event, context, callback) => {
      selling_functions.search_posts(event.queryStringParameters).then((data) => {
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
   * get posts
   */
  router.route(
    'GET',
    '/market',
    (event, context, callback) => {
      selling_functions.fetch_posts(event.queryStringParameters).then((data) => {
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
   * get post
   */
  router.route(
    'GET',
    '/market/{postId}',
    (event, context, callback) => {
      selling_functions.fetch_post(event.pathParameters.postId).then((data) => {
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
   * update post
   */
  router.route(
    'POST',
    '/market/{postId}',
    (event, context, callback) => {
      selling_functions.update_post(
        event.requestContext.authorizer.claims['custom:uid'],
        event.pathParameters.postId,
        event.body).then((data) => {
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
   * new post
   */
  router.route(
    'POST',
    '/market',
    (event, context, callback) => {
      selling_functions.new_sell(
        event.requestContext.authorizer.claims['custom:uid'],
        event.body
      ).then((id) => {
        callback(null, builResponse(200, {
          ...id,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, builResponse(500, {
          records: "ERROR",
          success: false
        }))
      });
    }
  );

  /**
   * report add
   */
  router.route(
    'POST',
    '/market/{postId}/report',
    (event, context, callback) => {
      selling_functions.report_marketplace_ad(
        event.requestContext.authorizer.claims['custom:uid'],
        event.pathParameters.postId,
        event.body
      ).then((id) => {
        callback(null, builResponse(200, {
          ...id,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, builResponse(500, {
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
  //       event.requestContext.authorizer.claims['custom:uid'],
  //       event.pathParameters.recordId,
  //       event.body
  //     ).then((recordId) => {
  //       callback(null, builResponse(200, {
  //         recordId,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e)
  //       callback(null, builResponse(500, {
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
  //       callback(null, builResponse(200, {
  //         history,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e);
  //       callback(null, builResponse(500, {
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
  //       callback(null, builResponse(200, {
  //         ...record,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e);
  //       callback(null, builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //   }
  // );
};
