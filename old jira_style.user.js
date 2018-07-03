// ==UserScript==
// @name         DH - Jira+
// @namespace    http://tampermonkey.net/
// @version      0.2.3
// @match        https://jira.gfi.fr/secure/IssueNavigator.jspa*
// @match        https://delivery.gfi.fr/jira/*
// @grant        none
// ==/UserScript==

var color = {
 //   'Affectée':'#FFE74C',
    'work in progress':'#FFE97F',
    'en test':'#FFE97F',
    'in test':'#FFE97F',
    'test':'#FFE97F',
    'completed':'#CCFFCC',
    'finished':'#CCFFCC',
    'a livrer en recette':'#CCFFCC',
    'a livrer recette':'#CCFFCC',
    'en recette':'#AAFFAA',
    'livré recette':'#AAFFAA',
    'a livrer en prod':'#AAFFAA',
    'ok pour mep':'#AAFFAA',
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
setInterval(function(){
var issues = document.getElementsByClassName("issuerow");
for(var i=0;i<issues.length;i++) {
    var status = issues[i].getElementsByClassName("status")[0].innerText.trim().toLowerCase();
    var c = color[status];
    if(c) {
        issues[i].style.background=c;
    }
}

document.getElementsByClassName("focused")[0].classList.remove("focused");
},5000);

