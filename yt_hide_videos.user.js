// ==UserScript==
// @name			DH - Youtube hide video
// @namespace		https://github.com/AlucardDH/userscripts
// @version			0.3
// @author			AlucardDH
// @projectPage		https://github.com/AlucardDH/userscripts
// @downloadURL		https://github.com/AlucardDH/userscripts/raw/master/yt_hide_videos.user.js
// @updateURL		https://github.com/AlucardDH/userscripts/raw/master/yt_hide_videos.user.js
// @match			https://www.youtube.com/feed/subscriptions
// @match			https://www.youtube.com/feed/subscriptions/*
// @include        	https://www.youtube.com/feed/subscriptions
// @include        	https://www.youtube.com/feed/subscriptions/*
// @require 		http://code.jquery.com/jquery-2.1.4.min.js
// @grant			GM_addStyle
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// @grant			GM_listValues
// @grant			unsafeWindow
// ==/UserScript==

console.log("DH - Youtube hide video : loaded !");
var youtube_item = ".yt-shelf-grid-item>div";
var youtube_item2 = ".feed-item-dismissable";

function clickOnFollowButton (jNode) {
    var clickEvent  = document.createEvent ('MouseEvents');
    clickEvent.initEvent ('click', true, true);
    jNode[0].dispatchEvent (clickEvent);
}

function isHidden(videoId) {
	var value = GM_getValue(videoId);
	if(value!==null) {
		return true;
	}
}

function hide(videoId) {
	GM_setValue(videoId,true);
}

function addHideButton(element,videoId) {
	if(element.attr("data-hide-button-done")) {
		return;
	}
	
	element.attr("data-hide-button-done","true");
	var button = $("<button>Cacher</button>");
	button.click(function() {
		hide(videoId);
		element.parent().remove();
	});
	element.append(button);	
}

function addHideButton2(element,videoId) {
	if(element.attr("data-hide-button-done")) {
		return;
	}
	
	element.attr("data-hide-button-done","true");
	
	var button = $("<button>Cacher</button>");
	button.click(function() {
		hide(videoId);
		
		clickOnFollowButton(element.find("button.flip"));//.click();
		setTimeout(function(){
			clickOnFollowButton(element.find(".dismiss-menu-choice"));//.click();
		//	video.parent().parent().parent().parent().remove();
		},100);
		
	});
	element.append(button);	
}



var interval = setInterval(function() {
	var videos = $(youtube_item);
	//console.log(videos);
	$.each(videos,function(index,video) {
		video = $(video);
		var videoId = video.attr("data-context-item-id");
		if(isHidden(videoId)) {
			video.parent().remove();
		} else {
			addHideButton(video,videoId);
		}
	});
	var videos = $(youtube_item2);
	//console.log(videos);
	$.each(videos,function(index,video) {
		video = $(video);
		var videoId = $(video.find(".yt-lockup")).attr("data-context-item-id");
		if(isHidden(videoId)) {
			console.log(videoId+" should be hidden");
			
			clickOnFollowButton(video.find("button.flip"));//.click();
			setTimeout(function(){
				clickOnFollowButton(video.find(".dismiss-menu-choice"));//.click();
			//	video.parent().parent().parent().parent().remove();
			},100);
			
		} else {
			addHideButton2(video,videoId);
		}
	});
},5000);
