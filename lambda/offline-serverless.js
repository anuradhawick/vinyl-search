#!/usr/bin/env node

const {spawn} = require('child_process');
const http = require('http');
const httpProxy = require('http-proxy');
const services = [
  {route: /^\/records/, path: 'records-management-service', port: 3001},
  {route: /^\/forum/, path: 'forum-management-service', port: 3002},
  {route: /^\/users/, path: 'user-management-service', port: 3003},
  {route: /^\/market/, path: 'market-service', port: 3004},
  {route: /^\/admin/, path: 'administration-service', port: 3005},
];

// Start `serverless offline` for each service
services.forEach(service => {
  const child = spawn('./node_modules/nodemon/bin/nodemon.js', ['--watch', service.path, '--exec', 'serverless', 'offline', 'start', '--stage', 'dev', '--noTimeout', '--httpPort', service.port, '--service', service.path, '----lambdaPort', 10 + service.port, '--noPrependStageInUrl'], {cwd: './'});
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', chunk => console.log(chunk));
  child.stderr.on('data', chunk => console.log(chunk));
  child.on('close', code => console.log(`child exited with code ${code}`));
});

// Start a proxy server on port 8080 forwarding based on url path
const proxy = httpProxy.createProxyServer({});
const server = http.createServer(function (req, res) {
  const service = services.find(per => req.url.match(per.route));
  // Case 1: matching service FOUND => forward request to the service
  if (service) {
    req.url = req.url.replace(service.route, '');
    console.log(req.url)
    proxy.web(req, res, {target: `http://localhost:${service.port}`});
  }
  // Case 2: matching service NOT found => display available routes
  else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(`Url path "${req.url}" does not match routes defined in services\n\n`);
    res.write(`Available routes are:\n`);
    services.map(service => res.write(`- ${service.route}\n`));
    res.end();
  }
});

server.listen(8080);
