var program = require('commander');

// var epochTime = 1234567890;
// var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
// d.setUTCSeconds(epochTime);
// console.log(d.toDateString());

var weekMap = new Array();
weekMap[0] = "Mon";
weekMap[1] = "Tue";
weekMap[2] = "Wed";
weekMap[3] = "Thu";
weekMap[4] = "Fri";
weekMap[5] = "Sat";
weekMap[6] = "Sun";

var monthMap = new Array();
monthMap[0] = "Jan";
monthMap[1] = "Feb";
monthMap[2] = "Mar";
monthMap[3] = "Apr";
monthMap[4] = "May";
monthMap[5] = "Jun";
monthMap[6] = "Jul";
monthMap[7] = "Aug";
monthMap[8] = "Sep";
monthMap[9] = "Oct";
monthMap[10] = "Nov";
monthMap[11] = "Dec";

program.version('v0.0.1');
program.description('Command line tool to convert Unix Epoch time in seconds to human readable format');
program.option('--local', 'Convert to local time');
program.option('--gmt', 'Convert to GMT time');
program.option('--timezone <time relative to GMT>', 'Convert time to specified timezone eg. GMT-8 =  -8');
program.option('--time <time in Epoch in seconds>', 'Epoch time to convert');
program.parse(process.argv);

if(!process.argv.slice(2).length)
{
  program.help();
}

if(!program.time)
{
  program.help();
}
else
{
  if(isNaN(program.time) === true)
  {
    console.log('Please enter a time');
    program.help();
  }
}

if(program.local)
{
  var epochTimeInSeconds = parseInt(program.time);
  
  // The 1000 multiplier converts it to millisec units
  var d = new Date(epochTimeInSeconds*1000);
  console.log(d.toString());
}

if (program.gmt)
{
  var epochTimeInSeconds = parseInt(program.time);
  
  // The 1000 multiplier converts it to millisec units
  var d = new Date(epochTimeInSeconds*1000); 
  console.log(d.toUTCString());
}

if (program.timezone)
{
  var epochTimeInSeconds = parseInt(program.time) + (parseFloat(program.timezone)*60*60);

  // The 1000 multiplier converts it to millisec units
  var d = new Date(epochTimeInSeconds*1000); 
  var timezoneDateString = weekMap[d.getDay()] + ' ';
  timezoneDateString += monthMap[d.getMonth()] + ' ';
  timezoneDateString += d.getDate() + ' ';
  timezoneDateString += d.getFullYear()  + ' ';
  timezoneDateString += d.getHours() + ':';
  timezoneDateString += d.getMinutes() + ':';
  timezoneDateString += d.getSeconds() + ' ';
  timezoneDateString += "GMT" + program.timezone;

  console.log(timezoneDateString); 
}