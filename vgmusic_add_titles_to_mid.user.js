// ==UserScript==
// @name         DH - VGMusic - Add titles to links
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Add title attribute containing the game name to each midi link (can then be used by DownThemAll to sort files)
// @author       AlucardDH
// @match        https://www.vgmusic.com/*
// @icon         https://www.google.com/s2/favicons?domain=vgmusic.com
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var previousGameName;
    var midis = $("a[href*='.mid']");
    midis.each(function(index,element) {

        var link = $(element);
        var text = link.text().replaceAll(/\//g," ").replaceAll(/\s/g," ").trim();
        link.text(text);
        var tr = link.closest("tr");
        var header = tr.prev();
        if(header.hasClass("header")) {
            var gameName = header.text().replaceAll(/\//g," ").replaceAll(/\s/g," ").trim();
            console.log(gameName);
            previousGameName = gameName;
        }

        link.attr("title",previousGameName);
    });
})();