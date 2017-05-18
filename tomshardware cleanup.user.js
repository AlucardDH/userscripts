// ==UserScript==
// @name         Tom's hardware cleanup
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://www.tomshardware.fr/articles*
// @grant		 GM_addStyle
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

(function() {
    'use strict';

    GM_addStyle(styleToString({selector:".author-bio",display:"none"}));
	GM_addStyle(styleToString({selector:".tags-block",display:"none"}));
    GM_addStyle(styleToString({selector:".share-bar",display:"none"}));
	GM_addStyle(styleToString({selector:'div[data-parser="psPreview"]',display:"none"}));
	
    
    
	GM_addStyle(styleToString({selector:".page-content-rightcol",display:"none"}));
    GM_addStyle(styleToString({selector:".page-content-leftcol","max-width":"initial !important"}));
    
    GM_addStyle(styleToString({selector:".p-u-sm-3-4, .p-u-sm-18-24","width":"initial !important"}));
    
    
   
	
})();