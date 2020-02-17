
// ==UserScript==
// @name         Hawai properties loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Enregistrer et charger des configration Hawai
// @author       Damien Hembert
// @projectPage     https://github.com/AlucardDH/userscripts
// @downloadURL     https://github.com/AlucardDH/userscripts/raw/master/hawai_properties_loader.user.js
// @updateURL       https://github.com/AlucardDH/userscripts/raw/master/hawai_properties_loader.user.js
// @match        http://*/hwi-install/edit_properties.cgi*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        unsafeWindow
// ==/UserScript==

var CONTENT_SELECTOR = '.row-fluid';
var CONTENT;
var PLUGIN;
var DOCUMENT_NAME;

var PARAMS = {};
var PARAMS_REVERSE = {};

function readTemplate() {
    var template = getTemplate();
    if(!template) {
        return false;
    } else {
        template = template.trim();
    }

    var lines = getTemplate().split(/\n/);
    for(var i=0;i<lines.length;i++) {
        var line = lines[i].trim();
        if(line.length==0 || line.indexOf('#')==0) {
            continue;
        }
        var keyValue = line.match(/(.*)=(.*)@(.*)@/i);
        if(!keyValue) {
            continue;
        }
        var key = keyValue[3].trim();
        var value = keyValue[1].trim();
        var prefix = keyValue[2].trim();

        PARAMS[key]={prefix:prefix,value:value};
        PARAMS_REVERSE[value]={prefix:prefix,key:key};
    }
    return true;
}

function init() {
    CONTENT = $(CONTENT_SELECTOR);
    CONTENT.attr('id','content');
    PLUGIN = $('<div id="plugin" class="span10">');
    CONTENT.before(PLUGIN);
    DOCUMENT_NAME = document.URL.substring(document.URL.lastIndexOf('/')+1);
    if(readTemplate()) {
        var inputs = $('input[type="text"][name]');
        inputs.each(function(index,input){
            input=$(input);
            var name = input.attr('name');
            name = name.match(/param_(.*)/);
            if(name) {
                var param = PARAMS[name[1]];
                if(param) {
                    var paramReverse = PARAMS_REVERSE[param.value];
                    paramReverse.input = input;
                    param.input = input;
                    if(param.prefix) {
                        input.before($('<span class="value">'+param.prefix+'</span>'));
                    }
                    input.attr('title',param.value);
                }
            }
        });
    } else {

    }
}

// TEMPLATE

function getTemplate() {
    return GM_getValue(DOCUMENT_NAME+'.template');
}

function setTemplate(content) {
    if(content) {
        GM_setValue(DOCUMENT_NAME+'.template',content);
        console.log(DOCUMENT_NAME,'template',GM_getValue(DOCUMENT_NAME+'.template'));
    }

}

// CURRENT

function readCurrent() {
    var result = '# '+DOCUMENT_NAME;

    var inputs = $('input[type="text"][name]');
    inputs.each(function(index,input){
        input=$(input);
        var name = input.attr('name');
        name = name.match(/param_(.*)/);
        if(name) {
            var param = PARAMS[name[1]];
            if(param) {
                result += '# '+name[1]+'\n';
                result += param.value+'='+param.prefix+input.val()+'\r\n';
            }
        }
    });

    return result;
}

function loadConfig(conf) {
    var lines = conf.split(/\n/);
    for(var i=0;i<lines.length;i++) {
        var line = lines[i].trim();
        if(line.length==0 || line.indexOf('#')==0) {
            continue;
        }
        var keyValue = line.match(/(.*)=(.*)/i);
        if(!keyValue) {
            continue;
        }
        var key = keyValue[1].trim();
        var value = keyValue[2].trim();
        var paramReverse = PARAMS_REVERSE[key];
        if(!paramReverse || !paramReverse.input) {
            continue;
        }
        if(paramReverse.prefix && value.indexOf(paramReverse.prefix)==0) {
            value = value.substring(paramReverse.prefix.length);
        }
        if(paramReverse.input.val()==value) {
            paramReverse.input.css("background-color","white");
        } else {
            paramReverse.input.css("background-color","lightgreen");
            paramReverse.input.val(value);
        }
    }
}

// UTILS

function readSingleFile(event,onRead) {
    var file = event.target.files[0];
    if (!file) {
        onRead(null);
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var content = e.target.result;
        // Display file content
        onRead(content);
    };
    reader.readAsText(file);
}

// UI

function downloadButton(content,filename) {
    var blob = new Blob([content], {type: 'text/plain'});
    var result = $('<a id="download" class="btn btn-large btn-primary" download="'+filename+'">Backup</a>');
    result.attr('href',window.URL.createObjectURL(blob));
    return result;
}

function displayTemplateLoaderForm() {
    // Backup
    var actions = $('<form id="actions" class="span8 large-span8 well">');
    PLUGIN.append(actions);
    var backupFieldSet = $('<fieldset>');
    actions.append(backupFieldSet);
    backupFieldSet.append(downloadButton(readCurrent(),'backup_'+DOCUMENT_NAME));

    var loadFieldSet = $('<fieldset>');
    actions.append(loadFieldSet);
    var loadField = $('<textarea disabled="disabled" style="height:27px">');
    var loadButton = $('<input type="file" class="btn btn-large" >');
    loadButton.change(function(e) {
        readSingleFile(e,function(result){
            loadField.val(result);
        });
    });
    loadFieldSet.append(loadButton);
    loadFieldSet.append(loadField);
    var loadConfirmButton = $('<input type="button" class="btn btn-large btn-primary" value="Charger">');
    loadConfirmButton.click(function() {
        loadConfig(loadField.val());
    });
    loadFieldSet.append(loadConfirmButton);

    // Template
    var form = $('<form id="setTemplate" class="span8 large-span8 well">');
    form.append('<label class="property">filter_deployment.properties</label>');
    var templateField = $('<textarea disabled="disabled" style="height:27px">'+(getTemplate() ? getTemplate() : '')+'</textarea>');
    var updTemplateButton = $('<input type="file" class="btn btn-large">');
    updTemplateButton.change(function(e) {
        readSingleFile(e,function(result){
            templateField.val(result);
        });
    });
    form.append(updTemplateButton);
    form.append(templateField);
    var submit = $('<input type="button" class="btn btn-large btn-primary" value="Enregistrer">');
    submit.click(function() {
        setTemplate(templateField.val());
    });
    form.append(submit);
    PLUGIN.append(form);
}



(function() {
    'use strict';
    init();
    displayTemplateLoaderForm();
})();