export function Router(event, context, callback) {
  console.log("EVENT RECEIVED", event);
  this.path = event.resource;
  this.method = event.httpMethod;
  this.callback = callback;

  this.route = function (method, path, handler) {
    if (this.method === method && this.path === path) {
      try {
        if (method !== "GET") {
          event.body = JSON.parse(event.body);
        }
        handler(event, context, callback);
      } catch (e) {
        console.log(e);
        this.callback(null, build_response(500, "Data Error"));
      }
    }
  };
}

export function build_response(statusCode, body) {
  return {
    statusCode,
    body: JSON.stringify(body),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}
