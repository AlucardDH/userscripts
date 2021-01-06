// ==UserScript==
// @name			DH - 9gag hide voted
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.12.0
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @downloadURL     https://github.com/AlucardDH/userscripts/raw/master/9gag_hide_rated.user.js
// @updateURL       https://github.com/AlucardDH/userscripts/raw/master/9gag_hide_rated.user.js
// @match        	https://9gag.com/*
// @exclude        	https://9gag.com/gag*
// @exclude         https://9gag.com/u/alucarddh/*
// @require 	 	https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant		    GM_addStyle
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

// ----------------- CSS -----------------

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

GM_addStyle(styleToString({selector:".share","display":"none"}));
GM_addStyle(styleToString({selector:"a.badge-track,.post-view.gif-post,.post-view.video-post,video,section#list-view-2 .post-container a img","width":"700px !important","padding-left":"0px !important"}));

// ----------------- VOTED -----------------

var PARAM_IDS = 'IDS';
var FILTERED_IDS = '';

function importFilteredIds() {
    FILTERED_IDS = getScriptParam(PARAM_IDS);
    if(!FILTERED_IDS) {
    	FILTERED_IDS = '';
    }
    console.log(FILTERED_IDS);
}

unsafeWindow.isFilteredId = function(id) {
    var index = FILTERED_IDS.indexOf(id);
    if(index==-1) return 0;
    var score = FILTERED_IDS.substr(index+id.length,1);
    if(score=='d') return -1;
    else return 1;
    //return FILTERED_IDS.indexOf(id)!=-1;
}

function filterId(id,score) {
    if(!id) {
        return;
    }
    if(isFilteredId(id)) {
        return;
    }
    FILTERED_IDS += id+(score ? score:'')+",";
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
    return article.id ? article.id.replace('jsid-post-','') : null;
}

function hideVoted() {
    $('iframe').remove();
    $('.share').remove();
    $('article:not([id])').remove();
    $('.inline-ad-container').remove();
    $('.ora-player-container').closest('article').remove();

    var clean = $('.active').closest('article');
    clean.each(function(index,article) {
        var id = getId(article);
        if(isFilteredId(id)) {
            article.remove();
        } else {
            var score = $(article).find('.active');
            score = score.hasClass('up') ? 'u' :'d';
            if(score!=0) {
                filterId(id,score);
                article.remove();
            }
        }
    });
    clean = $('article');
    clean.each(function(index,article) {
        var id = getId(article);
        article = $(article);
        var score = score = isFilteredId(id)
        if(score==-1 && article.find('.down').length>0) {
            article.find('.down')[0].click();
        } else if(score==1 && article.find('.up').length>0) {
            article.find('.up')[0].click();
        } else if(article.text()=='') {
            article.remove();
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

    //bigiffy();
}

function bigiffy() {
    $('article img[alt]').each(function(index,img) {
        img = $(img);
        var url = img.attr('src');
        img.attr('src',url.replace(/460s\.jpg$/,'700b\.jpg'));
        img.css('width','700px !important');
    });
}

var POST_COUNT = 0;
var MIN_TIMESTAMP = new Date().getTime()/1000;
function setTimestamp(newTs) {
    if(newTs<MIN_TIMESTAMP) {
        MIN_TIMESTAMP = newTs;
    }
    $('.featured-tag').text(POST_COUNT+" posts : "+new Date(newTs*1000));
}

var UPDOWN = 1;
var SCROLLED_UP = false;
var previousScrollHeight = 0;
function autoScroll() {
    var height = $($('div.page')[0]).height();
    var sY = scrollY + visualViewport.height;
    if(scrollY>0 && sY<height) {
        // do not scroll while reading
    }else if(height!=previousScrollHeight || height<4000) {
        scrollBy(0,UPDOWN*height);
        UPDOWN *= -1;
        SCROLLED_UP = false;
        previousScrollHeight = height;
    } else if(!SCROLLED_UP) {
        scrollBy(0,-height);
        SCROLLED_UP = true;
    }
}

$("#sidebar-content").remove();

var DELAY = 500;
var nextTime = 0;

function planNext() {
    var now = new Date().getTime();
    if(nextTime<now) {
        nextTime=now+DELAY;
        setTimeout(hideVoted,DELAY);
    }
}

var origOpen = XMLHttpRequest.prototype.open;
unsafeWindow.XMLHttpRequest.prototype.open = function() {
    this.addEventListener('loadend', function() {
        // if status 2x and responseText...
        //console.log('request loadend');
        //console.log(this);

        try {
            var json;
            if((this.responseType=='text' || this.responseType=='') && this.responseText) {
                json = JSON.parse(this.responseText);
            } else if(this.responseType='json') {
                json = this.response;
            }
            var url = this.responseURL;
            if(json) {
                if(!json.score) {
                    if(url.match(/\/like$/)) {
                        json.score=1;
                    } else if(url.match(/\/dislike$/)) {
                        json.score=-1;
                    }
                }
                if(json.score) {
                    if(json.id) {
                        filterId(json.id,json.score==1 ? "u":"d");
                    }
                    planNext();
                } else if(json.data && json.data.posts) {
                    //LOAD_COUNT++;
                    POST_COUNT+= 10;
                    $.each(json.data.posts,function(index,post) {
                        setTimestamp(post.creationTs);
                    });
                    planNext();
                }
            }
        } catch(e) {
            //  debugger;
        }
    });
    origOpen.apply(this, arguments);
};

importFilteredIds();
planNext();

setInterval(autoScroll,1000);
