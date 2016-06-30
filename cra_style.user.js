// ==UserScript==
// @name         DH - CRA Style
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://cra.gfi.fr/*
// @grant		 GM_addStyle
// ==/UserScript==
/* jshint -W097 */
'use strict';

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

GM_addStyle(styleToString({selector:"input.Trav","width":"100%"}));	
