// ==UserScript==
// @name            DH - Youtube hide video
// @namespace       https://github.com/AlucardDH/userscripts
// @version         2.7.0
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

console.log("DH - Youtube hide video 2.7.0 : loaded !");


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
        query.find().then(onSuccess);
    },

    addDocumentToCollection : async function(collectionId,document) {
        document.save().then(
          (result) => {
            if (typeof document !== 'undefined') document.write(`ParseObject created: ${JSON.stringify(result)}`);
            console.log('ParseObject created', result);
          },
          (error) => {
            if (typeof document !== 'undefined') document.write(`Error while creating ParseObject: ${JSON.stringify(error)}`);
            console.error('Error while creating ParseObject: ', error);
          }
        );
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
};

unsafeWindow.b4aLogin = function(appId,jsKey) {
    b4aDatabase.login(appId,jsKey);
};

// ----------------- MLAB UTILS -----------------

var MLAB_BASE_URL = "https://api.mlab.com/api/1";
var MLAB_DATABASE_KEY = "MLAB_DB";
var MLAB_APIKEY_KEY = "MLAB_APIKEY";

var mlabDatabase = {
    login : function(database,apiKey) {
        setScriptParam(MLAB_DATABASE_KEY,database);
        setScriptParam(MLAB_APIKEY_KEY,apiKey);

        importFromDatabase();
    },

    init : function() {
        // nothing to do here
    },

    isLogged : function() {
        return false; // mlab obsolete
        //return hasScriptParam(MLAB_APIKEY_KEY) && hasScriptParam(MLAB_DATABASE_KEY);
    },

    formattedKey : function() {
        return "?apiKey="+getScriptParam(MLAB_APIKEY_KEY);
    },

    addDocumentToCollection : function(collectionId,document) {
        if(!mlabDatabase.isLogged()) {
            return;
        }

        GM_xmlhttpRequest({
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+mlabDatabase.formattedKey(),
            data: JSON.stringify(document),
            onload:  function(result) {
                var data = result.response;
                console.log(data);
            }
        });
    },

    getCollection : function(collection,onSuccess) {
        if(!mlabDatabase.isLogged()) {
            return;
        }

        GM_xmlhttpRequest({
            method: "GET",
            responseType :"json",
            url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+mlabDatabase.formattedKey()+"&l=10000",
            onload:  function(result) {
                var data = result.response;
                console.log(data);
                if(onSuccess) {
                    onSuccess(data);
                }
            }
        });
    },

    deleteDocuments : function(collection,query,onSuccess) {
        if(!mlabDatabase.isLogged()) {
            return;
        }
        if(!query) {
            return;
        }

        GM_xmlhttpRequest({
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            responseType :"json",
            url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+mlabDatabase.formattedKey()+"&q="+JSON.stringify(query),
            data:"[]",
            onload:  function(result) {
                var data = result.response;
                console.log(data);
                if(onSuccess) {
                    onSuccess(data);
                }
            }
        });
    },

    getDocument : function(collection,documentId,onSuccess) {
        if(!mlabDatabase.isLogged()) {
            return;
        }

        GM_xmlhttpRequest({
            method: "GET",
            responseType :"json",
            url: MLAB_BASE_URL+"/databases/"+getScriptParam(MLAB_DATABASE_KEY)+"/collections/"+collection+"/"+documentId+mlabDatabase.formattedKey(),
            onload:  function(result) {
                var data = result.response;
                console.log(data);
                if(onSuccess) {
                    onSuccess(data);
                }
            }
        });
    },

    formatFilterId(id,watched) {
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


unsafeWindow.mlabLogin = function(database,apiKey) {
    mlabDatabase.login(database,apiKey);
};




// ----------------- ABSTRACTION DATABASTE -----------------

var DATABASE;

function initDatabase() {
    if(b4aDatabase.isLogged()) {
        DATABASE = b4aDatabase;
        DATABASE.init();

    //} else if(mlabDatabase.isLogged()) {
    //    DATABASE = mlabDatabase;
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
    DATABASE.getCollection(COLLECTION_IDS,function(result) {
        result.forEach(function(filter){
            filter = DATABASE.parseFilterId(filter);
            FILTERED_IDS += filter['_id']+",";
        });
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
    DATABASE.getCollection(COLLECTION_TITLES,function(result) {
        result.forEach(function(filter){
            filter = DATABASE.parseFilterTitle(filter);
            FILTERED_TTITLES.push(filter);
        });
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

        // stats first
        if(!e.hasClass("dhdone_stats")) {
            addStats(e);
            newStats = true;
            e.addClass("dhdone_stats");
        }

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

importFromDatabase();

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
	if(IMPORTED_FILTERED_IDS && IMPORTED_FILTERED_TTITLES) {
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

start();