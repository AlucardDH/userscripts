// ==UserScript==
// @name Cookie Helper
// @namespace Cookie
// @include http://orteil.dashnet.org/cookieclicker/
// @version 0.1
// @grant none
// ==/UserScript==

function createButton(name,action) {
    var result = document.createElement('button');
    result.innerHTML = name;
    result.addEventListener("click", action);
    return result;
}

var autos = {};

function createAuto(name,action,delay) {
    if(typeof delay=="undefined") {
        delay = 0;
    }
    var toggle = function() {
        var auto = autos[name];
        if(auto.interval!==null) {
            clearInterval(auto.interval);
            auto.interval = null;
            auto.button.innerHTML=name+" [off]";
        } else {
            auto.interval = setInterval(action,delay);
            auto.button.innerHTML=name+" [on]";
        }
    };
        
    var auto = {
        button:createButton(name+" [off]",toggle),
        interval:null
    };
    
    autos[name] = auto;
    
    return auto.button;
}

window.goldenCookie = function() {
    Game.goldenCookie.spawn();
    Game.goldenCookie.click();
};

window.reindeer = function() {
    Game.seasonPopup.spawn();
    Game.seasonPopup.click();
};

window.autoClickFrenzy = function() {
    if(Game.clickFrenzy===0) {
        goldenCookie();
    }
};

window.buyUpgrade = function() {
    document.getElementById("upgrades").children[0].click();
};

function initCheats() {
    
    var topBar = document.getElementById("topBar");
    while (topBar.firstChild) {
        topBar.removeChild(topBar.firstChild);
    }
    
    topBar.appendChild(createAuto("AutoClick",Game.ClickCookie));
    topBar.appendChild(createAuto("AutoGolden",goldenCookie));
    topBar.appendChild(createAuto("AutoReindeer",reindeer,1000));
    topBar.appendChild(createAuto("AutoClickFrenzy",autoClickFrenzy));
    topBar.appendChild(createAuto("AutoBuyUpgrades",buyUpgrade,100));
}

(function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('http://aktanusa.github.io/CookieMonster/CookieMonster.js');
            clearInterval(checkReady);
            initCheats();
        }
    }, 1000);
})();