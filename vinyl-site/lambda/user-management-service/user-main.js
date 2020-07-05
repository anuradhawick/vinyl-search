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
    '/',
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
    '/',
    (event, context, callback) => {
      user_functions.update_user(event.requestContext.authorizer.claims['sub'], event.body)
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
   * get user records
   */
  router.route(
    'GET',
    '/records',
    (event, context, callback) => {
      user_functions.get_user_records(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
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
   * get user forum posts
   */
  router.route(
    'GET',
    '/forum',
    (event, context, callback) => {
      user_functions.get_user_forum_posts(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
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
   * get user market posts
   */
  router.route(
    'GET',
    '/market',
    (event, context, callback) => {
      user_functions.get_user_market_posts(event.requestContext.authorizer.claims['sub'], event.queryStringParameters)
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
   * mark selling item as sold
   */
  router.route(
    'POST',
    '/market/{postId}/sold',
    (event, context, callback) => {
      user_functions.mark_selling_item_as_sold(event.requestContext.authorizer.claims['sub'], event.pathParameters.postId)
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
   * delete record
   */
  router.route(
    'DELETE',
    '/records/{recordId}',
    (event, context, callback) => {

      user_functions.delete_record(event.requestContext.authorizer.claims['sub'], event.pathParameters.recordId).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
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
    '/market/{postID}',
    (event, context, callback) => {

      user_functions.delete_marketplace_ad(event.requestContext.authorizer.claims['sub'], event.pathParameters.postID).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          success: true
        }));
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );
};
