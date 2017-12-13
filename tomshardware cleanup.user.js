// ==UserScript==
// @name         Tom's hardware cleanup
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  try to take over the world!
// @author       You
// @match        http://www.tomshardware.fr*
// @match        https://www.tomshardware.fr*
// @match        http://www.tomshardware.fr/articles/*
// @match        http://www.tomshardware.fr/g00/articles/
// @match        http://www.tomshardware.com*
// @match        https://www.tomshardware.com*
// @grant		 GM_addStyle
// ==/UserScript==

//http://www.tomshardware.fr/g00/articles/ssd-samsung-evo-promos,1-65998.html?i10c.encReferrer=aHR0cDovL3d3dy50b21zaGFyZHdhcmUuZnIvYXJ0aWNsZXMvc3NkLXNhbXN1bmctZXZvLXByb21vcywxLTY1OTk4Lmh0bWw%3D

console.log('Toms hardware clean up !');

function styleToString(style) {
	var result = style.selector;
	result += "{";
	for(var property in style) {
		if(property.indexOf("elector")<0) {
			result += property+":"+style[property]+";";
		}
	}
	result += "}";
    console.log(result);

	return result;
}

(function() {
    'use strict';

    GM_addStyle(styleToString({selector:".author-bio",display:"none"}));
	GM_addStyle(styleToString({selector:".tags-block",display:"none"}));
    GM_addStyle(styleToString({selector:".share-bar",display:"none"}));
	GM_addStyle(styleToString({selector:'div[data-parser]',display:"none"}));



	GM_addStyle(styleToString({selector:".page-content-rightcol",display:"none"}));
    GM_addStyle(styleToString({selector:".page-content-leftcol","max-width":"initial !important"}));

    GM_addStyle(styleToString({selector:".p-u-sm-3-4, .p-u-sm-18-24","width":"initial !important"}));




})();