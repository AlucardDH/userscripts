// ==UserScript==
// @name         DH - CRA Auto astreintes
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Rempli les colonnes des astreintes
// @author       Damien Hembert
// @match        https://cra.gfi.fr/cra35/popup_Astreintes.php*
// @grant        none
// ==/UserScript==

function formatDate(date,hour) {
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();
    day = day<10 ? "0"+day : ""+day;
    month = month<10 ? "0"+month : ""+month;
    return day+"/"+month+"/"+year+" "+hour;
}

(function() {
    'use strict';
    
    var tab = document.getElementsByTagName("form")[0].getElementsByTagName("tr");
    for (var i = 3; i<tab.length; i++) {
        var ligne = tab[i];
        console.log(ligne);
        var inputs = ligne.getElementsByTagName("input");
        var jour = inputs[1];
        var date = jour.value;
        date = new Date(new Date().getFullYear()+"-"+date.substring(3,5)+"-"+date.substring(0,2));
        
        var previous;
        if(date.getDay()==1) {//lundi
            previous = new Date(date.getTime()-3*(24*3600*1000));
        } else if(date.getDay()==0) {//dimanche
            previous = new Date(date.getTime()-2*(24*3600*1000));
        } else {
            previous = new Date(date.getTime()-1*(24*3600*1000));
        }
        
        var next;
        if(date.getDay()==5) {//vendredi
            next = new Date(date.getTime()+3*(24*3600*1000));
        } else if(date.getDay()==6) {//samedi
            next = new Date(date.getTime()+2*(24*3600*1000));
        } else {
            next = new Date(date.getTime()+1*(24*3600*1000));
        }
        
        var dateHeureFin = inputs[2];
        dateHeureFin.value = formatDate(previous,"18:00");
        var dateHeureReprise = inputs[3];
        dateHeureReprise.value = formatDate(next,"09:00");
        
        
        
    }
    
})();