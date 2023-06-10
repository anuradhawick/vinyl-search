import { Router, builResponse } from './utils/lambda-router.js';
import * as record_functions from './records-functions.js';


export const main = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const router = new Router(event, context, callback);

  /**
   * search records
   */
  router.route(
    'GET',
    '/records/search',
    (event, context, callback) => {
      record_functions.search_records(event.queryStringParameters).then((data) => {
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
   * get records
   */
  router.route(
    'GET',
    '/records',
    (event, context, callback) => {
      record_functions.fetch_records(event.queryStringParameters).then((data) => {
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
   * get record
   */
  router.route(
    'GET',
    '/records/{recordId}',
    (event, context, callback) => {
      record_functions.fetch_record(event.pathParameters.recordId).then((data) => {
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
   * new record
   */
  router.route(
    'POST',
    '/records',
    (event, context, callback) => {
      record_functions.new_record(
        event.requestContext.authorizer.claims['sub'],
        event.body
      ).then((recordId) => {
        callback(null, builResponse(200, {
          ...recordId,
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
   * update record
   */
  router.route(
    'POST',
    '/records/{recordId}',
    (event, context, callback) => {
      record_functions.update_record(
        event.requestContext.authorizer.claims['sub'],
        event.pathParameters.recordId,
        event.body
      ).then((recordId) => {
        callback(null, builResponse(200, {
          recordId,
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
   * fetch record history
   */
  router.route(
    'GET',
    '/records/{recordId}/revisions',
    (event, context, callback) => {
      record_functions.fetch_history(
        event.pathParameters.recordId
      ).then((history) => {
        callback(null, builResponse(200, {
          history,
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
   * fetch record revision
   */
  router.route(
    'GET',
    '/records/{recordId}/revisions/{revisionId}',
    (event, context, callback) => {
      record_functions.fetch_revision(
        event.pathParameters.revisionId
      ).then((record) => {
        callback(null, builResponse(200, {
          ...record,
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
};
