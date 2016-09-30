// curl -k -u admin:changeme https://192.168.218.10/mgmt/tm/cm/syncStatus
// curl -k -u admin:changeme https://192.168.218.10/mgmt/tm/ltm/virtual?$filter=partition+eq+Common\&\$select=name%2Cdestination
//curl -s -k -u admin:admin --request PATCH -H "Content-type: application/json" --data '{"description": "hello Madhu"}' https://192.168.218.10/mgmt/tm/ltm/virtual/TestSAt
var https = require('https');
var util = require('util');
var username = 'admin';
var password = 'changeme';
var iControlRESTUrl = '/mgmt/tm/cm/sync-status';
// var restServer = '192.168.218.10';
var restServer = '192.168.218.15';
// var restServer = '192.168.218.25';
var count = 1;

var options = 
{
	host: restServer,
	port: 443,
	method: 'GET',
	path: iControlRESTUrl,
	auth: 'admin:changeme',
	rejectUnauthorized: false
};

function processResponse(resp)
{
	console.log(resp.statusCode);
	if ((resp.statusCode == 200) && (count > 0))
	{
		var req = https.request(options, processResponse);
		req.end();
		console.log('******** count: ', count, ' ****************');
		count--;

		req.on('error', function(e)
		{
			console.error(e);
		});
	}
	else if (count > 0)
	{
		console.log('This is broken');
	}

	resp.on('data', function(body)
	{
		// console.log(JSON.parse(body));
		console.log(util.inspect(JSON.parse(body), false, null));
	});

	resp.on('error', function(e)
	{
		console.error(e);
	});
}

var req = https.request(options, processResponse);
req.end();
console.log('******** count: ', count, ' ****************');
count--;

req.on('error', function(e)
{
	console.error(e);
});
