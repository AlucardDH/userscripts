// ==UserScript==
// @name			DH - 9gag hide voted
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.8
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
var FILTERED_IDS = '';

var PARAM_HASHS = 'HASHS';
var FILTERED_HASH = '';

function importFilteredIds() {
    FILTERED_IDS = getScriptParam(PARAM_IDS);
    if(!FILTERED_IDS) {
    	FILTERED_IDS = '';
    }
    console.log(FILTERED_IDS);
    FILTERED_HASH = getScriptParam(PARAM_HASHS);
    if(!FILTERED_HASH) {
    	FILTERED_HASH = '';
    }
}

function isFilteredId(id) {
    return FILTERED_IDS.indexOf(id)!=-1;
}
function isFilteredHash(hash) {
    return hash && FILTERED_HASH.indexOf(hash)!=-1;
}

function filterId(id) {
    if(!id) {
        return;
    }
    var imgJQ = getImgJQ(id);
    var hash = hashImage(imgJQ);
    if(hash && !isFilteredHash(hash)) {
        FILTERED_HASH += hash+",";
        setScriptParam(PARAM_HASHS,FILTERED_HASH);
    }
    if(isFilteredId(id)) {
        return;
    }
    FILTERED_IDS += id+",";
    setScriptParam(PARAM_IDS,FILTERED_IDS);
}

// HASH IMAGES

var HASH = false;

function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
    h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
};

function hashImage(imgJQ) {
    if(!HASH) {
        return null;
    }
    var hash = imgJQ.attr('data-hash');
    if(hash) {
        return hash;
    }
    var imgElement = imgJQ[0];
    if(!imgElement) return null;
    imgElement.crossOrigin = "Anonymous";
    imgElement.currentSrc = imgElement.src;
    var c = document.createElement('canvas');
    c.height = imgElement.naturalHeight;
    c.width = imgElement.naturalWidth;
    var ctx = c.getContext('2d');
    try {
        debugger;
        ctx.drawImage(imgElement, 0, 0, c.width, c.height);
        var base64String = c.toDataURL();
        hash = cyrb53(base64String);
        imgJQ.attr('hash',hash);
        return hash;
    } catch(e) {
        return null;
    }
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

function getImgJQ(id) {
    return $('#jsid-post-'+id+' img[alt]');
}

var MAX_PASS = 5;
var PREVIOUS_PASS = {};
function hideVoted() {
    $('.share').remove();
    $('article:not([id])').remove();
    $('.inline-ad-container').remove();
    $('.ora-player-container').closest('article').remove();

    var clean = $(".active").closest('article');
    clean.each(function(index,article) {
        var id = getId(article);
        if(isFilteredId(id)) {
            article.remove();
        } else {
            var imgJQ = getImgJQ(id);
            var hash = hashImage(imgJQ);
            if(isFilteredHash(hash)) {
                article.remove();
            } else if(!PREVIOUS_PASS['id_'+id]) {
                PREVIOUS_PASS['id_'+id] = MAX_PASS;
            } else if(PREVIOUS_PASS['id_'+id]==1) {
                filterId(id);
            } else {
                PREVIOUS_PASS['id_'+id]--;
            }
        }
    });

    if($(".badge-entry-collection").text().trim()=="") {
        $(".badge-entry-collection").css("height","100px");
    }
    if(!showVideo()) {
        $("video").closest('article').remove();
    }

    var streams = $('div[id*=stream]');
    streams.each(function(index,stream) {
        stream = $(stream);
        if(!stream.text()) {
            stream.remove();
        }
    });
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
                      hideVoted();
                  } else if(json.data && json.data.posts) {
                      setTimeout(hideVoted,1000);
/*
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
*/
                  }
              } catch(e) {
                //  debugger;
              }
          }
    });
    origOpen.apply(this, arguments);
};

importFilteredIds();
setTimeout(hideVoted,1000);
