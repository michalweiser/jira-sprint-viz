var express = require('express');
var app = express();
var JiraApi = require('jira').JiraApi;
var async = require('async');
var serveStatic = require('serve-static');
var serve = serveStatic('client');
var request = require('request');

var SPRINT_ID = "<sprint id>",
    config = {
        host: "jira.intgdc.com",
        port: null,
        user: '<freeipa.user>',
        password: '<freeipa.password>',
        strictSSL: false,
        verbose: true
    };

app.use(serve);

app.get('/avatar/:user', function(req, res) {
    var login = req.params.user;
    request.get({
        uri: 'https://jira.intgdc.com/secure/useravatar?ownerId=' + login,
        strictSSL: false,
        auth: {
            user: config.user,
            pass: config.password
        }
    }, function(error, response, body) {
        if (error) res.status(404).end();
    }).pipe(res);
});

app.get('/issues.json', function(req, res){
    getFullJiraJson(SPRINT_ID, function(err, data) {
        if (err) {
            res.status(400);
        } else {
            res.send(data);
        }
    });
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

var jira = new JiraApi('https', config.host, config.port, config.user, config.password, 'latest', config.verbose, config.strictSSL);

var getFullJiraJson = function(sprintId, callback) {
    // TODO add dates
    jira.searchJira('sprint='+SPRINT_ID, { maxResults: 100, fields: ['summary', 'status', 'resolution', 'issuetype', 'assignee', 'parent', 'update'] }, callback);
};

