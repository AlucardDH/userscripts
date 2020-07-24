// ==UserScript==
// @name         DH - Auto accept cookies
// @namespace    http://tampermonkey.net/
// @version      0.1.1
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

(function() {
    'use strict';
    if(!hasScriptParam(document.location.hostname)) {

        setTimeout(function() {
            var button = $(':contains("cookie")').find(buildButtonSelector());
            //debugger;
            if(button.length>0) {
                console.log(button);
                setScriptParam(document.location.hostname,"true");
                button.click();
            }
        },2000);
    }
    //
})();
