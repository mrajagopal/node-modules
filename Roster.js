// roster.js

// var calendar = require('node-calendar');

// // var cal = new calendar.Calendar(calendar.SUNDAY);
// var cal = new calendar.Calendar(0).itermonthdates(2016, 11);
// console.log(cal);

// var members = ['Andrew', 'Brian', 'Madhu', 'Satoshi'];

// console.log(members);

"use strict";
var program = require('commander');
var validator = require('validator');


function getNextMonday(d)
{
    d = new Date(d);
    var day = d.getDay();
    var nextMondayDate = 0;
    if(day == 1)
    {
        nextMondayDate = d.getDate();
    }
    else //if (day == 0)
    {
        nextMondayDate = d.getDate() + (day == 0 ? 1 : (8-day));
    }

    console.log(nextMondayDate);
    return new Date(d.setDate(nextMondayDate));
}

function getNextSunday(d)
{
    d = new Date(d);
    var day = d.getDay();
    var nextSundayDate = 0;
    if(day == 0)
    {
        nextSundayDate = d.getDate();
    }
    else //if (day == 0)
    {
        nextSundayDate = d.getDate() + (7-day);
    }

    console.log(nextSundayDate);
    return new Date(d.setDate(nextSundayDate));
}

function getNextRosterDate(d, period)
{
    d = new Date(d);
    var nextDate = d.getDate() + 7*period;
    rosterDate = nextDate;
    return new Date(d.setDate(nextDate));
}

program.version('0.0.1');
program.description('Roster generator using Node.js');
program.option('--verbosity', 'Enable verbose logging');
program.option('--startDate <date>', 'Hostname to analyze');
program.option('--duration <number of months>', 'Number of months to generate roster');
program.parse(process.argv);

// print process.argv
process.argv.forEach(function (val, index, array) 
{
  console.log(index + ': ' + val);
});

/////////////////////////////////////

if (!process.argv.slice(2).length)
{
    console.log('Too few arguments');
    program.help();
    process.exit(0);
}
if (!validator.isInt(program.duration, {min:1, max:12}))
{
    console.log('Invalid roster duration. Please enter a number between 1 and 12 months');
}

if (!validator.isISO8601(program.startDate))
{
    console.log('The is not a valid ISO8601 date format');
    process.exit(0);
}

var inputDate = new Date(program.startDate);
// console.log("Date is: ", inputDate.getDate());
// console.log("Year is: ", inputDate.getFullYear());
// console.log("UTC time: ", inputDate.getTime());
// console.log("Day is: ", inputDate.getDay());

var startDate = getNextMonday(inputDate);
// console.log('Start day is: ', startDate.getDay());
// console.log('Start date is: ', startDate.getDate());

var endDate = getNextSunday(new Date(startDate).setMonth(startDate.getMonth() + parseInt(program.duration)));

var oneRoster = new Date(new Date(startDate).setDate(startDate.getDate() + parseInt(4*7)));
console.log('example roster: ', oneRoster);

console.log('Roster Start Date: ', startDate);
console.log('Roster End Eate  : ', endDate);

var members = ['Andrew', 'Brian', 'Madhu', 'Satoshi'];
console.log(members);

var rosterDate = new Date(startDate);
// members.forEach(function(element) 
// {
//     // console.log(element, getNextRosterDate(rosterDate, 1));
//     console.log(element, rosterDate);
// });

var i = 0;
while (rosterDate < endDate)
{

    console.log(rosterDate, members[(i++)%members.length]);
    rosterDate = getNextRosterDate(rosterDate, 1);
    // console.log(rosterDate);
}
