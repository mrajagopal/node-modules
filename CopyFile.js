#!/usr/bin/env node
"use strict";
var https = require('https');
var program = require('commander');
var validator = require('validator');
var fs = require('fs');

var iControlRESTUrl = '/mgmt/shared/authn/login';
var tokenResp;

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

var options = 
{
    host: program.ip,
    // host: '192.168.218.150',
    port: 443,
    method: 'POST',
    path: iControlRESTUrl,
    // auth: 'admin:changeme',
    rejectUnauthorized: false,
    headers: 
    {
        'Content-Type': 'application/json',
    }
};

var data = 
{
    username:"mrajagopal",
    password:"changeme1234",
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
            uploadFile('myfile.txt');
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
        uploadFile('myfile.txt');
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
        path: '/mgmt/shared/file-transfer/uploads/' + filename,
        rejectUnauthorized: false,
    }

    var chunkSize = 64 * 1024;
    fs.stat(filename, function(error, stat) {
        if (error) { throw error; }
        uploadOptions.headers = 
        {
            'X-F5-Auth-Token': getToken(),
            'Content-Type' : 'text/plain',
            'Content-Range' : '0-'+ (stat.size-1)+'/'+stat.size
        }

        // do your piping here
        if(stat.size > chunkSize)
        {
            uploadOptions.headers['Content-Range'] = '0-'+ (chunkSize-1)+'/'+stat.size;
        }
        else
        {
            uploadOptions.headers['Content-Range'] = '0-'+ (stat.size-1)+'/'+stat.size;
        }
        // uploadOptions.headers['Content-Range'] = '0-'+ (stat.size-1)+'/'+stat.size;
        console.log(uploadOptions);

        var uploadReq = https.request(uploadOptions, processUploadResp);

        stream.on('data', function(data) {
            console.log('writing stream data: ', data.length);// : ', data.size());
            // var uploadReq = https.request(uploadOptions, function(resp)
            uploadReq.write(data);
        });

        stream.on('end', function() {
            console.log('End of stream data');
            uploadReq.end();
        });
    });     
}

var req = https.request(options, getTokenResponse);
console.log(data);
req.write(JSON.stringify(data));
req.end();

req.on('error', function(e)
{
    console.error(e);
});
