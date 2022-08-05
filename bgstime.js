
function dayView() {
    let topMargin = 40;
    let leftMargin = 20;
    let fontSize = 20;
    let lines = 7;
    g.clear()
    earliest = new Date();
    showDateBar(new Date());
    g.setFontAlign(-1,0);  // centre
    g.setColor(255,255,255); //white
    g.setFont("Vector", fontSize);
    let periods = getTodaysPeriods(earliest);
    for (let i=0; i<lines; i++) {
        let p = i + vScroll; 
        if (periods[p] != undefined) {
            g.drawString(periods[p].period, leftMargin, i*fontSize+topMargin);
        }
    }
}

function countDownView() {
    g.clear();
    d = new Date();
    //d = new Date(2022, 5, 21, real_d.getHours()-5, real_d.getMinutes());  // DEBUG force the date/time to Thurs 23rd Jun at 11:00

    showDateBar(d);
    currentPeriod = getPeriod(d);
    nextPeriod = undefined;
    if (currentPeriod != undefined) {
        if (currentPeriod.period != START_MARKER &&
            currentPeriod.period != END_MARKER) {
            fitToLine(currentPeriod.period, "#FF4400", 45);
        }
    
        nextPeriod = currentPeriod.next;
        if (nextPeriod != undefined &&
            nextPeriod.period != START_MARKER &&
            nextPeriod.period != END_MARKER) {
            fitToLine(nextPeriod.period, "#FF0000", 155);
        }
    }
    // show countdown if we are a specified period
    // otherwise show the actual time
    // NOTE the current period will show as the first period of the day,
    // even if the time is too early. This is because the currentPeriod
    // cannot be left undefined, so it is set to 1st period by default
    // so to check whether to show the countdown, we must compare the
    // current and start times
//    console.log("current  :" + currentPeriod.period);
//    console.log("next     :" + nextPeriod.period);
//    console.log("til start:" + timeRemaining(d, currentPeriod.start));
//    console.log("til   end:" + timeRemaining(d, currentPeriod.end));
    //console.log("clause1:" + (currentPeriod.period !== END_PERIOD.period));
    //console.log("clause2:" + (currentPeriod != START_PERIOD || timeRemaining(d, currentPeriod.end) < 5*60));
    
    if (timeRemaining(d, currentPeriod.start) < 0 && currentPeriod.period != END_MARKER) {
        mode = MODE_LESSON;
        showCountdown(timeRemaining(d, currentPeriod.end));
    } else {
        mode = MODE_CLOCK;
        showTime(d);
    }
    // optional - this keeps the watch LCD lit up
    //Bangle.setLCDPower(1);
    //console.log(Bangle.isLCDOn());
}

// displays the date in a narrow strip at the top
function showDateBar(theDay) {
    g.setColor("#FFFF00");  // yellow
    g.fillRect(0, 0, 14, 20);
    g.setColor("#000000");  // black
    g.setFontAlign(-1,-1);  // top left
    g.setFont("12x20");
    g.drawString(getWeekLetter(theDay), 2, 2);
    g.setColor("#FFFF00");  // yellow
    g.drawString(getDateText(theDay), 20, 2);
}

// time, in seconds, until the current period ends
function timeRemaining(currentTime, endTime) {
    seconds1 = currentTimeInSeconds(currentTime);
    seconds2 = secondsSinceMidnight(endTime);
    return seconds2-seconds1;
}

// show the time left, as minutes and seconds
function showCountdown(timeLeft) {
    g.setFontAlign(0,0);  // centre
    g.setFont("Vector", 50);
    g.setColor("#FFFF00");
    // draw the current counter value
    let mins = padTwoDigits(Math.floor(timeLeft / 60));
    let secs = padTwoDigits(timeLeft % 60);
    g.drawString(mins + ":" + secs, g.getWidth()/2, 100);
}

// show ordinary clock time
function showTime(currentTime) {
    g.setFont("Vector", 50);
    g.setColor("#FFFF00");
    // blink the : between hours and minutes every second
    if (currentTime.getSeconds() % 2 == 0) {
        separator = ":";
    } else {
        separator = "";
    }
    let vPos = 100;
    let hPos = g.getWidth()/2;
    g.setFontAlign(1,0);  // right
    g.drawString(currentTime.getHours(), hPos-5, vPos);
    g.setFontAlign(0,0);  // centre
    g.drawString(separator, hPos, vPos);
    g.setFontAlign(-1,0);  // left
    g.drawString(padTwoDigits(currentTime.getMinutes()), hPos+5, vPos);
}

// returns a string with a leading zero or not, as required
function padTwoDigits(num) {
    if (num<10) {
        return "0" + num.toString();  //padding with leading zero
    }
    return num.toString();
}

// shows the text, scaled to fit on the line
function fitToLine(text, color, vPos) {
    g.setFontAlign(0,0);  // centre
    g.setColor(color);
    g.setFont("Vector", getFontSize(text, 40));
    g.drawString(text, g.getWidth()/2, vPos);
}

// picks a font so that text fills the line
function getFontSize(text, max) {
    if (text !="") {
        return Math.min(max, 20/12 * g.getWidth()/text.length);
    } else {
        return 0;
    }
}    

function getDateText(date) {
    // turns "Sat, 18 Jun 2022 12:04:35 GMT" into "Sat 18 Jun"
    return date.toUTCString().substring(0, 3) 
           + date.toUTCString().substring(4, 11);
}

function getWeekLetter(date) {
    return "A";
    // TODO: actually calculate the correct week A or B
}

// takes a string representing a time eg "8:35" and returns the seconds elapsed since 00:00
// eg (8*60 + 35) * 60 for this example
function secondsSinceMidnight(timeText) {
    let parts = timeText.split(":");
    let hours = parseInt(parts[0]);
    let mins = parseInt(parts[1]);
    //console.log("Time since: " + hours + ":" + mins + "=" + ((hours * 60 + mins) * 60).toString());
    return (hours * 60 + mins) * 60;
}


// returns the number of seconds since midnight, according to the system clock
function currentTimeInSeconds(t) {
    return t.getHours() * 3600 + t.getMinutes() * 60 + t.getSeconds();
}

// convert 0, 1, 2... to "sun", "mon", "tue" etc
function getDayName(dayNum) {
    // DEBUG set the day to a weekday, to display a timetable with something in it
    //dayNum = 4;
    return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayNum];
}

// return the array of all periods for the indicated day
function getTodaysPeriods(thisDay) {
    // find the correct day
    let day = getDayName(thisDay.getDay());
    //console.log(day);

    // check if there is an entry for this day in the weekB timetable
    if (getWeekLetter(thisDay) == "B" && timetable.weekB[day] != undefined) {
        todaysPeriods = timetable.weekB[day];
    } else {
        // if there isn't, or it isn't week B, we just use the week A timetable
        todaysPeriods = timetable.weekA[day];
    }
    return todaysPeriods;
}

// return the period object corresponding to the given time
function getPeriod(time) {
    todaysPeriods = getTodaysPeriods(time);
    //console.log(todaysPeriods);
    
    if (todaysPeriods != undefined) {
        // find the correct period
        p = todaysPeriods.length-1;
        period = todaysPeriods[p];
        while (period != undefined && currentTimeInSeconds(time) < secondsSinceMidnight(todaysPeriods[p].start)) {
            p--;
            period = todaysPeriods[p];
        }

        if (p<0) {
            period = todaysPeriods[0];  //if the time is before the start of the timetable, count down to the start
            period.next = todaysPeriods[1];
        } else if (p<todaysPeriods.length-1) {
            period.next = todaysPeriods[p+1];
        } else {
            period.next = undefined;
        }

        /*
        // DEBUG CODE TO CHECK THE CURRENT PERIOD

        if (p == undefined) {
            console.log("outside timetable");
        } else {
            let timeLeft = secondsSinceMidnight(todaysPeriods[p+1].start) - currentTimeInSeconds(time);
            console.log("period is:" + todaysPeriods[p].period);
            console.log("start:" + todaysPeriods[p].start);
            console.log("end  :" + todaysPeriods[p+1].start);
            console.log("time now is" + time.getHours().toString() + ":" + time.getMinutes().toString());

            console.log("time left is:" + (timeLeft/60).toString());
        }
        // END DEBUG CODE
        */
    }
    return period;
}

// looks through the timetable to find the period that comes next
// takes into account week B substitutions
function getNextPeriod(time) {
    currentPeriod = getPeriod(time);
    if (currentPeriod != undefined) {
        // look ahead, one minute at a time until the period changes
//        nextPeriod = currentPeriod;
//        t = 60000;
//        while (nextPeriod == currentPeriod) {
//            t = t + 60000;  // 60,000ms = 1min
//            nextPeriod = getPeriod(time + t);
//            console.log("checking time:" + (time+t).toString());                                                                     
//        }
    }
    return nextPeriod;
}


// read the timetable data structure from the JSON file
// and calculate the end-time for each period
function loadTimeTable() {
    weeks = ["weekA", "weekB"];
    // load timetable from separate file - TEST currently disabled
    //timetable = require("Storage").readJSON("timetable.json", true);
    for (d=0; d<7; d++) {
        day = getDayName(d);
        for (w=0; w<weeks.length; w++) {
            //console.log("calc end for " + weeks[w] + " " + day);
            periods = timetable[weeks[w]][day];
            if (periods != undefined) {
                for (i=0; i<periods.length-1; i++) {
                    periods[i].end = periods[i+1].start; // end of one period assumed to be the start of the next
                }
            }
        }
    }
    return timetable;
}

// EXPERIMENTAL INPUT STUFF
function clockInput(data) {
    if (data.dir = "front") {
        console.log("front tap");
    }
//    console.log(data.dir);
//    if (data.double) {
//        clearInterval(interval);
//        g.clear();
//        Bangle.on('tap', menuInput);

}

function swipeInput(directionLR, directionUD) {
    if (mode != MODE_DAY_VIEW) {
        mode = MODE_DAY_VIEW;
        vScroll = 0;
        clearInterval(interval);
        interval = setInterval(dayView, 100);  // faster update for better scroll performance
    } else {
        if (directionUD == -1) {
            console.log("swipe up");
            vScroll += 1;
        }
        if (directionUD == 1) {
            console.log("swipe down");
            vScroll -= 1;
            if (vScroll <0) {
             vScroll = 0;                                                                                                   }
        }
    }
}

function touchInput(button, xy) {
    console.log(button);
}

// MAIN PROGRAM
var period = undefined;
var countdown = 0;
var today = new Date();
const START_MARKER = ">>>";
const END_MARKER   = "<<<";
const MODE_CLOCK = 0;
const MODE_LESSON = 1;
const MODE_DAY_VIEW = 2;
const MODE_SYNC = 3;
var mode = MODE_LESSON;
var vScroll = 0;

var timetable = {
weekA: {
    mon: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 8w1",     start:"8:35"},
        {period:"p2 free",    start:"9:25"},
        {period:"break",      start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 12B",     start:"10:55"},
        {period:"p4 9G",      start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 free",    start:"13:25"},
        {period:"p7 7xy1",    start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    tue: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 10C",     start:"8:35"},
        {period:"p2 12B",     start:"9:25"},
        {period:"duty",       start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 8x3",     start:"10:55"},
        {period:"p4 free",    start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 free",    start:"13:25"},
        {period:"p7 8yz1",    start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    wed: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 free",    start:"8:35"},
        {period:"p2 7z1",     start:"9:25"},
        {period:"house",      start:"10:15"},
        {period:"break",      start:"10:35"},
        {period:"p3 8yz3",    start:"10:55"},
        {period:"p4 8w2",     start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 9F",      start:"13:25"},
        {period:"p7 free",    start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    thu: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 free",    start:"8:35"},
        {period:"p2 10C",     start:"9:25"},
        {period:"break",      start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 free",    start:"10:55"},
        {period:"p4 9E",      start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 7xy2",    start:"13:25"},
        {period:"p7 9D",      start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    fri: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 7w1",     start:"8:35"},
        {period:"p2 free",    start:"9:25"},
        {period:"break",      start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 free",    start:"10:55"},
        {period:"p4 8yz4",    start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 10C",     start:"13:25"},
        {period:"p7 DM?",     start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    sat: [
        {period:">>>",        start:"15:05"},
        {period:"first",      start:"15:07"},
        {period:"middle",     start:"15:08"},
        {period:"<<<",        start:"15:09"},
        ],
    sun: [
        {period:">>>",        start:"8:15"},
        {period:"teg",        start:"8:30"},
        {period:"t1 8w1",     start:"8:35"},
        {period:"t2 free",    start:"9:25"},
        {period:"treak",      start:"10:15"},
        {period:"T/M",        start:"10:35"},
        {period:"t3 12B",     start:"10:55"},
        {period:"t4 9G",      start:"11:45"},
        {period:"t5 free",    start:"12:35"},
        {period:"t6 free",    start:"13:25"},
        {period:"t7 7xy1",    start:"14:15"},
        {period:"t89 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
        },
weekB: {
    tue: [
        {period:"reg",        start:"8:30"},
        {period:">>>",        start:"8:15"},
        {period:"p1 10C",     start:"8:35"},
        {period:"p2 12B",     start:"9:25"},
        {period:"break",      start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 8x3",     start:"10:55"},
        {period:"p4 free",    start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 9E",      start:"13:25"},
        {period:"p7 8yz1",    start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    wed: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 free",    start:"8:35"},
        {period:"p2 7z1",     start:"9:25"},
        {period:"house",      start:"10:15"},
        {period:"duty",       start:"10:35"},
        {period:"p3 8yz3",    start:"10:55"},
        {period:"p4 8w2",     start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 9F",      start:"13:25"},
        {period:"p7 free",    start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
    thu: [
        {period:">>>",        start:"8:15"},
        {period:"reg",        start:"8:30"},
        {period:"p1 free",    start:"8:35"},
        {period:"p2 10C",     start:"9:25"},
        {period:"break",      start:"10:15"},
        {period:"A/M",        start:"10:35"},
        {period:"p3 free",    start:"10:55"},
        {period:"p4 free",    start:"11:45"},
        {period:"p5 free",    start:"12:35"},
        {period:"p6 7xy2",    start:"13:25"},
        {period:"p7 9D",      start:"14:15"},
        {period:"789 end",    start:"15:00"},
        {period:"<<<",        start:"15:10"},
        ],
        },
};

// uncomment these lines to write new data to the JSON file
/*
require("Storage").writeJSON("timetable.json", timetable);

*/

/*
var termDates = {
TODO - think of a neat way to represent the entire school year
need to specify:
week A/B
is it a school day
bank holidays & inset
*/

// initialise the timetable data
// this includes calculating the end times of all periods
var timetable = loadTimeTable();

// TEST setup the onscreen buttons
/*
var Layout = require("Layout");
var layout = new Layout( {
   type:"v", c: [
    {type:"txt", font:"6x8:4", label:"Menu", id:"label"},
    {type:"btn", font:"6x8:2", label:"Sync", cb: l=>setLabel("One") },
    {type:"btn", font:"6x8:2", label:"Cancel", cb: l=>setLabel("Two") }
  ]
}, {btns:[
  {label:"Three", cb: l=>setLabel("Three")}
], lazy:true});

function setLabel(x) {
  layout.label.label = x;
  layout.render();
}
g.clear();
layout.render();
*/


// set callback functions for the display update and touch detection
var interval = setInterval(countDownView, 1000);
Bangle.on('swipe', swipeInput);
Bangle.on('touch', touchInput);
console.log("setup complete");

