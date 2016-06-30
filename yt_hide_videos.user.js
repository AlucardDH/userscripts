// ==UserScript==
// @name			DH - Youtube hide video
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.7
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @downloadURL		https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @updateURL		https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @match        	https://www.youtube.com/feed/subscriptions*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// @grant			GM_listValues
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video : loaded !");

var SCRIPT_BASE = "YTH";
var MATCH_PREFIX = "MATCH_";

unsafeWindow.matches = [];

unsafeWindow.mangoLogin = function(database,apiKey) {
    GM_setValue(SCRIPT_BASE+"_mango_database",database);
    GM_setValue(SCRIPT_BASE+"_mango_apiKey",apiKey);
    importFromMango();
};

function checkMango() {
   return GM_getValue(SCRIPT_BASE+"_mango_database")!=null && GM_getValue(SCRIPT_BASE+"_mango_apiKey")!=null;
}

function getMangoCollectionUrl() {
    return "https://api.mongolab.com/api/1/databases/"+GM_getValue(SCRIPT_BASE+"_mango_database")+"/collections/YTH";
}

function getMangoDocumentYoutubeIds() {
    return getMangoCollectionUrl()+"/youtubeIds";
}

function getMangoApiKey() {
    return "?apiKey="+GM_getValue(SCRIPT_BASE+"_mango_apiKey");
}

function exportToMango() {
    if(checkMango()) {
        GM_xmlhttpRequest({
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            url: getMangoCollectionUrl()+getMangoApiKey(),
            data: JSON.stringify( { "_id" : "youtubeIds","content":unsafeWindow.exportHidden() } )
        });
    }
}

function importFromMango() {
    if(checkMango()) {
        console.log("Import from Mango : "+getMangoDocumentYoutubeIds()+getMangoApiKey());
        GM_xmlhttpRequest({
            method: "GET",
            responseType :"json",
            url: getMangoDocumentYoutubeIds()+getMangoApiKey(),
            onload:  function(data) {
                 unsafeWindow.importHidden(data.response.content);
            }
        });
    }
}

unsafeWindow.exportHidden = function() {
    var result = "";
    
	var keys = GM_listValues();
    for (var i=0,key=null; key=keys[i]; i++) {
        if(!key.startsWith(SCRIPT_BASE)) {
            if(result.length>0) result += ",";
            result += key;
        }
    }
    return result;
};

unsafeWindow.importHidden = function(idsString) {
    var keys = idsString.split(",");
    for (var i=0,key=null; key=keys[i]; i++) {
        GM_setValue(key,true);
        if(key.startsWith(MATCH_PREFIX)) {
            matches.push(key.substring(MATCH_PREFIX.length));
        }
    }
    exportToMango();
};

function isHidden(itemId) {
    return GM_getValue(itemId);
}

function hide(itemId,exportWeb) {
    GM_setValue(itemId,true);
    if(exportWeb) exportToMango();
}

unsafeWindow.hideMatch = function(text,exportWeb)  {
    GM_setValue(MATCH_PREFIX+text,true);
    matches.push(text);
    if(exportWeb) exportToMango();
};

unsafeWindow.hideTitles = function(title,exportWeb) {
	$.each($('a[title*="'+title+'"]').closest(".yt-lockup"),function(index,element) {
        var e = $(element);
        var itemId = e.attr("data-context-item-id");
		hide(itemId,false);
    });
    if(exportWeb) exportToMango();
};

function hideWatched() {
    $(".watched-badge").closest('.yt-shelf-grid-item').remove();
    $.each(matches,function(index,text) {
        hideTitles(text);
    });
    exportToMango();
    $.each($(".yt-lockup"),function(index,element) {
        var e = $(element);
        var itemId = e.attr("data-context-item-id");
        if(isHidden(itemId)) {
            e.closest('.yt-shelf-grid-item').remove();
        } else {
            if(!e.hasClass("dhdone")) {
                var a = $('<a>Cacher</a>');
                a.click(function(){hide(itemId,true);});
                e.append(a);
                e.addClass("dhdone");
            }
        }
    });
}

importFromMango();
setInterval(hideWatched,1000);