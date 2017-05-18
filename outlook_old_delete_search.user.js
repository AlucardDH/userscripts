// ==UserScript==
// @name         Outlook delete all search
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://outlook.office.com/owa/*
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant           GM_getValue
// @grant           GM_setValue
// @grant           GM_deleteValue
// @grant           unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    
    if(GM_getValue('deleteAll') && $("#txtSch").val()==GM_getValue('deleteAll') && $("input[name=chkmsg]").length>0) {
        $("input[name=chkhd]").click();
        $("#lnkHdrdelete").click();
    } else {
        GM_deleteValue('deleteAll');
    }
    
    var deleteAll = $('<a href="#" class="btn">Tous</a>');
    deleteAll.click(function(){
        console.log($("#txtSch").val(),$("input[name=chkmsg]").length);
        if($("#txtSch").val() && $("input[name=chkmsg]").length>0) {
            GM_setValue('deleteAll',$("#txtSch").val());
            $("input[name=chkhd]").click();
            $("#lnkHdrdelete").click();
        }
    });
    
    $("#lnkHdrdelete").after(deleteAll);
    
})();