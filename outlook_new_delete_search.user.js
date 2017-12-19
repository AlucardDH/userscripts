// ==UserScript==
// @name         Outlook delete all search
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://outlook.office.com/owa/*
// @match        https://outlook.office365.com/owa/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           unsafeWindow
// ==/UserScript==

function selectAndDelete() {
    var checkboxes = $("[role=checkbox]");
    for(var i=1;i<checkboxes.length;i++) {
        $(checkboxes[i]).click();
    }
    //$("[title='Sélectionner tous les éléments dans la vue']").click();
    $("[title='Supprimer (Suppr)']").click();
}

function getSearch() {
    return $("[aria-label*='Effectuer des recherches dans les messages']").val();
}

function somethingToDelete() {
    console.log('checkboxes',$("[role=checkbox]").length);
    return $("[role=checkbox]").length>1;
}

unsafeWindow.deleteAllSearch = function() {
  if(getSearch() && somethingToDelete()) {
      GM_setValue('deleteAll',getSearch());
      waitingForReload = 30;
  }
};

waitingForReload = 0;
(function() {
    'use strict';

    //var supprBtn = $("[title='Supprimer (Suppr)']");
    var container = $(".o365cs-nav-centerAlign");

    var deleteAll = $('<button class="_fce_i ms-fwt-r ms-fcl-np o365button">Tous</button>');
    deleteAll.click(deleteAllSearch);


    setInterval(function(){
        if(GM_getValue('deleteAll') && getSearch()==GM_getValue('deleteAll') && !somethingToDelete() && waitingForReload>0) {
            $("._is_w.o365button").click();
            waitingForReload--;
        } else if(GM_getValue('deleteAll') && getSearch()==GM_getValue('deleteAll') && somethingToDelete()) {
            selectAndDelete();
            waitingForReload = 30;
        } else {
            GM_deleteValue('deleteAll');
        }
    },1000);

})();