// ==UserScript==
// @name			DH - 9gag night mode
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.1.2
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @match        	https://9gag.com/*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant		 GM_addStyle
// ==/UserScript==

console.log("DH - 9gag night mode : loaded !");

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

GM_addStyle(styleToString({selector:"body","background":"black"}));
GM_addStyle(styleToString({selector:"div","background":"transparent !important","color":"white"}));
GM_addStyle(styleToString({selector:"a","color":"white !important"}));
GM_addStyle(styleToString({selector:"h1","color":"white !important"}));
GM_addStyle(styleToString({selector:".section-sidebar","background":"black !important"}));
GM_addStyle(styleToString({selector:".section-sidebar *","color":"white !important"}));
GM_addStyle(styleToString({selector:".share","display":"none"}));
GM_addStyle(styleToString({selector:"a.btn","background":"black !important","color":"white"}));
GM_addStyle(styleToString({selector:".notification-list li *","background":"black !important"}));

setTimeout(function(){
    GM_addStyle(styleToString({selector:"body","background-image":"url('http://colourlovers.com.s3.amazonaws.com/images/patterns/2/2875.png?1197341146')"}));
    $("#sidebar-content").remove();
},100);

setInterval(function() {
	$('video').attr('controls','true');
},100);

