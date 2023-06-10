import { Router, builResponse } from './utils/lambda-router.js';
import * as user_functions from './user-functions.js';

export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new Router(event, context, callback);

  /**
   * fetch user
   */
  router.route(
    'GET',
    '/users',
    (event, context, callback) => {
      user_functions.get_user(event.requestContext.authorizer.claims['sub'])
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * update user
   */
  router.route(
    'POST',
    '/users',
    (event, context, callback) => {
      user_functions.update_user(event.requestContext.authorizer.claims['sub'], event.body)
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * get user records
   */
  router.route(
    'GET',
    '/users/records',
    (event, context, callback) => {
      user_functions.get_user_records(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * get user forum posts
   */
  router.route(
    'GET',
    '/users/forum',
    (event, context, callback) => {
      user_functions.get_user_forum_posts(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * get user market posts
   */
  router.route(
    'GET',
    '/users/market',
    (event, context, callback) => {
      user_functions.get_user_market_posts(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * mark selling item as sold
   */
  router.route(
    'POST',
    '/users/market/{postId}/sold',
    (event, context, callback) => {
      user_functions.mark_selling_item_as_sold(event.requestContext.authorizer.claims['sub'], event.pathParameters.postId)
        .then((user) => {
          callback(null, builResponse(200, {
            ...user,
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
   * delete record
   */
  router.route(
    'DELETE',
    '/users/records/{recordId}',
    (event, context, callback) => {

      user_functions.delete_record(event.requestContext.authorizer.claims['sub'], event.pathParameters.recordId).then((data) => {
        callback(null, builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e);
        callback(null, builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * delete ad
   */
  router.route(
    'DELETE',
    '/users/market/{postID}',
    (event, context, callback) => {

      user_functions.delete_marketplace_ad(event.requestContext.authorizer.claims['sub'], event.pathParameters.postID).then((data) => {
        callback(null, builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e);
        callback(null, builResponse(500, {
          success: false
        }));
      });
    }
  );
};
