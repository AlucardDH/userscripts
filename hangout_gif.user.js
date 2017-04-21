// ==UserScript==
// @name         Google mail GIF auto
// @namespace    http://tampermonkey.net/
// @version      0.2.1
// @description  Replace link to gif or 9gag by the image
// @author       You
// @match        https://hangouts.google.com/webchat/*
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
            img.addEventListener("click", function(){
                window.open(link.innerText, "_blank");
            });
            replace(img,link);
        }
        
        // 9gag
        // https://9gag.com/gag/aPBr4Vw
        // to : https://img-9gag-fun.9cache.com/photo/aPBr4Vw_700b.jpg
        if(link.innerText.indexOf("9gag.com/gag/")>-1) {
            console.log("loading 9gag",link.innerText,link);
            var imgLink = "https://img-9gag-fun.9cache.com/photo"+link.innerText.substring(link.innerText.lastIndexOf("/"))+"_700b.jpg";
            var img = document.createElement("img");
            img.src = imgLink;
            img.style = "max-width:100%";
            img.addEventListener("click", function(){
                window.open(link.innerText, "_blank");
            });
            replace(img,link);
        }

    }
}

(function() {
    'use strict';
    
    setInterval(apply,5000);
})();