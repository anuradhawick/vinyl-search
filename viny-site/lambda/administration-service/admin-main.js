'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const admin_functions = require('./admin-functions');
const _ = require('lodash');

const is_admin = (claims) => {
  return _.findIndex(claims['cognito:groups'], (group) => group === 'Admin') !== -1;
};

exports.main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new lambdaRouter.Router(event, context, callback);

  // TODO find a better way to do this
  if (!is_admin(event.requestContext.authorizer.claims)) {
    return callback(null, lambdaRouter.builResponse(403, 'Not an Admin'))
  }

  /**
   * get all admins
   */
  router.route(
    'GET',
    '/admin/admin-users',
    (event, context, callback) => {
      admin_functions.get_admin_users().then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          users: data,
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
   * get user
   */
  router.route(
    'GET',
    '/admin/users/{userUid}',
    (event, context, callback) => {
        admin_functions.get_user_by_uid(event.pathParameters.userUid).then((data) => {
          callback(null, lambdaRouter.builResponse(200, {
            ...data
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
   * remove admin
   */
  router.route(
    'DELETE',
    '/admin/admin-users/{userUid}',
    (event, context, callback) => {
      admin_functions.remove_admin(event.pathParameters.userUid).then(() => {
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
   * create admin
   */
  router.route(
    'POST',
    '/admin/admin-users/{userUid}',
    (event, context, callback) => {
      admin_functions.add_admin(event.pathParameters.userUid).then(() => {
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
