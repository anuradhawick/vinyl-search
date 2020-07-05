'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const admin_functions = require('./admin-functions');
const admin_market_functions = require('./admin-market-functions');
const _ = require('lodash');

const is_admin = (claims) => {
  if (claims['cognito:groups'] instanceof Array) {
    return _.findIndex(claims['cognito:groups'], (group) => group === 'Admin') !== -1;
  } else {
    return _.findIndex(claims['cognito:groups'].split(','), (group) => group === 'Admin') !== -1;
  }
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
    '/admin-users',
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
    '/users/{userUid}',
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
    '/admin-users/{userUid}',
    (event, context, callback) => {
      admin_functions.remove_admin(event.pathParameters.userUid).then((res) => {
        callback(null, lambdaRouter.builResponse(200, {
          success: res
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
    '/admin-users/{userUid}', // actually we are using email here ;)
    (event, context, callback) => {
      admin_functions.add_admin(event.pathParameters.userUid).then((res) => {
        callback(null, lambdaRouter.builResponse(200, {
          success: res
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
   * get all records
   */
  router.route(
    'GET',
    '/records',
    (event, context, callback) => {
      admin_functions.get_all_records(event.queryStringParameters).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
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

      admin_functions.delete_record(event.pathParameters.recordId).then((data) => {
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
   * get all forum posts
   */
  router.route(
    'GET',
    '/forum',
    (event, context, callback) => {
      admin_functions.get_all_forum_posts(event.queryStringParameters).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * delete forum post
   */
  router.route(
    'DELETE',
    '/forum/{postId}',
    (event, context, callback) => {
      admin_functions.delete_forum_post(event.pathParameters.postId).then((data) => {
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
   * get unresolved reports
   */
  router.route(
    'GET',
    '/reports',
    (event, context, callback) => {
      admin_functions.get_user_reports(event.queryStringParameters).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * resolve reports
   */
  router.route(
    'POST',
    '/reports/{reportId}',
    (event, context, callback) => {
      admin_functions.resolve_user_reports(event.pathParameters.reportId).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * get market posts
   */
  router.route(
    'GET',
    '/market',
    (event, context, callback) => {
      if (event.queryStringParameters.type === 'pending') {
        admin_market_functions.pending_market_posts(event.queryStringParameters).then((data) => {
          callback(null, lambdaRouter.builResponse(200, {
            ...data,
            success: true
          }))
        }).catch((e) => {
          console.error(e);
          callback(null, lambdaRouter.builResponse(500, {
            success: false
          }));
        });
      } else if (event.queryStringParameters.type === 'all') {
        admin_market_functions.all_market_posts(event.queryStringParameters).then((data) => {
          callback(null, lambdaRouter.builResponse(200, {
            ...data,
            success: true
          }))
        }).catch((e) => {
          console.error(e);
          callback(null, lambdaRouter.builResponse(500, {
            success: false
          }));
        });
      } else if (event.queryStringParameters.type === 'rejected-expired') {
        admin_market_functions.expired_and_rejected_posts(event.queryStringParameters).then((data) => {
          callback(null, lambdaRouter.builResponse(200, {
            ...data,
            success: true
          }))
        }).catch((e) => {
          console.error(e);
          callback(null, lambdaRouter.builResponse(500, {
            success: false
          }));
        });
      } else if (event.queryStringParameters.type === 'approved') {
        admin_market_functions.approved_posts(event.queryStringParameters).then((data) => {
          callback(null, lambdaRouter.builResponse(200, {
            ...data,
            success: true
          }))
        }).catch((e) => {
          console.error(e);
          callback(null, lambdaRouter.builResponse(500, {
            success: false
          }));
        });
      }
    }
  );

  /**
   * get market post by id
   */
  router.route(
    'GET',
    '/market/{postId}',
    (event, context, callback) => {
      admin_market_functions.get_market_post(event.pathParameters.postId).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          ...data,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * update market post by id
   */
  router.route(
    'POST',
    '/market/{postId}',
    (event, context, callback) => {
      admin_market_functions.update_market_post(event.requestContext.authorizer.claims['sub'],
      event.pathParameters.postId,
      event.body).then((postId) => {
        callback(null, lambdaRouter.builResponse(200, {
          postId,
          success: true
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

  /**
   * transit market post status
   */
  router.route(
    'POST',
    '/market',
    (event, context, callback) => {
      admin_market_functions.market_post_action(event.body).then((data) => {
        callback(null, lambdaRouter.builResponse(200, {
          success: data
        }))
      }).catch((e) => {
        console.error(e);
        callback(null, lambdaRouter.builResponse(500, {
          success: false
        }));
      });
    }
  );

};
