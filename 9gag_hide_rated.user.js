// ==UserScript==
// @name			DH - 9gag hide voted
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.1
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @match        	http://9gag.com/*
// @exclude        	http://9gag.com/gag*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

console.log("DH - 9gag hide voted : loaded !");

function hideVoted() {
    $(".active").closest('article').remove();
    if($(".badge-entry-collection").text().trim()=="") {
        $(".badge-entry-collection").css("height","100px");
    }
}

$("#sidebar-content").remove();
setInterval(hideVoted,1000);