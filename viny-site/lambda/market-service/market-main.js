'use strict';
const lambdaRouter = require('./../utils/lambda-router');
const selling_functions = require('./selling-functions');

exports.main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new lambdaRouter.Router(event, context, callback);

  // /**
  //  * search records
  //  */
  // router.route(
  //   'GET',
  //   '/market/search',
  //   (event, context, callback) => {
  //     record_functions.search_records(event.queryStringParameters).then((data) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         ...data,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e)
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //
  //   }
  // );
  //
  // /**
  //  * get records
  //  */
  // router.route(
  //   'GET',
  //   '/market',
  //   (event, context, callback) => {
  //     record_functions.fetch_records(event.queryStringParameters).then((data) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         ...data,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e)
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //
  //   }
  // );
  //
  // /**
  //  * get record
  //  */
  // router.route(
  //   'GET',
  //   '/market/{id}',
  //   (event, context, callback) => {
  //     record_functions.fetch_record(event.pathParameters.recordId).then((data) => {
  //       callback(null, lambdaRouter.builResponse(200, {
  //         ...data,
  //         success: true
  //       }))
  //     }).catch((e) => {
  //       console.error(e)
  //       callback(null, lambdaRouter.builResponse(500, {
  //         records: "ERROR",
  //         success: false
  //       }))
  //     });
  //
  //   }
  // );

  /**
   * new record
   */
  router.route(
    'POST',
    '/market',
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
  //   '/market/{id}',
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
