// ==UserScript==
// @name            DH - Youtube hide video 2.2
// @namespace       https://github.com/AlucardDH/userscripts
// @version         2.2.1
// @author          AlucardDH
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @match           https://www.youtube.com/*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video 2 : loaded !");





// ----------------- USERSCRIPT UTILS -----------------

var SCRIPT_BASE = "YTH";

function setScriptParam(key,value) {
    GM_setValue(SCRIPT_BASE+"_"+key,value);
}

function getScriptParam(key) {
    return GM_getValue(SCRIPT_BASE+"_"+key);
}

function hasScriptParam(key) {
    return getScriptParam(key);
}

// ----------------- MLAB UTILS -----------------

var MLAB_BASE_URL = "https://api.mlab.com/api/1";
var MLAB_DATABASE_KEY = "MLAB_DB";
var MLAB_APIKEY_KEY = "MLAB_APIKEY";

unsafeWindow.mlabLogin = function(database,apiKey) {
    setScriptParam(MLAB_DATABASE_KEY,database);
    setScriptParam(MLAB_APIKEY_KEY,apiKey);

    oldImport();
    importFromMlab();
};

function mlabIsLogged() {
    //console.log(getScriptParam(MLAB_APIKEY_KEY),getScriptParam(MLAB_DATABASE_KEY));
    return hasScriptParam(MLAB_APIKEY_KEY) && hasScriptParam(MLAB_DATABASE_KEY);
}

function mlabFormattedKey() {
    return "?apiKey="+getScriptParam(MLAB_APIKEY_KEY);
}

function mlabAddDocumentToCollection(collection,document) {
    if(!mlabIsLogged()) {
        return;
    }

    GM_xmlhttpRequest({
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+mlabFormattedKey(),
        data: JSON.stringify(document)
    });
}

function mlabGetCollection(collection,onSuccess) {
    if(!mlabIsLogged()) {
        return;
    }

    GM_xmlhttpRequest({
        method: "GET",
        responseType :"json",
        url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+mlabFormattedKey(),
        onload:  function(result) {
            var data = result.response;
            console.log(data);
            onSuccess(data);
        }
    });
}

function mlabGetDocument(collection,documentId,onSuccess) {
    if(!mlabIsLogged()) {
        return;
    }

    GM_xmlhttpRequest({
        method: "GET",
        responseType :"json",
        url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+"/"+documentId+mlabFormattedKey(),
        onload:  function(result) {
            var data = result.response;
            console.log(data);
            onSuccess(data);
        }
    });
}

// ----------------- FILTERS -----------------

var MLAB_COLLECTION_IDS = SCRIPT_BASE+"_IDS";
var FILTERED_IDS = "";

function filterId(id) {
    if(isFilteredId(id)) {
        return;
    }

    var filter = {'_id':id,'date':new Date().toISOString()};
    FILTERED_IDS += id+",";

    mlabAddDocumentToCollection(MLAB_COLLECTION_IDS,filter)
}

function isFilteredId(id) {
    return FILTERED_IDS.indexOf(id)!=-1;
}

function importFilteredIds() {
    mlabGetCollection(MLAB_COLLECTION_IDS,function(result) {
        result.forEach(function(filter){
            FILTERED_IDS += filter['_id']+",";
        });
    });
}

var MLAB_COLLECTION_TITLES = SCRIPT_BASE+"_TITLES";
var FILTERED_TTITLES = [];

// title can be a string or an array
// youtuber is optionnal
unsafeWindow.filterTitle = function(title,youtuber) {
    if(!Array.isArray(title)) {
        title = [title];
    }

    var filter = {'parts':title,'date':new Date().toISOString()};
    if(youtuber) {
        filter.youtuber = youtuber;
    }
    FILTERED_TTITLES.push(filter);

    mlabAddDocumentToCollection(MLAB_COLLECTION_TITLES,filter);
}

function getFilterTitleSelector(filter) {
    if(filter.selector) {
        return filter.selector;
    }

    var result = '';
    filter.parts.forEach(function(p) {
        result += '[title*="'+p+'" i]';
    });
    filter.selector = result;

    return result;
}

function importFilteredTitles() {
    mlabGetCollection(MLAB_COLLECTION_TITLES,function(result) {
        result.forEach(function(filter){
            FILTERED_TTITLES.push(filter);
        });
    });
}

// ----------------- OLD IMPORT -----------------

var OLD_COLLECTION = "YTH";
var OLD_DOCUEMENT_ID = "youtubeIds";
var OLD_MATCH_PREFIX = "MATCH_";

function oldImport() {
    mlabGetDocument(OLD_COLLECTION,OLD_DOCUEMENT_ID,function(result){
        var content = result.content;
        var items = content.split(',');
        items.forEach(function(item){
            if(item.indexOf(OLD_MATCH_PREFIX)>-1) {
                item = item.substring(OLD_MATCH_PREFIX.length);
                filterTitle(item.split('&&'));
            } else if(item) {
                filterId(item);
            }
        });
    });
}

// ----------------- NEW IMPORT -----------------

function importFromMlab() {
    importFilteredIds();
    importFilteredTitles();
}

// ----------------- STATS -----------------
var TITLES = {};


function getVideoYoutuber(item) {
	var elements = item.find('#byline');
    return elements!=null && elements.length>0 ? $(elements[0]).attr("title") : null;
}

function getVideoTitle(item) {
	var elements = item.find('#video-title');
    return elements!=null && elements.length>0 ? $(elements[0]).attr("title").toLowerCase() : null;
}

function getChannelYoutuber() {
	var elements = $('#channel-title');
	return elements!=null && elements.length>0 ? $('#channel-title')[0].innerText : null;
}

function addStats(item) {
    var title = getVideoTitle(item);

    var youtuber = getVideoYoutuber(item);
    if(youtuber.length==0) youtuber = getChannelYoutuber();

    if(!TITLES[youtuber]) {
        TITLES[youtuber] = [];
    }

    TITLES[youtuber].push(title);
}


unsafeWindow.getStats = function(youtuber) {
	if(!youtuber) {
		youtuber = getChannelYoutuber();
	}

    if(!TITLES[youtuber]) {
        return [];
    }

    var results = {};
    var resultsToSort = [];

    TITLES[youtuber].forEach(function(title1) {
    	for(var iEnd=title1.length;iEnd>3;iEnd--) {
    		for(var iStart=0;iStart<iEnd-3;iStart++) {
    			var subTitle = title1.substring(iStart,iEnd);
    			if(results[subTitle]) {
    				continue;
    			}
                
    			results[subTitle] = {
    				string:subTitle,
    				count:1,
    				titles:[title1]
    			};

    			TITLES[youtuber].forEach(function(title2) {
    				if(title2!=title1 && title2.indexOf(subTitle)>-1) {
    					results[subTitle].count++;
    					results[subTitle].titles.push(title2);
    				}
    			});

    			var skip = false;
    			for(var iSearch=resultsToSort.length-1;iSearch>-1;iSearch--) {
    				if(skip) continue;
    				var previous = resultsToSort[iSearch];
    				if(previous.string.indexOf(subTitle)>-1 && results[subTitle].count==previous.count) {
    					skip = true;
    				}
    			}

    			if(!skip && results[subTitle].count>1) {
    				resultsToSort.push(results[subTitle]);
    			}
    		}
    	}
    });

    var weight = function(obj) {
    	return obj.count*obj.string.length;
    };
    resultsToSort.sort(function(a, b){
        return weight(b) - weight(a);
    });

    return resultsToSort;
}

var SHOW_BUTTONS = 3;
unsafeWindow.addHideSeriesButtons = function() {
	$('.removeSeries').remove();

	var stats = {};

	$.each($("ytd-grid-video-renderer"),function(index,element) {

        setTimeout(function(){
        	var e = $(element);
	        var youtuber = getVideoYoutuber(e);
			if(!youtuber || youtuber.length==0) {
	        	youtuber = getChannelYoutuber();
	        }
	        if(!stats[youtuber]) {
	        	stats[youtuber] = getStats(youtuber);
	        }

	        var title = getVideoTitle(e);
	        var showed = 0;

        	for(var i=0;showed<SHOW_BUTTONS && i<stats[youtuber].length;i++) {
	        	if($.inArray(title,stats[youtuber][i].titles)!=-1) {
	        		var str = stats[youtuber][i].string;
	        		//ytd-subscribe-button-renderer
					var a = $('<paper-button class=" removeSeries" subscribed style="display:inline-block;" title="'+str+'">Cacher "'+str+'"</paper-button>');
	                a.click(function(e){
	                    filterTitle(e.target.title,youtuber);
	                });
	                e.append(a);
	                showed++;
	        	}
	        }
	        console.log('Done :',title);
	    },10);
    });
}


// ----------------- APPLY FILTERS -----------------

function hideViewed() {
    $("ytd-thumbnail-overlay-playback-status-renderer").closest('ytd-grid-video-renderer').remove();
    $("ytd-thumbnail-overlay-resume-playback-renderer").closest('ytd-grid-video-renderer').remove();
}

function hideFilteredTitles() {
    FILTERED_TTITLES.forEach(function(filter){
        var titleFiltered = $('a'+getFilterTitleSelector(filter)).closest('ytd-grid-video-renderer')
        if(filter.youtuber) {
            $.each(titleFiltered,function(index,element) {
                var e = $(element);
                var youtuber = getVideoYoutuber(e);
                if(youtuber==filter.youtuber) {
                    e.remove();
                }
            });
        } else {
            titleFiltered.remove();
        }
    });
}

function hideFilteredIds(statsOnly) {
    var newStats = false;

    $.each($("ytd-grid-video-renderer"),function(index,element) {
        var e = $(element);
        var itemId = $(e.find('a')[0]).attr("href");
        itemId.substring(itemId.indexOf('=')+1);
        if(itemId.indexOf('?')>-1) {
            itemId.substring(0,itemId.indexOf('?'));
        }
        if(!e.hasClass("dhdone")) {
            addStats(e);
            newStats = true;
            if(statsOnly) {
                e.addClass("dhdone");
            }
        }

        if(!statsOnly) {
            if(isFilteredId(itemId)) {
                e.remove();
            } else {
                if(!e.hasClass("dhdone")) {
                    var a = $('<paper-button class="ytd-subscribe-button-renderer" subscribed style="display:inline-block;">Cacher</paper-button>');
                    a.click(function(){
                        filterId(itemId);
                    });
                    e.append(a);
                    e.addClass("dhdone");
                }
            }
        }
    });

    if(newStats) console.log(TITLES);
}

function hideWatched() {
    var subscriptions = window.location.href.indexOf('https://www.youtube.com/feed/subscriptions')>-1;

    if(subscriptions) {
        hideViewed();
        hideFilteredTitles();
    }

    hideFilteredIds(!subscriptions);
}

importFromMlab();
setInterval(hideWatched,1000);