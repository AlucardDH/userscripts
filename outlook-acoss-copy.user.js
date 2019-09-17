// ==UserScript==
// @name         DH - Outlook - auto copy Acoss Pin
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Outlook - auto copy Acoss Pin
// @author       Damien Hembert
// @match        https://outlook.office365.com/mail/inbox
// @match        https://outlook.office.com/mail/inbox
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        GM_setClipboard
// ==/UserScript==

var ACOSS_PIN_REGEX = /([0-9]{5}) votre code Utilisateur ac[0-9]{8}/;

var LAST_PIN = null;
var LAST_INBOX_CHECK = null;

function getMailTitle(element) {
    if(!element) {
        element = $('div[role="main"] [title]');
        if(element && element.length>0) element = element[0];
    }
    var result = element ? element.innerText : null;
    return result;
}

function getMailsList() {
    return $('div[role="listbox"]');
}

function getAcossPin() {
    var firstMail,mailTitle,result;

    var url = window.location.href;
    if(url.endsWith('inbox')) {
        var mails = getMailsList();
        for(var i=0;i<mails.length;i++) {
            mailTitle = getMailTitle(mails[i]);
            if(mailTitle) {
                if(!firstMail) firstMail = mailTitle;
                if(mailTitle==LAST_INBOX_CHECK) {
                    LAST_INBOX_CHECK = firstMail;
                    break;
                }
                result = ACOSS_PIN_REGEX.exec(mailTitle);
                if(result && result[1]) {
                    LAST_INBOX_CHECK = firstMail;
                    return result[1];
                }
            }
        }
    } else {
        mailTitle = getMailTitle();
        if(mailTitle) {
            result = ACOSS_PIN_REGEX.exec(mailTitle);
            if(result && result[1]) return result[1];
        }
    }


    return null;
}

function writeToClipboard(str) {
    console.log(str);
    GM_setClipboard(str);
}

function run() {
    var pin = getAcossPin();
    if(pin && pin!=LAST_PIN) {
        LAST_PIN = pin;
        writeToClipboard(pin);
    }
}

(function() {
    'use strict';

    setInterval(run,1000);
})();

