import { build_response } from "./utils/lambda-router.js";
import { ProxyRouter } from "./utils/lambda-proxy-router.js";
import * as admin_functions from "./admin-functions";
import * as admin_market_functions from "./admin-market-functions";
import * as user_functions from "./user-functions";
import _ from "lodash";

const is_admin = (claims) => {
  if (claims["cognito:groups"] instanceof Array) {
    return (
      _.findIndex(claims["cognito:groups"], (group) => group === "Admin") !== -1
    );
  } else {
    return (
      _.findIndex(
        claims["cognito:groups"].split(","),
        (group) => group === "Admin"
      ) !== -1
    );
  }
};

export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new ProxyRouter(event, context, callback);

  // TODO find a better way to do this
  if (!is_admin(event.requestContext.authorizer.claims)) {
    return callback(null, build_response(403, "Not an Admin"));
  }

  // Users related

  /**
   * get users
   */
  router.route("GET", "users", (event, context, callback) => {
    user_functions
      .get_users(event.queryStringParameters)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * get user
   */
  router.route("GET", "users/{userUid}", (event, context, callback) => {
    user_functions
      .get_user_by_uid(event.pathParameters.userUid)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  // Admins related

  /**
   * get all admins
   */
  router.route("GET", "admin-users", (event, context, callback) => {
    admin_functions
      .get_admin_users()
      .then((data) => {
        callback(
          null,
          build_response(200, {
            users: data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * remove admin
   */
  router.route(
    "DELETE",
    "admin-users/{userUid}",
    (event, context, callback) => {
      admin_functions
        .remove_admin(event.pathParameters.userUid)
        .then((res) => {
          callback(
            null,
            build_response(200, {
              success: res,
            })
          );
        })
        .catch((e) => {
          console.error(e);
          callback(
            null,
            build_response(500, {
              success: false,
            })
          );
        });
    }
  );

  /**
   * create admin
   */
  router.route("POST", "admin-users/{email}", (event, context, callback) => {
    admin_functions
      .add_admin(event.pathParameters.email)
      .then((res) => {
        callback(
          null,
          build_response(200, {
            success: res,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  // Records related

  /**
   * get all records
   */
  router.route("GET", "records", (event, context, callback) => {
    admin_functions
      .get_all_records(event.queryStringParameters)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * delete record
   */
  router.route("DELETE", "records/{recordId}", (event, context, callback) => {
    admin_functions
      .delete_record(event.pathParameters.recordId)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  // Forum related

  /**
   * get all forum posts
   */
  router.route("GET", "forum", (event, context, callback) => {
    admin_functions
      .get_all_forum_posts(event.queryStringParameters)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * delete forum post
   */
  router.route("DELETE", "forum/{postId}", (event, context, callback) => {
    admin_functions
      .delete_forum_post(event.pathParameters.postId)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  // Reports related

  /**
   * get unresolved reports
   */
  router.route("GET", "reports", (event, context, callback) => {
    admin_functions
      .get_user_reports(event.queryStringParameters)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * resolve reports
   */
  router.route("POST", "reports/{reportId}", (event, context, callback) => {
    admin_functions
      .resolve_user_reports(event.pathParameters.reportId)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  // Market related

  /**
   * get market posts
   */
  router.route("GET", "market", (event, context, callback) => {
    if (event.queryStringParameters.type === "pending") {
      admin_market_functions
        .pending_market_posts(event.queryStringParameters)
        .then((data) => {
          callback(
            null,
            build_response(200, {
              ...data,
              success: true,
            })
          );
        })
        .catch((e) => {
          console.error(e);
          callback(
            null,
            build_response(500, {
              success: false,
            })
          );
        });
    } else if (event.queryStringParameters.type === "all") {
      admin_market_functions
        .all_market_posts(event.queryStringParameters)
        .then((data) => {
          callback(
            null,
            build_response(200, {
              ...data,
              success: true,
            })
          );
        })
        .catch((e) => {
          console.error(e);
          callback(
            null,
            build_response(500, {
              success: false,
            })
          );
        });
    } else if (event.queryStringParameters.type === "rejected-expired") {
      admin_market_functions
        .expired_and_rejected_posts(event.queryStringParameters)
        .then((data) => {
          callback(
            null,
            build_response(200, {
              ...data,
              success: true,
            })
          );
        })
        .catch((e) => {
          console.error(e);
          callback(
            null,
            build_response(500, {
              success: false,
            })
          );
        });
    } else if (event.queryStringParameters.type === "approved") {
      admin_market_functions
        .approved_posts(event.queryStringParameters)
        .then((data) => {
          callback(
            null,
            build_response(200, {
              ...data,
              success: true,
            })
          );
        })
        .catch((e) => {
          console.error(e);
          callback(
            null,
            build_response(500, {
              success: false,
            })
          );
        });
    }
  });

  /**
   * get market post by id
   */
  router.route("GET", "market/{postId}", (event, context, callback) => {
    admin_market_functions
      .get_market_post(event.pathParameters.postId)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            ...data,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * update market post by id
   */
  router.route("POST", "market/{postId}", (event, context, callback) => {
    admin_market_functions
      .update_market_post(
        event.requestContext.authorizer.claims["custom:uid"],
        event.pathParameters.postId,
        event.body
      )
      .then((postId) => {
        callback(
          null,
          build_response(200, {
            postId,
            success: true,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });

  /**
   * transit market post status
   */
  router.route("POST", "market", (event, context, callback) => {
    admin_market_functions
      .market_post_action(event.body)
      .then((data) => {
        callback(
          null,
          build_response(200, {
            success: data,
          })
        );
      })
      .catch((e) => {
        console.error(e);
        callback(
          null,
          build_response(500, {
            success: false,
          })
        );
      });
  });
};
