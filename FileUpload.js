#!/usr/bin/env node
"use strict";
var util = require('util');
var events = require('events');
var https = require('https');
var program = require('commander');
var validator = require('validator');
var fs = require('fs');

var debug = true;

function debugLog(log){
  if (debug === true){
    console.log(log);
  }
}

function FileUpload(hostIP, path)
{
    if (!(this instanceof FileUpload)){
        return new FileUpload(hostIP, path);
    }

    this.options = 
    {
        host: hostIP,
        port: 443,
        method: 'POST',
        path: '/mgmt/shared/authn/login',
        rejectUnauthorized: false,
        headers: 
        {
            'Content-Type': 'application/json',
        }    
    }

    this.data = 
    {
        username:"mrajagopal",
        password:"changeme1234",
        loginProviderName:"tmos"
    }

    this.path = path;
    this.token = {};
    events.EventEmitter.call(this);
    this.httpReqTimeoutValueInMs = 5000;
}


// extent the FileUpload object using EventEmitter
util.inherits(FileUpload, events.EventEmitter);

FileUpload.prototype._emitError = function _emitError(e)
{
    debugLog(e);
    this.emit('error', e);
};

FileUpload.prototype.getToken = function getToken()
{
    debugLog(this.options);
    debugLog(this.data);
    var req = https.request(this.options, this.tokenResp.bind(this));
    req.setTimeout(this.httpReqTimeoutValueInMs, function()
        {
            req.abort();
        });
    req.write(JSON.stringify(this.data));
    req.end();
    req.on('error', this._emitError.bind(this));
}

FileUpload.prototype.readFileChunk = function readFileChunk()
{
    var fs = require('fs');
    var stream = fs.createReadStream(filename);
    fs.stat(filename, function(error, stat) 
    {
        if (error) 
        {
            throw error; 
        }
    });
}

FileUpload.prototype.upload = function upload(filename)
{
    var fs = require('fs');
    var stream = fs.createReadStream(filename);
    
    this.options =
    {
        host: program.ip,
        port: 443,
        method: 'POST',
        path: '/mgmt/shared/file-transfer/uploads/' + filename,
        rejectUnauthorized: false,
    }

    var chunkSize = 64 * 1024;
    var self = this;
    fs.stat(filename, function(error, stat) {
        if (error) { throw error; }
        self.options.headers = 
        {
            'X-F5-Auth-Token': self.token.token,
            'Content-Type' : 'text/plain',
            'Content-Range' : '0-'+ (stat.size-1)+'/'+stat.size
        }

        // do your piping here
        // if(stat.size > chunkSize)
        // {
        //     uploadOptions.headers['Content-Range'] = '0-'+ (chunkSize-1)+'/'+stat.size;
        // }
        // else
        // {
        //     uploadOptions.headers['Content-Range'] = '0-'+ (stat.size-1)+'/'+stat.size;
        // }
        // uploadOptions.headers['Content-Range'] = '0-'+ (stat.size-1)+'/'+stat.size;
        console.log(self.options);

        var uploadReq = https.request(self.options, self.uploadResp);

        stream.on('data', function(data) 
        {
            console.log('writing stream data: ', data.length);// : ', data.size());
            // var uploadReq = https.request(uploadOptions, function(resp)
            uploadReq.write(data);
        });

        stream.on('end', function() 
        {
            console.log('End of stream data');
            uploadReq.end();
        });
    });     
}

FileUpload.prototype.tokenResp = function tokenResp(resp)
{
    var self = this;
    resp.on('data', function(body)
    {
        debugLog('Processing token response');
        if (resp.statusCode == 200)
        {
            var respBody = JSON.parse(body);
            self.token = respBody.token;
            console.log('Acquired Token is: ', respBody.token.token);
            self.upload('myfile.txt');
        }
        else
        {
            console.log('statusCode', resp.statusCode);
            console.log(JSON.parse(body));
        }
    });

    resp.on('error', function(e)
    {
        console.error(e);
    });
}

FileUpload.prototype.uploadChunkResp = function uploadChunkResp(resp)
{
    resp.on('data', function(body)
    {
        if(resp.statusCode == 200)
        {
            console.log('Response: 200 OK');

            // stream.on('data', function(data) {
            //   console.log('more data from readstream');
            //   uploadReq.write(data);
            // });

            // stream.on('end', function() {
            //   console.log('Final End of stream data');
            //   uploadReq.end();
            // });
            // uploadReq.end();
            uploadReq.end();
        }
        else
        {
            console.log('statusCode: ', resp.statusCode);
            console.log(JSON.parse(body));
            // uploadReq.end();
        }
    });

    resp.on('error', function(error)
    {
        console.error('error: ' + error);
        // uploadReq.end();
    });
}

FileUpload.prototype.uploadResp = function uploadResp(resp)
{
    resp.on('data', function(body)
    {
        if(resp.statusCode == 200)
        {
            console.log('Response: 200 OK');

            // stream.on('data', function(data) {
            //   console.log('more data from readstream');
            //   uploadReq.write(data);
            // });

            // stream.on('end', function() {
            //   console.log('Final End of stream data');
            //   uploadReq.end();
            // });
            // uploadReq.end();
        }
        else
        {
            console.log('statusCode: ', resp.statusCode);
            console.log(JSON.parse(body));
        }
    });

    resp.on('error', function(error)
    {
        console.error('error: ' + error);
    });
}

program.version('0.0.1');
program.description('Command line tool iControlREST using Node.js');
program.option('--verbosity', 'Enable verbose logging');
program.option('--ip <BIG-IP Address>', 'Hostname to analyze');
program.parse(process.argv);

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
/////////////////////////////////////

if (!process.argv.slice(2).length){
    console.log('Too few arguments');
    program.help();
    process.exit(0);
}

if(program.ip && !validator.isIP(program.ip, 4))
{
  console.log('  Error: invalid IPv4 string');
  program.help();
  process.exit(0);
}

var fileUpload = FileUpload(program.ip, 'myfile.txt' );
fileUpload.getToken();