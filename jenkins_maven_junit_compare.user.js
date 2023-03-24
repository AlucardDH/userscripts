// ==UserScript==
// @name         Jenkins Maven Logs - JUnit/OpenTest compare
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Parse Jenkins Maven logs to have a more readable format
// @author       Damien Hembert
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://github.com/AlucardDH/userscripts/raw/master/jenkins_maven_junit_compare.user.js
// @updateURL       https://github.com/AlucardDH/userscripts/raw/master/jenkins_maven_junit_compare.user.js
// @match        **/job/*/consoleText
// @require         https://cdnjs.cloudflare.com/ajax/libs/cash/8.1.1/cash.min.js
// @grant        none
// ==/UserScript==

var JUNIT_ERROR = /org.junit.ComparisonFailure|org.opentest4j.AssertionFailedError/;
var FAILURE = '<<< FAILURE!';
var EXPECTED = /expected:<|Expecting:/i;
var ACTUAL = /but was:<|to be equal to:/i;
var END = '>';
var CONTENT = '';
var ERRORS = [];

class Error {
    startLine;
    endLine;
    test=null;
    expected=[];
    actual=[];
    complete=false;

    constructor(startLine,test) {
        this.startLine = startLine;
        this.test = test;
    }

    addLine(line) {
        line = line.replace(/^\[.*?\]/,'');
        if(line.trim()=='') return;
        if(line.match(EXPECTED)) {
            console.log(line);
            this.expected.push(line);//.substr(line.indexOf(EXPECTED)+EXPECTED.length));
        } else if(line.match(ACTUAL)) {
            console.log(line);
            this.actual.push(line);//.substr(line.indexOf(ACTUAL)+ACTUAL.length));
        } else if(this.actual.length && line.includes(END)) {
            console.log(line);
            this.complete = true;
            console.log(this);
        } else if(this.actual.length>0) {
            this.actual.push(line);
        } else {
            this.expected.push(line);
        }
    }
}

function readContent() {
    CONTENT = document.getElementsByTagName('pre')[0].innerText;
}

function parseContent() {
    var lines = CONTENT.split('\n');

    $('body').empty();

    var error = null;
    var currentLine = 0;
    while(currentLine<lines.length) {
        var line = lines[currentLine];
        if(error) {
            error.addLine(line);
            if(error.complete) {
                displayError2(error);
                ERRORS.push(error);
                error = null;
            }
        } else {
            if(line.match(JUNIT_ERROR)) {
                error = new Error(currentLine-1,lines[currentLine-1]);
            } else if(line.includes('-<')) {
                displayLine(line);
            } else if(line.includes('Tests run:')) {
                var results = line.match(/Tests run: (\d+), Failures: (\d+), Errors: (\d+), Skipped: (\d+)/);
                var alls = +results[1];
                var failures = +results[2];
                var errors = +results[3];
                var skipped = +results[4];
                if(failures||errors) {
                    displayLine(line,'error');
                } else if(alls){
                    displayLine(line,'success');
                }

            }
        }
        currentLine++;
    }
}

function displayError(error) {

    displayLine(error.test,'error');
    var div = $('<div style="clear:both;">');
    var expected = $('<pre style="width:50%;float:left;">');
    expected.text(error.expected.join('\n'));
    div.append(expected);

    var actual = $('<pre style="width:50%;float:right;">');
    actual.text(error.actual.join('\n'));
    div.append(actual);

    $('body').append(div);
}

function displayError2(error) {

    displayLine(error.test,'error');

    var currentExpected = '';
    var currentActual = '';
    var currentMatching = true;

    var div;
    var expected;
    var actual;

    for(var i=0;i<Math.max(error.expected.length,error.actual.length);i++) {
        var e = error.expected[i];
        var a = error.actual[i];
        if(!e) e = '';
        if(!a) a = '';
        var matching = e==a;
        if(matching==currentMatching) {
            currentExpected += e+'\n';
            currentActual += a+'\n';
        } else {
            if(currentMatching) {
                div = $('<div style="clear:both;background:green;color:white;">');
            } else {
                div = $('<div style="clear:both;background:red;color:white;">');
            }
            expected = $('<pre style="width:49%;display:inline-block;">');
            expected.text(currentExpected);
            actual = $('<pre style="width:49%;display:inline-block;">');
            actual.text(currentActual);
            div.append(expected);
            div.append(actual);

            $('body').append(div);

            currentExpected = e+'\n';
            currentActual = a+'\n';
            currentMatching = matching;
        }
    }

    if(currentMatching) {
        div = $('<div style="clear:both;background:green;color:white;">');
    } else {
        div = $('<div style="clear:both;background:red;color:white;">');
    }
    expected = $('<pre style="width:49%;display:inline-block;">');
    expected.text(currentExpected);
    actual = $('<pre style="width:49%;display:inline-block;">');
    actual.text(currentActual);
    div.append(expected);
    div.append(actual);

    $('body').append(div);
}

var LEVEL_COLOR = {'success':'green','info':'white','warn':'yellow','error':'red'};
function displayLine(line,level) {
    var div = $('<pre style="clear:both;color:'+LEVEL_COLOR[level||'info']+'">');
    div.text(line);
    $('body').append(div);
}

(function() {
    'use strict';

    readContent();
    parseContent();

    //console.log(content);
})();