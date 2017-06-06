// ==UserScript==
// @name         DH - Orange Guide Vocal Modernize
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Damien Hembert
// @match        https://www.guidevocal.fr.orange-business.com/vocalmestre*/service.jsf
// @require 	 https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// ==/UserScript==

var popup = $(".editPanelPopup");
function isPopupVisible() {
    return popup.css("visibility")=="hidden";
}

function initAutoShowValidite() {
    $.each($(".rf-trn-lbl:contains(mobile)"),function(index,user) {
        if(!user.onclick) {
            user.onclick = showValidite;
        }
    });
}

function showValidite() {
    if(isValidityVisible()) {
        setTimeout(showValidite,1000);
        return;
    }

    var tab = $('[id="editPanelTabForm:button3"]');
    if(tab && tab.length>0) {
        tab.click();
    } else {
        setTimeout(showValidite,1000);
    }
}

var timers = {};
var waitTime = 500;
var lockTime = 1000;

function changeIfDifferent(field,newValue,max) {
    if(newValue=="00") return;
    if(max && newValue>max) return;
    var currentValue = field.find("option[selected]").val();
    if(currentValue==newValue) return;

    console.log("Changing "+currentValue+" to "+newValue);

    var timerId = field[0].id.replace(/.*:/,"");

    if(timers[timerId]=="locked") {
        console.log(timerId,"is locked");
        setTimeout(function(){
            changeIfDifferent(field,newValue,max);
        },lockTime);
        return;
    }
    if(timers[timerId]) {
        console.log(timerId,"canceled");
        clearTimeout(timers[timerId]);
    }
    if(currentValue!=newValue) {
        field.find("option").removeAttr('selected');
        field.find("option[value="+newValue+"]").attr('selected',"selected");

        timers[timerId] = setTimeout(function() {
            console.log(timerId,"running");
            field.trigger("change");
            timers[timerId] = "locked";
            console.log(timerId,"locked");
            setTimeout(function(){
                if(timers[timerId]=="locked") {
                    console.log(timerId,"unlocked");
                    timers[timerId] = null;
                }
            },lockTime);
        },waitTime);
    }
}

// Validity
function isValidityVisible() {
    return $("#validityForm").length==1;
}

function isValidityModernized() {
    return $($("#validityForm tr")[0]).children().length>7;
}

var dates = [];

function updateDate() {
    if(isValidityVisible()) {
        var selected = $("img[src*='transfer_tr_sel.gif']").closest(".rf-tr-nd").index()-1;

        var startDateDay = $("select[id*='beginDays']");
        var startDateMonth = $("select[id*='beginMonth']");
        var startDateYear = $("select[id*='beginYear']");

        var endDateDay = $("select[id*='endDays']");
        var endDateMonth = $("select[id*='endMonth']");
        var endDateYear = $("select[id*='endYear']");

        var text = startDateDay.val()+"/"+startDateMonth.val()+"/"+startDateYear.val()+" - "+endDateDay.val()+"/"+endDateMonth.val()+"/"+endDateYear.val();
        dates[selected] = text;
    }

    $.each($(".rf-trn-lbl:contains(mobile)"),function(index,user) {
        user = $(user);

        if(dates[index]) {
            var date = user.next();
            if(date.length===0) {
                date = $('<span class="rf-trn-lbl"></span>');
                user.after(date);
            }
            date.html(dates[index]);
        }
    });
}

function validityModernize() {
    var forcedYear = 2017;

    if(isValidityVisible() && !isValidityModernized()) {
        var trs = $("#validityForm tr");
        $(trs[0]).append($('<td><span class="componentLabel">date</span></td>'));

        // Start date
        var startDateDay = $("select[id*='beginDays']");
        var startDateMonth = $("select[id*='beginMonth']");
        var startDateYear = $("select[id*='beginYear']");

        var startDateField = $('<input type="date" value="'+(forcedYear && startDateYear.val()<forcedYear ? forcedYear : startDateYear.val())+'-'+startDateMonth.val()+'-'+startDateDay.val()+'"/>');
        startDateField.change(function(){
            var v = $(this).val();
            if(v) {
                var date = v.split(/-/);
                changeIfDifferent($("select[id*='beginYear']"),date[0]);
                changeIfDifferent($("select[id*='beginMonth']"),date[1],12);
                changeIfDifferent($("select[id*='beginDays']"),date[2],31);
            }

        });
        var startDateFieldTd = $('<td></td>');
        startDateFieldTd.append(startDateField);
        $(trs[1]).append(startDateFieldTd);

        // End date
        var endDateDay = $("select[id*='endDays']");
        var endDateMonth = $("select[id*='endMonth']");
        var endDateYear = $("select[id*='endYear']");

        var endDateField = $('<input type="date" value="'+(forcedYear && endDateYear.val()<forcedYear ? forcedYear : endDateYear.val())+'-'+endDateMonth.val()+'-'+endDateDay.val()+'"/>');
        endDateField.change(function(){
            var v = $(this).val();
            if(v) {
                var date = v.split(/-/);
                changeIfDifferent($("select[id*='endYear']"),date[0]);
                changeIfDifferent($("select[id*='endMonth']"),date[1],12);
                changeIfDifferent($("select[id*='endDays']"),date[2],31);
            }
        });
        var endDateFieldTd = $('<td></td>');
        endDateFieldTd.append(endDateField);
        $(trs[2]).append(endDateFieldTd);
    }
}

setInterval(validityModernize,1000);
setInterval(updateDate,1000);
setInterval(initAutoShowValidite,1000);
