// ==UserScript==
// @name            DH - Youtube hide video
// @namespace       https://github.com/AlucardDH/userscripts
// @version         0.10.0
// @author          AlucardDH
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @match           https://www.youtube.com/feed/subscriptions*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video 2 : loaded !");

var SCRIPT_BASE = "YTH";
var MATCH_PREFIX = "MATCH_";

var MATCH_PATTERN = /MATCH_(.*?),/g;

var data = "";

unsafeWindow.mangoLogin = function(database,apiKey) {
    GM_setValue(SCRIPT_BASE+"_mango_database",database);
    GM_setValue(SCRIPT_BASE+"_mango_apiKey",apiKey);
    importFromMango();
};

function checkMango() {
   return GM_getValue(SCRIPT_BASE+"_mango_database")!=null && GM_getValue(SCRIPT_BASE+"_mango_apiKey")!=null;
}

function getMangoCollectionUrl() {
    return "https://api.mlab.com/api/1/databases/"+GM_getValue(SCRIPT_BASE+"_mango_database")+"/collections/YTH";
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
            data: JSON.stringify( { "_id" : "youtubeIds","content":data } )
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
            onload:  function(result) {
                data = result.response.content;
                console.log("data from Mango",data);
        //         unsafeWindow.importHidden(data.response.content);
            }
        });
    }
}

function isHidden(itemId) {
    return data.indexOf(itemId)!=-1;
}

function hide(itemId,exportWeb) {
    data += itemId+',';
    if(exportWeb) exportToMango();
}

unsafeWindow.hideMatch = function(text)  {
    data += MATCH_PREFIX+text+',';
    exportToMango();
};

unsafeWindow.hideTitles = function(title,exportWeb) {
    $('a[title*="'+title+'"]').closest('.yt-shelf-grid-item').remove();
};

function hideWatched() {
    $("ytd-thumbnail-overlay-playback-status-renderer").closest('ytd-grid-video-renderer').remove();
    $("ytd-thumbnail-overlay-resume-playback-renderer").closest('ytd-grid-video-renderer').remove();

    var titleMatch;
    while ((titleMatch = MATCH_PATTERN.exec(data)) != null) {
        $('a[title*="'+titleMatch[1]+'"]').closest('ytd-grid-video-renderer').remove();
    }

    $.each($("ytd-grid-video-renderer"),function(index,element) {
        var e = $(element);
        var itemId = $(e.find('a')[0]).attr("href");
        itemId.substring(itemId.indexOf('=')+1);
        if(itemId.indexOf('?')>-1) {
            itemId.substring(0,itemId.indexOf('?'));
        }
        if(isHidden(itemId)) {
            e.remove();
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