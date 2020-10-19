"use strict";

var express = require('express');

var fetch = require('node-fetch');

var redis = require('redis');

var PORT = process.env.PORT || 5000;
var REDIS_PORT = process.env.PORT || 6379;
var client = redis.createClient(REDIS_PORT);
var app = express(); //set response

function setResponse(username, repos) {
  return "<h2>".concat(username, " has ").concat(repos, " Githup repos</h2>");
} //make request to githup for data


function getRepos(req, res, next) {
  var username, response, data, repos;
  return regeneratorRuntime.async(function getRepos$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          console.log('Fetching data ....');
          username = req.params.username;
          _context.next = 5;
          return regeneratorRuntime.awrap(fetch("https://api.github.com/users/".concat(username)));

        case 5:
          response = _context.sent;
          _context.next = 8;
          return regeneratorRuntime.awrap(response.json());

        case 8:
          data = _context.sent;
          repos = data.public_repos; //set dat to redis

          client.setex(username, 3600, repos);
          res.send(setResponse(username, repos));
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](0);
          console.error(_context.t0);
          res.status(500);

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 14]]);
} // cache middleware


function cache(req, res, next) {
  var username = req.params.username;
  client.get(username, function (err, data) {
    if (err) throw err;

    if (data !== null) {
      res.send(setResponse(username, data));
    } else {
      next();
    }
  });
}

app.get('/repos/:username', cache, getRepos);
app.listen(5000, function () {
  console.log("app listen on port ".concat(PORT));
});