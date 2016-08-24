// ==UserScript==
// @name         DH - Old Jira+
// @namespace    http://tampermonkey.net/
// @version      0.1
// @match        https://jira.gfi.fr/secure/IssueNavigator.jspa*
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// @grant        none
// ==/UserScript==

var color = {
 //   'Affectée':'#FFE74C',
    'En test':'#FFE97F',
    'A livrer en recette':'#CCFFCC',
    'En recette':'#AAFFAA',
    'Fermée':'#C0C0C0'
};

console.log("Jira+ loaded");

(function() {
    $(".issuerow").each(function(index,line) {
        line = $(line);
        line.removeClass('focused');
        var status = line.find(".status").text().trim();
        console.log(index,line,status);
        var c = color[status];
        console.log(c);
        if(c) {
            line.css('background',c);
        }
    });

})(); 