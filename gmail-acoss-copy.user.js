// ==UserScript==
// @name         DH - GMail - auto copy Acoss Pin
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  GMail - auto copy Acoss Pin
// @author       You
// @match        https://mail.google.com/mail/u/0/
// @grant        GM_setClipboard
// ==/UserScript==

var ACOSS_PIN_REGEX = /([0-9]{5}) votre code Utilisateur ac[0-9]{8}/;

var LAST_PIN = null;
var LAST_INBOX_CHECK = null;

function getMailTitle(element) {
    if(!element) {
        element = document.getElementsByClassName('hP');
        if(element && element.length>0) element = element[0];
    }
    var result = element ? element.innerText : null;
    return result;
}

function getMailsList() {
    return document.getElementsByClassName('bog');
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
