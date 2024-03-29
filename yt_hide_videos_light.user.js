// ==UserScript==
// @name            DH - Youtube hide video LIGHT
// @namespace       https://github.com/AlucardDH/userscripts
// @version         0.3.0
// @author          AlucardDH
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos_light.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos_light.user.js
// @match           https://www.youtube.com/*
// @exclude         https://www.youtube.com/watch*
// @require         https://cdnjs.cloudflare.com/ajax/libs/cash/8.1.1/cash.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           GM_addStyle
// @grant           unsafeWindow
// ==/UserScript==

function styleToString(style) {
    var result = style.selector;
    result += "{";
    for(var property in style) {
        if(property.indexOf("elector")<0) {
            result += property+":"+style[property]+";";
        }

    }
    result += "}";

    return result;
}
GM_addStyle(styleToString({selector:"#hideWatchedGroup .toggle-container","top":"8px","left":"8px"}));

var DISPLAY_WATCHED = false;
var DISPLAY_SHORTS = false;

var previousWatchedCount = 0;
var previousShortsCount = 0;

var VIDEO_TAGS = ['ytd-grid-video-renderer'.toUpperCase(),'ytd-video-renderer'.toUpperCase(),'ytd-rich-item-renderer'.toUpperCase()];
function getVideoElement(e) {
    var current = e;
    while(e && VIDEO_TAGS.indexOf(e.tagName)==-1) {
        e = e.__shady_native_parentElement;
    }
    return e;
}

function displayWatched(b) {
    var watched = $('ytd-thumbnail-overlay-resume-playback-renderer').map((i,e)=>getVideoElement(e));
    var count = watched.length;
    if(b!=DISPLAY_WATCHED || previousWatchedCount!=count) {
        DISPLAY_WATCHED = b;
        previousWatchedCount = count;
        if(b) {
            watched.show();
        } else {
            watched.hide();
        }
    }

}

function displayShorts(b) {
    var shorts = $('ytd-thumbnail-overlay-time-status-renderer[overlay-style=SHORTS]').map((i,e)=>getVideoElement(e));
    var count = shorts.length;
    if(b!=DISPLAY_SHORTS || previousShortsCount!=count) {
        DISPLAY_SHORTS = b;
        previousShortsCount = count;
        if(b) {
            shorts.show();
        } else {
            shorts.hide();
        }
    }

}

var UPDATING = false;
function update() {
    var url = document.URL;
    if(!UPDATING && url.indexOf('watch?')==-1) {
        UPDATING = true;
        displayWatched(DISPLAY_WATCHED);
        displayShorts(DISPLAY_SHORTS);
        UPDATING = false;
    }
}

function toggleWatched() {
    displayWatched(!DISPLAY_WATCHED);
}
function toggleShorts() {
    displayShorts(!DISPLAY_SHORTS);
}

function addButtons() {
    var toggleGroup = $('<div id="hideWatchedGroup" class="style-scope ytd-shelf-renderer" style="cursor:pointer;color:white;font-weight:bold;"></div>');

    var toggleButton = $(
        '<tp-yt-paper-toggle-button id="toggle" style="vertical-align:middle;display: inline-block;" touch-action: pan-y; noink="" class="style-scope ytd-settings-switch-renderer" role="button" toggles="" active="" checked="">'
           +'<div class="toggle-label style-scope tp-yt-paper-toggle-button" style="display:inline-block;height:24px;padding:8px;line-height:24px;">HIDE WATCHED'
          +'</div>'
        +'</tp-yt-paper-toggle-button>'
    );
    toggleButton.on('click',toggleWatched);
    toggleGroup.append(toggleButton);

    toggleButton = $(
        '<tp-yt-paper-toggle-button id="toggle" style="vertical-align:middle;display: inline-block;" touch-action: pan-y; noink="" class="style-scope ytd-settings-switch-renderer" role="button" toggles="" active="" checked="">'
           +'<div class="toggle-label style-scope tp-yt-paper-toggle-button" style="display:inline-block;height:24px;padding:8px;line-height:24px;">HIDE SHORTS'
          +'</div>'
        +'</tp-yt-paper-toggle-button>'
    );
    toggleButton.on('click',toggleShorts);
    toggleGroup.append(toggleButton);

    var pos = $('ytd-masthead #end');

    pos.prepend(toggleGroup);
}


$(function() {
    addButtons();
    setInterval(update,1000);
});

console.log("DH - Youtube hide video LIGHT 0.3.0 : loaded !");

