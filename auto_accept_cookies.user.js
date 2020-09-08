// ==UserScript==
// @name         DH - Auto accept cookies
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Auto click "accept" or "agree" button in a cookie message
// @author       Damien Hembert
// @match        *://*/*
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

// ----------------- USERSCRIPT UTILS -----------------

var SCRIPT_BASE = "CookiesAccept";

function setScriptParam(key,value) {
    GM_setValue(SCRIPT_BASE+"_"+key,value);
}

function getScriptParam(key) {
    return GM_getValue(SCRIPT_BASE+"_"+key);
}

function hasScriptParam(key) {
    return getScriptParam(key);
}

var TAG = ['a','button'];
var LABEL = ['accept','agree','ACCEPT','AGREE','OK'];

function buildButtonSelector() {
    var result = '';
    for(var i=0;i<TAG.length;i++) {
        for(var j=0;j<LABEL.length;j++) {
            if(result) {
                result +=',';
            }
            result += TAG[i]+':contains("'+LABEL[j]+'")';
        }
    }
    return result;
}

function dateToString() {
    return new Date().toISOString().split('T')[0];
}

(function() {
    'use strict';
    if (window.top === window.self) { // not in iframes

        var today = dateToString();
        if(getScriptParam(document.location.hostname)!=today) {

            setTimeout(function() {
                var selector = buildButtonSelector();
                $('div,p').each(function(index,obj) {
                    var e = $(obj);
                    if(e.text().indexOf('cookie')>-1) {
                     //   debugger;
                        var button = e.find(selector);
                        if(button.length>0) {
                            console.log(button);
                            setScriptParam(document.location.hostname,today);
                            button.click();
                        }
                    }
                });
            },2000);
        }
    }
})();
