// ==UserScript==
// @name            DH - Youtube hide video LIGHT
// @namespace       https://github.com/AlucardDH/userscripts
// @version         0.1
// @author          AlucardDH
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos_light.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos_light.user.js
// @match           https://www.youtube.com/*
// @require         https://code.jquery.com/jquery-3.6.0.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant		    GM_addStyle
// @grant           unsafeWindow
// ==/UserScript==

unsafeWindow.jquery=$;

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

var previousWatchedCount = 0;

function displayWatched(b) {
    var watched = $('ytd-thumbnail-overlay-resume-playback-renderer').closest('ytd-grid-video-renderer,ytd-video-renderer,ytd-rich-item-renderer ');
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

var UPDATING = false;
function update() {
    if(!UPDATING) {
        UPDATING = true;
        displayWatched(DISPLAY_WATCHED);
        UPDATING = false;
    }
}

function toggleWatched() {
    displayWatched(!DISPLAY_WATCHED);
}

function addButtons() {
    var toggleGroup = $('<div id="hideWatchedGroup" class="style-scope ytd-shelf-renderer" style="cursor:pointer;color:white;font-weight:bold;"></div>');

    var toggleButton = $(
        '<tp-yt-paper-toggle-button id="toggle" style="vertical-align:middle;display: inline-block;" touch-action: pan-y; noink="" class="style-scope ytd-settings-switch-renderer" role="button" toggles="" active="" checked="">'
           +'<div class="toggle-label style-scope tp-yt-paper-toggle-button" style="display:inline-block;height:24px;padding:8px;line-height:24px;">HIDE WATCHED'
          +'</div>'
        +'</tp-yt-paper-toggle-button>'
    );
    toggleButton.click(toggleWatched);
    toggleGroup.append(toggleButton);

    var pos = $('ytd-masthead #end');

    pos.prepend(toggleGroup);
}


$(function() {
    addButtons();
    setInterval(update,1000);
});

console.log("DH - Youtube hide video LIGHT 0.1 : loaded !");

