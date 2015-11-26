// ==UserScript==
// @name			DH - Youtube hide video
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.4
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @downloadURL		https://github.com/AlucardDH/userscripts/raw/master/yt_hide_videos.user.js
// @updateURL		https://github.com/AlucardDH/userscripts/raw/master/yt_hide_videos.user.js
// @match        	https://www.youtube.com/feed/subscriptions*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// @grant			GM_listValues
// @grant			unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video : loaded !");
unsafeWindow.exportHidden = function() {
    var result = "";
    
	var keys = GM_listValues();
    for (var i=0,key=null; key=keys[i]; i++) {
        if(result.length>0) result += ",";
        result += key;
    }
	console.log(result);
}

unsafeWindow.importHidden = function(idsString) {
	var keys = idsString.split(",");
    for (var i=0,key=null; key=keys[i]; i++) {
        hide(key);
    }
}

function isHidden(itemId) {
    return GM_getValue(itemId);
}

function hide(itemId) {
    GM_setValue(itemId,true);
}

function hideWatched() {
    $(".watched-badge").closest('.yt-shelf-grid-item').remove();
    $.each($(".yt-lockup"),function(index,element) {
        var e = $(element);
        var itemId = e.attr("data-context-item-id");
        if(isHidden(itemId)) {
            e.closest('.yt-shelf-grid-item').remove();
        } else {
            if(!e.hasClass("dhdone")) {
                var a = $('<a>Cacher</a>');
                a.click(function(){hide(itemId);});
                e.append(a);
                e.addClass("dhdone");
            }
        }
    });
}

setInterval(hideWatched,1000);