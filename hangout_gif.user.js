// ==UserScript==
// @name         Google mail GIF auto
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Replace llink to gif by the image
// @author       You
// @match        https://hangouts.google.com/webchat*
// @grant        none
// ==/UserScript==

function replace(newNode, referenceNode) {
    console.log(newNode);
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
    referenceNode.parentNode.removeChild(referenceNode);
}

function apply() {
    //var hangout = getHangout();
    //if(!hangout) return;
    //console.log("calling Userscript");
    var links = /*hangout.contentWindow.*/document.getElementsByTagName("a");
    for(var i=0;i<links.length;i++) {
        var link = links[i];
        //console.log(link);
        if(link.innerText.endsWith(".gif")) {
            console.log("loading gif",link.innerText,link);
            var img = document.createElement("img");
            img.src = link.innerText;
            img.style = "max-width:100%";
            replace(img,link);
        }

    }
}

(function() {
    'use strict';
    
    setInterval(apply,5000);
})();