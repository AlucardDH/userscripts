// ==UserScript==
// @name         9gag avatar Image zoom
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       AlucardDH
// @match        https://9gag.com/gag/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        none
// ==/UserScript==

var current = null;
var zoom = $('<div style="position:absolute;left=0;right:0;display:none;"></div>');

function followMouse(event) {
    if(current) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

    // Use event.pageX / event.pageY here

        zoom.css('left',(event.pageX+10)+'px');
        zoom.css('top',(event.pageY+10)+'px');
    }
}

function updateZoom() {
    var hovered = $(".avatar img:hover");
    if(hovered.length>0) {
       var tmp = $(hovered[0]).attr('src');
       //console.log(tmp);
       if(!current || current!=tmp) {
           //new img
           current = tmp;

           zoom.empty();
           zoom.append('<img src="'+current.replace(/_100_/,'_400_')+'"/>');
           zoom.css('display','block');

       } else {
           // not new

       }
    } else {
        current = null;
        zoom.css('display','none');
    }

}

(function() {
    'use strict';

    document.onmousemove = followMouse;

    $('body').append(zoom);

    setInterval(updateZoom,100);
})();
