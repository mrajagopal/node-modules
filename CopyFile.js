#!/usr/bin/env node
"use strict";
var https = require('https');
var program = require('commander');
var validator = require('validator');

var iControlRESTUrl = '/mgmt/shared/authz/tokens';
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
	auth: 'admin:changeme',
	rejectUnauthorized: false,
	headers: 
	{
		'Content-Type': 'application/json',
	}
};

var link = 'https://' + program.ip + '/mgmt/shared/authz/users/admin';
// var link = 'https://192.168.218.150/mgmt/shared/authz/users/admin';
var data = 
{
	'user': {'link': link}, 
	'timeout': 1200,
	'address':'192.168.218.150'
};

// console.log(data);
function getTokenResponse(resp)
{
	// console.log(resp.statusCode);

	resp.on('data', function(body)
	{
		// console.log(JSON.parse(body));
		tokenResp = JSON.parse(body);
		console.log(tokenResp.token);
	});

	resp.on('error', function(e)
	{
		console.error(e);
	});
}

function uploadFile(filename)
{
	var uploadOptions
	{
		host: program.ip,
		// host: '192.168.218.150',
		port: 443,
		method: 'POST',
		path: iControlRESTUrl,
		auth: 'admin:changeme',
		rejectUnauthorized: false,
		headers: 
		{
			'Content-Type': 'application/json',
		}
	}
}

var req = https.request(options, getTokenResponse);

req.write(JSON.stringify(data));
req.end();

req.on('error', function(e)
{
	console.error(e);
});

