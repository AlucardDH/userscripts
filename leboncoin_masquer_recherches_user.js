// ==UserScript==
// @name         DH - Le Bon Coin - Masquer les recherches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Masque les annonces de recherche
// @author       AlucardDH
// @projectPage  https://github.com/AlucardDH/userscripts
// @match        https://www.leboncoin.fr/*
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant		 none
// ==/UserScript==


function hideRecherche() {
    $("div[class*=styles_adListItem]:contains(herche)").remove();
    $("div[class*=styles_adListItem]:contains(CHERCHE)").remove();
}

(function() {
    'use strict';
    setInterval(hideRecherche,1000);
})();