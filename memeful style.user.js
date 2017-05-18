// ==UserScript==
// @name         DH - Memeful style
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://memeful.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    document.getElementsByClassName("container")[1].style.width="auto";
    document.getElementsByClassName("main-column")[0].style.width="auto";
})();