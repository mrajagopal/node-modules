#!/usr/bin/env node

var fs = require('fs');
var readStream = fs.createReadStream('myfile.txt');
// readStream.pipe(process.stdout);4
readStream
  .on('readable', function () {
    // hash.update(chunk);
    var chunk;
    while (null !== (chunk= readStream.read()))
    {
    	console.log(chunk.length);    	
    }
  })
  .on('end', function () {
    // console.log(hash.digest('hex'));
  });
