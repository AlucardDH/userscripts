// ==UserScript==
// @name         DH - Jira+
// @namespace    http://tampermonkey.net/
// @version      0.2
// @match        https://jira.gfi.fr/secure/IssueNavigator.jspa*
// @match        https://delivery.gfi.fr/jira/issues*
// @grant        none
// ==/UserScript==

var color = {
 //   'Affectée':'#FFE74C',
    'en test':'#FFE97F',
    'in test':'#FFE97F',
    'completed':'#CCFFCC',
    'a livrer en recette':'#CCFFCC',
    'en recette':'#AAFFAA',
    'a livrer en prod':'#AAFFAA',
    'en prod':'#AAFFAA',
    'fermée':'#C0C0C0',
    'closed':'#C0C0C0'
};

/*
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
*/


console.log("Jira+ loaded");
var issues = document.getElementsByClassName("issuerow");
for(var i=0;i<issues.length;i++) {
    var status = issues[i].getElementsByClassName("status")[0].innerText.trim().toLowerCase();
    var c = color[status];
    if(c) {
        issues[i].style.background=c;
    }
}

document.getElementsByClassName("focused")[0].classList.remove("focused");

