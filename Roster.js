// roster.js

"use strict";
var program = require('commander');
var validator = require('validator');
var sprintf = require('sprintf-js').sprintf;


function Roster(members, inputDate, duration)
{
    if (!(this instanceof Roster)){
        return new Roster(inputDate, duration);
    }
    this.members = members;
    this.msecsInDay = 1000*24*60*60;
    this.week = 7;
    this.inputDate = new Date(inputDate);
    this.duration = duration;
    this.startDate = this.getNextMonday(this.inputDate);
    this.endDate = this.getNextSunday(new Date(this.startDate).setMonth(this.startDate.getMonth() + parseInt(program.duration)));
    var diff = Math.floor((this.endDate - this.startDate)/this.msecsInDay);
    console.log('diff: ', diff);
    if (diff%(this.members.length*7))
    {
        diff += (this.week*this.members.length - diff%(this.members.length*this.week)) - 1;   // take away one day
    }

    console.log('diff adjusted: ', diff);
    this.endDate = this.getNextSunday(new Date(this.endDate.setTime(this.startDate.getTime() + diff*this.msecsInDay)));
    console.log('end date: ', this.endDate);
}

Roster.prototype.getNextMonday = function getNextMonday(d)
{
    d = new Date(d);
    var day = d.getDay();
    var nextMondayDate = 0;
    if(day == 1)
    {
        nextMondayDate = d.getDate();
    }
    else
    {
        nextMondayDate = d.getDate() + (day == 0 ? 1 : (8-day));
    }

    console.log(nextMondayDate);
    return new Date(d.setDate(nextMondayDate));
}

Roster.prototype.getNextSunday = function getNextSunday(d)
{
    d = new Date(d);
    var day = d.getDay();
    var nextSundayDate = 0;
    if(day == 0)
    {
        nextSundayDate = d.getDate();
    }
    else
    {
        nextSundayDate = d.getDate() + (7-day);
    }

    // console.log(nextSundayDate);
    return new Date(d.setDate(nextSundayDate));
}

Roster.prototype.getNextRosterDate = function getNextRosterDate(d, period)
{
    d = new Date(d);
    var nextDate = d.getDate() + 7*period;
    rosterDate = nextDate;
    return new Date(d.setDate(nextDate));
}

///////// Start of program //////////

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

//////////// Validate Inputs /////////////////////////

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

/////// Compute start and end dates from inputs //////////

var members = ['Andrew', 'Brian', 'Madhu', 'Satoshi'];
var roster = new Roster(members, program.startDate, program.duration);
console.log('Roster Start Date: ', roster.startDate);
console.log('Roster End Eate  : ', roster.endDate);
console.log('Members of the group are: ', roster.members);
/////// Print the roster to the console //////



var rosterDate = new Date(roster.startDate);

var i = 0;
while (rosterDate <= roster.endDate)
{
    console.log(sprintf("%-10s", roster.members[(i++)%roster.members.length]), rosterDate);

    // set roster period of each individual to 1 week
    rosterDate = roster.getNextRosterDate(rosterDate, 1);    
}
