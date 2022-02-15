// ==UserScript==
// @name         DuckDuckGo<>Google
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.google.com/*
// @match        https://duckduckgo.com/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant		    GM_addStyle
// ==/UserScript==

var DDG = 'https://duckduckgo.com/';
var GG = 'https://www.google.com/';

var HOST;
var isGoogle;
var isDuckDuckGo;
var search;

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

function readHost() {
    HOST = window.location.host;
    isGoogle = HOST.includes('google');
    isDuckDuckGo = HOST.includes('duckduckgo');
    var params = new URLSearchParams(window.location.search);
    search = params.get('q');
}

function switchEngine() {
    var url = '';
    if(isGoogle) {
        url += DDG;
        if(search) {
            url += '?q='+search+'&t=h_&ia=web';
        }
    } else if(isDuckDuckGo) {
        url += GG;
        if(search) {
            url += 'search?q='+search+'&source=hp';
        }
    }
    return url;
}

function updateButton() {
    var currentButton = $('.D2G')[0];
    if(!currentButton) {
        currentButton = $('<a class="D2G">'+(isGoogle?'DuckDuckGo':'Google')+'</div>');
        GM_addStyle(styleToString({selector:".D2G",background:"white",color:"black !important",padding:'4px',"border-radius":"4px",'position':'absolute','left':'4px','top':(isGoogle?'-20px':'4px'),'height':'24px !important'}));
        currentButton.click(switchEngine);
        var logo;
        if(isGoogle) {
            logo = $('#searchform');
        } else if(isDuckDuckGo) {
            logo = $('#header_wrapper');
        }
        if(logo) {
            logo.append(currentButton);
        }
        clearInterval(repeat);
    }
    $(currentButton).attr('href',switchEngine());
}

function interval() {
    readHost();
    updateButton();
}

var repeat;
(function() {
    repeat = setInterval(interval,100);
})();