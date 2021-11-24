// ==UserScript==
// @name         Gmail remove ads
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Hide Gmail ads in mailbox
// @author       AlucardDH
// @match        https://mail.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @require         https://zeptojs.com/zepto.min.js
// @grant		    GM_addStyle
// ==/UserScript==

var ALREADY_HIDDEN = [];

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

function cleanAds() {
    $('.ast').closest('table').forEach(table=>{
        var id = table.id;
        if(!ALREADY_HIDDEN.includes(id)) {
            console.log('hidding',id);
            GM_addStyle(styleToString({selector:"#\\"+id,display:"none !important"}));
            ALREADY_HIDDEN.push(id);
        }
    });
}

var INTERVAL = setInterval(cleanAds,1000);