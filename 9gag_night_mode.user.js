// ==UserScript==
// @name			DH - 9gag night mode
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.1.3
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @match        	https://9gag.com/*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant		    GM_addStyle
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

GM_addStyle(styleToString({selector:"body","background-color":"#141414 !important"}));
GM_addStyle(styleToString({selector:".page","padding-top":"0 !important"}));
GM_addStyle(styleToString({selector:"div","background":"transparent !important","color":"white"}));
GM_addStyle(styleToString({selector:"a","color":"white !important"}));
GM_addStyle(styleToString({selector:"h1","color":"white !important"}));
GM_addStyle(styleToString({selector:".section-sidebar","background":"black !important"}));
GM_addStyle(styleToString({selector:".section-sidebar *","color":"white !important"}));
GM_addStyle(styleToString({selector:"section#sidebar","height":"2000px !important"}));
GM_addStyle(styleToString({selector:".share","display":"none"}));
GM_addStyle(styleToString({selector:"a.btn","background":"black !important","color":"white"}));
GM_addStyle(styleToString({selector:".notification-list li *","background":"black !important"}));
GM_addStyle(styleToString({selector:".featured-tag","position":"fixed !important","z-index":"1000","margin-top":"-24px","background":"black !important"}));

setInterval(function() {
    $("#sidebar-content").remove();
    $(".board-system").remove();
    $('video').attr('controls','true');
},100);
$(function(){
    GM_addStyle(styleToString({selector:"body","background-image":"url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAwCAAAAABVxyezAAAACXBIWXMAAABIAAAASABGyWs+AAAAiElEQVQ4y9VUQQrAMAjLxU/4/4eOdUisKLa3KaxUSUJs6yD6hoisz8dXgytoAKwcO1405gS41efnCqWHtgtJ2VSBcSPfNEB2AlgeOoXeQ3oC3KPq3wLVCRJQ3MG5QutBUz5r0JRNlQ3g+aaxA4LKvULjwfO4nzEXF138+i7aFzVgLtrpnvCPegA6UHyBw8URxgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAASUVORK5CYII=)"}));
});
