// ==UserScript==
// @name			DH - 9gag hide voted
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.6
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @match        	https://9gag.com/*
// @exclude        	https://9gag.com/gag*
// @exclude         https://9gag.com/u/alucarddh/*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           unsafeWindow
// ==/UserScript==

console.log("DH - 9gag hide voted : loaded !");

// ----------------- USERSCRIPT UTILS -----------------

var SCRIPT_BASE = "9GAG";

function setScriptParam(key,value) {
    GM_setValue(SCRIPT_BASE+"_"+key,value);
}

function getScriptParam(key) {
    return GM_getValue(SCRIPT_BASE+"_"+key);
}

function hasScriptParam(key) {
    return getScriptParam(key);
}

// ----------------- VOTED -----------------

var PARAM_IDS = 'IDS';
var FILTERED_IDS = "";

function importFilteredIds() {
    FILTERED_IDS = getScriptParam(PARAM_IDS);
    if(!FILTERED_IDS) {
    	FILTERED_IDS = '';
    }
    console.log(FILTERED_IDS);
}

function isFilteredId(id) {
    return FILTERED_IDS.indexOf(id)!=-1;
}

function filterId(id) {
    if(!id) {
        return;
    }
    if(isFilteredId(id)) {
        return;
    }
    FILTERED_IDS += id+",";
    setScriptParam(PARAM_IDS,FILTERED_IDS);
}


// ------------- VIDEO -------------

var SHOW_VIDEOS = 'showVideos';
function showVideo() {
    var value = getScriptParam(SHOW_VIDEOS);
    if(value===false) {
        return false;
    } else {
        return true;
    }
}

unsafeWindow.showVideos = function() {
    if(!showVideo()) {
        setScriptParam(SHOW_VIDEOS,true);
        document.location.reload();
    }
};

unsafeWindow.hideVideos = function() {
    if(showVideo()) {
        setScriptParam(SHOW_VIDEOS,false);
    }
};

function getId(article) {
    if(article.id)
    return article.id ? article.id.replace('jsid-post-','') : null;
}

var MAX_PASS = 5;
var PREVIOUS_PASS = {};
function hideVoted() {
    $('article:not([id])').remove();

    $('.ora-player-container').closest('article').remove();

    var clean = $(".active").closest('article');
    clean.each(function(index,article) {
        var id = getId(article);
        if(isFilteredId(id)) {
            article.remove();
        } else if(!PREVIOUS_PASS['id_'+id]) {
            PREVIOUS_PASS['id_'+id] = MAX_PASS;
        } else if(PREVIOUS_PASS['id_'+id]==1) {
            filterId(id);
        } else {
            PREVIOUS_PASS['id_'+id]--;
        }
    });

    if($(".badge-entry-collection").text().trim()=="") {
        $(".badge-entry-collection").css("height","100px");
    }
    if(!showVideo()) {
        $("video").closest('article').remove();
    }
}

$("#sidebar-content").remove();

var origOpen = XMLHttpRequest.prototype.open;
unsafeWindow.XMLHttpRequest.prototype.open = function() {
    this.addEventListener('loadend', function() {
        // if status 2x and responseText...
        console.log('request loadend');
        console.log(this);
        if(this.responseText)  {
              try {
                  var json = JSON.parse(this.responseText);
                  if(json.score && json.id) {
                      filterId(json.id);
                  } else if(json.data && json.data.posts) {
                      var filtered = [];
                      json.data.posts.forEach(function(p) {
                          if(!isFilteredId(p.id) && (showVideo() || p.type!='Animated')) {
                              filtered.push(p);
                          }
                      });
                      //console.log('Filtered !',json.data.posts,filtered);
                      json.data.posts = filtered;

                      Object.defineProperty(this, "responseText", {writable: true});
                      Object.defineProperty(this, "response", {writable: true});

                      this.responseText = JSON.stringify(json);
                      this.response = json;
                  }
              } catch(e) {
                //  debugger;
              }
          }
    });
    origOpen.apply(this, arguments);
};

importFilteredIds();
setInterval(hideVoted,1000);
