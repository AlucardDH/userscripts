// ==UserScript==
// @name            DH - Youtube hide video
// @namespace       https://github.com/AlucardDH/userscripts
// @version         2.7.2
// @author          AlucardDH
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @updateURL       https://raw.githubusercontent.com/AlucardDH/userscripts/master/yt_hide_videos.user.js
// @match           https://www.youtube.com/*
// @require         https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require         https://cdnjs.cloudflare.com/ajax/libs/parse/2.19.0/parse.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_xmlhttpRequest
// @grant           unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video 2.7.2 : loaded !");


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

// Database commons
var COLLECTION_IDS = SCRIPT_BASE+"_IDS";
var COLLECTION_TITLES = SCRIPT_BASE+"_TITLES";


// ----------------- Local database -----------------
var localDatabase = {

    init : function() {
        // nothing to do here
    },

    setCollection : function(collectionId,collection) {
        setScriptParam(collectionId,JSON.stringify(collection));    
    },

    getCollection : function(collectionId,onSuccess) {
        var collection = getScriptParam(collectionId);
        try {
            collection = JSON.parse(collection); 
        } catch(e) {
            collection = [];
        }
        onSuccess(collection);
    },

    addDocumentToCollection : function(collectionId,document) {
        localDatabase.getCollection(collectionId,function(collection) {
            collection.push(document);
            localDatabase.setCollection(collectionId,collection);    
        });
    },

    formatFilterId : function(id,watched) {
        var filter = {'_id':id,'date':new Date().toISOString()};
        if(watched) {
            filter.watched = true;
        }
        return filter;
    },

    parseFilterId(obj) {
        return obj;
    },

    formatFilterTitle : function(titleParts,youtuber) {
        var filter = {'parts':titleParts,'date':new Date().toISOString()};
        if(youtuber) {
            filter.youtuber = youtuber;
        }
        return filter;
    },

    parseFilterTitle(obj) {
        return obj;
    }
};

// ----------------- Back4App -------------------
var B4A_BASE_URL = 'https://parseapi.back4app.com';
var B4A_APP_ID_KEY = "B4A_APP_ID";
var B4A_JS_KEY_KEY = "B4A_JS_KEY";

var b4aId;
var b4aTitle;
var b4aClasses = {};

var b4aDatabase = {
    login : function(appId,jsKey) {
        setScriptParam(B4A_APP_ID_KEY,appId);
        setScriptParam(B4A_JS_KEY_KEY,jsKey);

        importFromDatabase();
    },

    init : function() {
        if(b4aDatabase.isLogged()) {
            console.log('YTH - Init b4aDatabase');
            Parse.serverURL = B4A_BASE_URL; // This is your Server URL
            Parse.initialize(
              getScriptParam(B4A_APP_ID_KEY), // This is your Application ID
              getScriptParam(B4A_JS_KEY_KEY) // This is your Javascript key
            );

            b4aId = Parse.Object.extend(COLLECTION_IDS);
            b4aTitle = Parse.Object.extend(COLLECTION_TITLES);
            b4aClasses[COLLECTION_IDS] = b4aId;
            b4aClasses[COLLECTION_TITLES] = b4aTitle;
        }
    },

    isLogged : function() {
        return hasScriptParam(B4A_APP_ID_KEY) && hasScriptParam(B4A_JS_KEY_KEY);
    },

    setCollection : function(collectionId,collection) {
        // todo
    },

    getCollection : async function(collectionId,onSuccess) {
        var query = new Parse.Query(b4aClasses[collectionId]);
        query.find().then(onSuccess,function(error){
            console.log('Error while getting ',collectionId,error);
        });
    },

    addDocumentToCollection : async function(collectionId,document) {
        document.save();
    },

    formatFilterId(id,watched) {
        var obj = new b4aId();
        obj.set('videoId',id);
        obj.set('watched',watched);
        return obj;
    },

    parseFilterId(obj) {
        return {
            '_id':obj.get('videoId'),
            'watched':obj.get('watched')
        }
    },

    formatFilterTitle(titleParts,youtuber) {
        var obj = new b4aTitle();
        obj.set('title',titleParts);
        obj.set('youtuber',youtuber);
        return obj;
    },

    parseFilterTitle(obj) {
        return {'parts':obj.get('title'),'youtubers':obj.get('youtuber')};
    }
};

unsafeWindow.b4aLogin = function(appId,jsKey) {
    b4aDatabase.login(appId,jsKey);
};


// ----------------- ABSTRACTION DATABASTE -----------------

var DATABASE;

function initDatabase() {
    if(b4aDatabase.isLogged()) {
        DATABASE = b4aDatabase;
        DATABASE.init();
    } else {
        DATABASE = localDatabase;
    }
}

// ----------------- FILTERS -----------------

var FILTERED_IDS = "";
var IMPORTED_FILTERED_IDS = false;

function filterId(id,watched) {
    if(isFilteredId(id)) {
        return;
    }

    FILTERED_IDS += id+",";

    DATABASE.addDocumentToCollection(COLLECTION_IDS,DATABASE.formatFilterId(id,watched));
}

function isFilteredId(id) {
    return FILTERED_IDS.indexOf(id)!=-1;
}

function importFilteredIds() {
    console.log('YTH - Import filtered Ids');
    DATABASE.getCollection(COLLECTION_IDS,function(result) {
        result.forEach(function(filter){
            filter = DATABASE.parseFilterId(filter);
            FILTERED_IDS += filter['_id']+",";
        });
        console.log('YTH - Filtered Ids',FILTERED_IDS);
        IMPORTED_FILTERED_IDS = true;
    });
}

var FILTERED_TTITLES = [];
var IMPORTED_FILTERED_TTITLES = false;

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

    DATABASE.addDocumentToCollection(COLLECTION_TITLES,DATABASE.formatFilterTitle(title,youtuber));
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
    console.log('YTH - Import filtered Titles');
    DATABASE.getCollection(COLLECTION_TITLES,function(result) {
        result.forEach(function(filter){
            filter = DATABASE.parseFilterTitle(filter);
            FILTERED_TTITLES.push(filter);
        });
        console.log('YTH - Filtered Titles',FILTERED_TTITLES);
        IMPORTED_FILTERED_TTITLES = true;
    });
}

// ----------------- NEW IMPORT -----------------

function importFromDatabase() {
    initDatabase();
    importFilteredIds();
    importFilteredTitles();
}

// ----------------- STATS -----------------
var TITLES = {};

function isVideoWatched(item) {
    var indicators = item.find("ytd-thumbnail-overlay-playback-status-renderer,ytd-thumbnail-overlay-resume-playback-renderer");
    return indicators!=null && indicators.length>0;
}

function getVideoId(item) {
    var itemId = $(item.find('a')[0]).attr("href");
    itemId = itemId.substring(itemId.indexOf('=')+1);
    if(itemId.indexOf('&')>-1) {
        itemId = itemId.substring(0,itemId.indexOf('&'));
    }
    return itemId;
}

function getVideoYoutuber(item) {
    var elements = item.find('.ytd-channel-name a');
    return elements!=null && elements.length>0 ? $(elements[0]).text().trim() : null;
}

function getVideoTitle(item) {
    var elements = item.find('#video-title');
    return elements!=null && elements.length>0 ? $(elements[0]).attr("title").toLowerCase() : null;
}

function getChannelYoutuber() {
    var elements = $('#channel-title');
    return elements!=null && elements.length>0 ? $('#channel-title')[0].innerText : null;
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

function hideJQueryGroup(group,subscriptions) {
    if(subscriptions) {
        group.remove();
    } else {
        group.attr('style','opacity:0.25 !important;');
    }
}

function hideFilteredTitles(subscriptions) {
    FILTERED_TTITLES.forEach(function(filter){
        var titleFiltered = $('a'+getFilterTitleSelector(filter)).closest('ytd-grid-video-renderer')
        if(filter.youtuber) {
            $.each(titleFiltered,function(index,element) {
                var e = $(element);
                var youtuber = getVideoYoutuber(e);
                if(youtuber==filter.youtuber) {
                    hideJQueryGroup(e,subscriptions);
                }
            });
        } else {
            hideJQueryGroup(titleFiltered,subscriptions);
        }
    });
}

function hideWatchedAndFilteredIds(subscriptions) {
    var newStats = false;

    $.each($("ytd-grid-video-renderer"),function(index,element) {
        var e = $(element);
        var itemId = getVideoId(e);

        // save and hide watched
        var watched = isVideoWatched(e);
        if(watched) {
            if(!isFilteredId(itemId)) {
                filterId(itemId,true);
            }
            hideJQueryGroup(e,subscriptions);
        }


        // hide filtered
        if(isFilteredId(itemId)) {
            hideJQueryGroup(e,subscriptions);

            // show button to hide
        } else {
            if(!e.hasClass("dhdone")) {
                var a = $('<paper-button class="ytd-subscribe-button-renderer dhbutton" meta-id="'+itemId+'" subscribed style="display:inline-block;">Cacher</paper-button>');
                a.click(function(event){
                    var source = event.target || event.srcElement;
                    var itemIdTemp = $(source).attr('meta-id');
                    filterId(itemIdTemp);
                    hideWatched();
                });
                e.append(a);
                e.addClass("dhdone");
            }
        }
    });

    if(newStats) console.log(TITLES);
}

function clean(thumbnails) {
    thumbnails.removeClass('dhdone');
    thumbnails.removeClass('dhdone_stats');
    thumbnails.attr('style','');
}

var READY = false;
function youtubeReady() {
    if(READY) return true;
    var thumbnails = $('ytd-thumbnail');
    var timers = $('ytd-thumbnail-overlay-time-status-renderer');
    var ready =  (thumbnails.length-timers.length)<9;
    //console.log('YTH - Youtube Ready ',ready);
    if(ready) READY = true;
    return ready;
}

var previousHeight = 0;
var interval = null;

var FORCE__REFRESH_COUNT = 10;
var counter = 0;
var previousUrl;

function hideWatched(url) {
    var subscriptions = url.indexOf('https://www.youtube.com/feed/subscriptions')>-1;

    hideFilteredTitles(subscriptions);
    hideWatchedAndFilteredIds(subscriptions);
}

function checkPageUpdate() {
    if(IMPORTED_FILTERED_IDS && IMPORTED_FILTERED_TTITLES && youtubeReady()) {
        var url = window.location.href;
        if(previousUrl!=url) {
            var thumbnails = $("ytd-grid-video-renderer");
            if(thumbnails.length>0) {
                console.log('Page change',url);
                $(".dhbutton").remove();
                clean(thumbnails);
                previousUrl = url;
            }
        }

        var currentHeight = document.documentElement.scrollHeight;
        counter++;
        if(previousHeight!=currentHeight || counter>=FORCE__REFRESH_COUNT) {
            stop();
            previousHeight = currentHeight;
            hideWatched(url);
            start();
        }
    }
}

function start() {
    interval = setInterval(checkPageUpdate,500);
}

function stop() {
    counter = 0;
    clearInterval(interval);
}



$(function() {
    importFromDatabase();
    start()
});