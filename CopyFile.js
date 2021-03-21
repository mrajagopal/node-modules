#!/usr/bin/env node
"use strict";

const https = require('https');
var program = require('commander');
var validator = require('validator');
var fs = require('fs');

var iControlRESTUrl = '/mgmt/shared/authn/login';
var iControlRESTUploadUrl = '/mgmt/shared/file-transfer/uploads/';
var basicAuth = 'admin:changeme';
var tokenResp;

program.version('0.0.1');
program.description('Command line tool iControlREST using Node.js');
program.option('--verbosity', 'Enable verbose logging');
program.option('--ip <BIG-IP Address>', 'Hostname to analyze');
program.option('--filename <path to filename>', 'Name of file to upload');
program.option('--basicAuth', 'Use basic auth instead of token auth');
program.parse(process.argv);

// print process.argv
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});
/////////////////////////////////////

if (!process.argv.slice(3).length){
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

if(!program.filename)
{
    console.log('No filename specified for upload');
    program.help();
    process.exit(0);
}



var options =
{
    host: program.ip,
    port: 443,
    method: 'POST',
    path: iControlRESTUrl,
    rejectUnauthorized: false,
    headers: 
    {
        'Content-Type': 'application/json',
    }
};

var data = 
{
    username:"admin",
    password:"changeme",
    loginProviderName:"tmos"
};

function getTokenResponse(resp)
{
    // console.log(resp.statusCode);

    resp.on('data', function(body)
    {
        if (resp.statusCode == 200)
        {
            tokenResp = JSON.parse(body);
            console.log('Acquired Token is: ', tokenResp.token.token);
            uploadFile(program.filename);
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

function getToken()
{
    return tokenResp.token.token;
}

function uploadResp(resp)
{
    resp.on('data', function(body)
    {
        console.log(JSON.parse(body));
        uploadFile(program.filename);
    });

    resp.on('error', function(e)
    {
        console.error(e);
    });
}

function processUploadResp(resp)
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

function uploadFile(filename)
{
    var fs = require('fs');
    var stream = fs.createReadStream(filename);
    
    var uploadOptions =
    {
        host: program.ip,
        port: 443,
        method: 'POST',
        path: iControlRESTUploadUrl + filename,
        rejectUnauthorized: false,
    }
    
    if (program.basicAuth)
    {
        uploadOptions.auth = basicAuth;
    }

    var chunkSize = 64 * 1024;
    fs.stat(filename, function(error, stat) {
        if (error) { throw error; }
        uploadOptions.headers = 
        {
            'Content-Type' : 'text/plain',
            'Content-Range' : '0-'+ (stat.size-1)+'/'+stat.size
        }
        
        if (program.basicAuth)
        {
//            delete uploadOptions.headers['X-F5-Auth-Token'];
            uploadOptions.headers['Authorization'] = 'Basic ' + new Buffer('admin' + ':' + 'changeme').toString('base64');
        }
        else
        {
            uploadOptions.headers['X-F5-Auth-Token'] = getToken();
        }

        console.log(uploadOptions);
        var uploadReq = https.request(uploadOptions, processUploadResp);

        stream.on('data', function(data) {
            console.log('writing stream data: ', data.length);
            uploadReq.write(data);
        });

        stream.on('end', function() {
            console.log('End of stream data');
            uploadReq.end();
        });
    });     
}

if(program.basicAuth)
{
    var uploadOptions = {}
//    {
//        host: program.ip,
//        port: 443,
//        method: 'POST'
//    }
    uploadOptions.auth = basicAuth;
    uploadOptions.headers =
    {
        'X-F5-Auth-Token': 'ASDSDGDFSH',
        'Content-Type' : 'text/plain',
        'Content-Range' : '0'
    }
    
    console.log(uploadOptions);
    delete uploadOptions.headers['X-F5-Auth-Token'];
    uploadOptions.headers['Authorization'] = 'Basic ' + new Buffer('admin' + ':' + 'changeme').toString('base64');
    console.log(uploadOptions);
    
    console.log('****** Using Basic Auth *****');
    uploadFile(program.filename);
}
else
{
    var req = https.request(options, getTokenResponse);
    console.log(data);
    req.write(JSON.stringify(data));
    req.end();

    req.on('error', function(e)
    {
        console.error(e);
    });
}
