

var port = null;
var contentScriptLoaded = false;
var injectCount = 0;

function getFilterFromUrl( url ) {
    if ( url.indexOf('http') != 0 ) return null;
    var startPos = url.indexOf( '://' );
    if (startPos == -1) return null;
    var endPos = url.indexOf( '/', startPos + 3 );
    if (endPos == -1)
        return "@@||" + url.substring(startPos + 3) + "^$document";
    else
        return "@@||" + url.substring(startPos + 3, endPos) + "^$document";
}

function setSiteEnabled( bEnabled ) {
    var enableAbp = document.getElementById('enableABP');
    if (bEnabled) {
        document.getElementById("siteEnabled").checked = true;
        document.getElementById('easyCreateFilter').setAttribute("state",
            enableAbp.checked ? 'normal' : 'disabled' );
    }
    else {
        document.getElementById("siteEnabled").checked = false;
        document.getElementById('easyCreateFilter').setAttribute("state","disabled");
    }
}

function switchClippingMode( bOn ) {
    if (bOn) {
        document.getElementById("injectingContent").style.display = "none";
        document.getElementById("normalContent").style.display = "none";
        document.getElementById("clippingContent").style.display = "block";
    }
    else {
        document.getElementById("injectingContent").style.display = "none";
        document.getElementById("normalContent").style.display = "block";
        document.getElementById("clippingContent").style.display = "none";
    }
}

function updateABPStatus (tabId, url) {
    var enableAbp = document.getElementById('enableABP');
    if ( typeof(localStorage['content_filter_on']) == 'undefined' ||
        localStorage['content_filter_on'] == "true" ) {
        enableAbp.checked = true;
        document.getElementById("siteEnabled").disabled = false;
        document.getElementById('easyCreateFilter').setAttribute("state","normal");
        sogouExplorer.pageAction.show(tabId);
    }
    else {
        enableAbp.checked = false;
        document.getElementById("siteEnabled").disabled = true;
        document.getElementById('easyCreateFilter').setAttribute("state","disabled");
        sogouExplorer.pageAction.hide(tabId);
    }

    sogouExplorer.command.contentFilter.checkURLMatchPageWhite( url, false, function( isWhite ) {
        var iconPath;
        if (!isWhite) {
            iconPath = "normal_16.png";
            setSiteEnabled(true);
        }
        else  {
            iconPath = "white_list_16.png";
            setSiteEnabled(false);
        }
        sogouExplorer.pageAction.setIcon({tabId: tabId, path: iconPath});

    });
}

function doCreatePort( tabId ) {
    port = sogouExplorer.tabs.connect(tabId);
    port.onMessage.addListener( function messageHandler(response) {
        switch (response.cmd) {
            case "isClipping": {
                document.getElementById("normalContent").style.display = "block";
                document.getElementById("injectingContent").style.display = "none";
                contentScriptLoaded = true;
                switchClippingMode(response.result);
                break;
            }
        }
    });
    port.postMessage({cmd: "isClipping"});
}

function addFilter(filterText, callback) {
    sogouExplorer.command.contentFilter.getAllFilters("", function(filters){
        filters.push(filterText);
        sogouExplorer.command.contentFilter.writeFullList("", filters.join('\n'));
        if (typeof callback === "function") callback();
    });
}

function removeFilter(filterText, callback) {
    sogouExplorer.command.contentFilter.getAllFilters("", function(filters){
        for (var i = 0, len = filters.length; i < len; ++i) {
            if (filters[i] == filterText) {
                var result = filters.slice(0, i).concat(filters.slice(i + 1));
                sogouExplorer.command.contentFilter.writeFullList("", result.join('\n'));
                if (typeof callback === "function") callback();
                return;
            }
        }
        if (typeof callback === "function") callback();
        return;
    });
}

sogouExplorer.windows.getCurrent( function(win) {
    sogouExplorer.tabs.getSelected( win.id, function(tab) {

        // got Current Tab
        // 打开 option 页面.
        document.getElementById('openOption').addEventListener('mouseup', function(e){
            sogouExplorer.extension.showOptionPage();
            window.close();
        }, false);

        // 订阅过滤规则库.
        // 打开option 页面.
        document.getElementById('importFilters').addEventListener('mouseup', function(e){
            sogouExplorer.extension.showOptionPage();
            window.close();
        }, false);

        // 广告过滤只支持 http/https 协议.
        if ( tab.url.indexOf("http") != 0 ) {
            document.getElementById("injectingContent").style.display = "none";
            document.getElementById("normalContent").style.display = "none";
            document.getElementById("clippingContent").style.display = "none";
            document.getElementById("notAppliableContent").style.display = "block";
            return;
        }

        // 注入 content_script.
        // 用来操作当前页面.
        sogouExplorer.tabs.executeScript(tab.id, {
            file: "contentScript.js",
            allFrames: true
        }, function(){
            doCreatePort( tab.id );
        });

        // 如果点击popup时,如果contentScript注入不成功，再次注入
        var intervalId = setInterval(function(){
            if ( contentScriptLoaded == false && injectCount < 5 ) {
                sogouExplorer.tabs.executeScript(tab.id, {
                    file: "contentScript.js",
                    allFrames: true
                }, function(){
                    doCreatePort( tab.id );
                });
                injectCount++;
            }
            else {
                if (injectCount >=5)
                    alert("页面脚本注入不成功");
                clearInterval(intervalId);
            }
        }, 1000);

        //sogouExplorer.tabs.sendRequest(tab.id, {cmd: "isClipping"}, responseFunc);
        updateABPStatus( tab.id, tab.url );

        document.getElementById('easyCreateFilter').addEventListener('mouseup', function(e){
            if (this.getAttribute("state") == "normal") {
                port.postMessage({cmd: "startClipping"});
                //sogouExplorer.tabs.sendRequest(tab.id, {cmd: "startClipping"}, responseFunc);
            }
        }, false);

        document.getElementById('cancelButton').addEventListener('mouseup', function(e){
            if (this.getAttribute("state") == "normal") {
                port.postMessage({cmd: "cancelClipping"});
                //sogouExplorer.tabs.sendRequest(tab.id, {cmd: "startClipping"}, responseFunc);
            }
        }, false);

        document.getElementById('siteEnabled').addEventListener('click', function(e){ //use click, because mouseup will be fired before checked change
            var checked = this.checked;
            if (!checked) {
                // 添加到白名单.
                addFilter( getFilterFromUrl(tab.url), function() {
                    updateABPStatus(tab.id, tab.url);
                });
            }
            else {
                sogouExplorer.command.contentFilter.checkURLMatchPageWhite(
                    tab.url, true, function ( isWhite, isSubscribed, filters ) {
                    console.log( isWhite, isSubscribed, filters );
                    // true false ["@@||dict.baidu.com^$document"]
                    if ( isWhite ) {
                        if (!isSubscribed) {
                            var bRemoved = false;
                            for (var i = 0, len = filters.length; i < len; ++i) {
                                removeFilter(filters[i], function() {updateABPStatus(tab.id, tab.url);});
                                bRemoved = true;
                            }
                        } else {
                        // 这里需要增加用户提示
                            alert("页面白名单在订阅名单中，无法取消");
                        }
                    } else {
                        updateABPStatus(tab.id, tab.url);
                    }
                });
            }
        }, false);


        // 打开广告过滤.
        document.getElementById('enableABP').addEventListener('click', function(e){ //use click, because mouseup will be fired before checked change
            if (this.checked) {
                localStorage['content_filter_on'] = 'true';
                sogouExplorer.command.call('content_filter','on');
                updateABPStatus(tab.id, tab.url);
            }
            else {
                localStorage['content_filter_on'] = 'false';
                sogouExplorer.command.call('content_filter','off');
                updateABPStatus(tab.id, tab.url);
            }
        }, false);

    });
});

