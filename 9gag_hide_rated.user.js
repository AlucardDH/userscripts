// ==UserScript==
// @name			DH - 9gag hide voted
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.4
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @match        	https://9gag.com/*
// @exclude        	https://9gag.com/gag*
// @exclude         https://9gag.com/u/alucarddh/*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// ==/UserScript==

console.log("DH - 9gag hide voted : loaded !");

// ----------------- USERSCRIPT UTILS -----------------

var SCRIPT_BASE = "9GAG";

function setScriptParam(key,value) {
    GM_setValue(SCRIPT_BASE+"_"+key,value);
}

function getScriptParam(key) {
    return GM_getValue(SCRIPT_BASE+"_"+key);
}

function hasScriptParam(key) {
    return getScriptParam(key);
}



// ------------- VIDEO -------------
var SHOW_VIDEOS = 'showVideos';
function showVideo() {
    var value = getScriptParam(SHOW_VIDEOS);
    if(value===false) {
        return false;
    } else {
        return true;
    }
}

unsafeWindow.showVideos = function() {
    if(!showVideo()) {
        setScriptParam(SHOW_VIDEOS,true);
        document.location.reload();
    }
};

unsafeWindow.hideVideos = function() {
    if(showVideo()) {
        setScriptParam(SHOW_VIDEOS,false);
    }
};

var NEXT_CLEAN = null;

function hideVoted() {
    $('article:not([id])').remove();

    $('.ora-player-container').closest('article').remove();

    if(NEXT_CLEAN) {
        NEXT_CLEAN.remove();
    }
    NEXT_CLEAN = $(".active").closest('article');
    if($(".badge-entry-collection").text().trim()=="") {
        $(".badge-entry-collection").css("height","100px");
    }
    if(!showVideo()) {
        $("video").closest('article').remove();
    }
}

$("#sidebar-content").remove();

setInterval(hideVoted,1000);