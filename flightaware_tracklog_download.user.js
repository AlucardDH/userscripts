// ==UserScript==
// @name         Flight aware - tracklog
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Download tracklog to csv
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/flightaware_tracklog_download.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/flightaware_tracklog_download.user.js
// @author       Damien Hembert
// @match        https://fr.flightaware.com/live/flight/*/tracklog
// @grant        none
// ==/UserScript==

var DATE;
var SEPARATOR = ',';
var HEADERS = [];
var FORMATTERS = {
    'LatitudeLat':function(td) {
        return $($(td).children()[0]).text();
    },
    'LongitudeLon':function(td) {
        return $($(td).children()[0]).text();
    },
    'Horaire (CET)CET':function(td) {
        var text = $($(td).children()[0]).text();
        return DATE+text.substring(text.indexOf(' '));
    },
    'CapDir':function(td){
        var text = $(td).text();
        return text.substring(1,text.length-1);
    },
    'mètres':function(td) {
        return $($(td).find('span')[0]).text().replace(/\./,'');
    }
}

var IGNORE = {
    'Taux':true,
    'Centre d\'informations':true
}

function parseUrl() {
    var result = {};

    var parse = document.location.href.match(/flight\/(.*)\/history\/(\d{8})\/(\d{4}Z)\/(\w{4})\/(\w{4})/);
    result.flightNumber=parse[1];
    result.date=parse[2];
    result.time=parse[3];
    result.departure=parse[4];
    result.arrival=parse[5];

    return result;
}

function isLineIgnore(tr) {
    var result = tr.className.indexOf('flight_event')>-1 || !$(tr).text().trim();
    //console.log(tr,$(tr).text().trim(),result);
    return result;
}

function getHeaderCsv(tr) {
    var result = '';

    $(tr).find('th').each(function(index,th) {
        var header = $(th).text();
        HEADERS.push(header);
        if(!IGNORE[header]) {
            result += header+SEPARATOR;
        }
    });

    return result.substring(0,result.length-1);
}

function getLineCsv(tr) {
    var result = '';


    $(tr).find('td').each(function(index,td) {
        var header = HEADERS[index];
        if(!IGNORE[header]) {
            var text;
            if(FORMATTERS[header]) {
                text = FORMATTERS[HEADERS[index]](td);
            } else {
                text = $(td).text();
            }
            result += text+SEPARATOR;
        }
    });

    return result.substring(0,result.length-1);
}

function downloadButton(content,filename) {
    return $('<a id="download" href="data:application/octet-stream,'+content.replace(/\n/g,'%0A').replace(/ /g,'%20')+'" download="'+filename+'">Download as CSV</a>');
}

(function() {
    'use strict';

    var infos = parseUrl();
    DATE = infos.date;

    var resultCsv = '';

    var line=0;
    $("#tracklogTable").find('tr').each(function(index,tr) {
        var lineCsv = null;
        if(line==0) {
            lineCsv = getHeaderCsv(tr);
        } else if(!isLineIgnore(tr)) {
            lineCsv = getLineCsv(tr);
        }

        if(lineCsv && lineCsv.trim()) {
            resultCsv += lineCsv+'\n';
        }

        line++;
    });

    console.log(resultCsv);

    $($('#tracklogTable').parents(".row")[0]).prepend(downloadButton(resultCsv,infos.flightNumber+'-'+infos.date+'-'+infos.time+'-'+infos.departure+'-'+infos.arrival+'.csv'));

})();