//TcpMonitor.js

var monitorStr = "test port 33406 with SynchExtAppDataWithLegacy";
var net = require('net');
var server = net.createServer(function(socket){
	socket.write('TCP server running\r\n');
	socket.pipe(socket);

	socket.on('data', function(data){
		console.log('data: ' + data.toString('hex'));

		if (data.toString().startsWith(monitorStr)){
			socket.write('Reply >>> port confirmed with SynchExtAppDataWithLegacyTIBCO process\r\n');
			socket.pipe(socket);
		}
		else{
			socket.write('Echo >>> ' + data);
			socket.pipe(socket);
		}
	});
});

server.listen(33406, '127.0.0.1');