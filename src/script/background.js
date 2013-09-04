

//sogouExplorer.browserAction.setPopup({popup:"!"});
function getFilterFromUrl( url ) {
    if ( url.indexOf('http') != 0 ) {
        return null;
    }
    var startPos = url.indexOf( '://' );
    if (startPos == -1) {
        return null;
    }
    // 以上, http/https
    var endPos = url.indexOf( '/', startPos + 3 );

    if (endPos == -1)
        return url +"*";
    else
        return url.substring(0, endPos) + "*";
}

// 更新 pageAction 上信息.
// 主要是检查 url 是否在白名单中.
function updateABPStatus ( tabId, url ) {
    sogouExplorer.command.contentFilter.checkURLMatchPageWhite( url, false, function(isWhite) {
        var iconPath;
        var filter = getFilterFromUrl(url);
        if (filter == null) return;
        iconPath = isWhite ? 'white_list_16.png' : 'normal_16.png';
        sogouExplorer.pageAction.setIcon({
            tabId: tabId,
            path: iconPath
        });

        if ( typeof(localStorage['content_filter_on']) == 'undefined' ||
                localStorage['content_filter_on'] == "true" ) {
            sogouExplorer.pageAction.show(tabId);
        }
        else {
            sogouExplorer.pageAction.hide(tabId);
        }
        sogouExplorer.pageAction.setPopup({
            tabId: tabId,
            popup: "popup.html",
            width: 170,
            height: 130
        });
    });
}

var downloading = {};
// download 完, 为什么要 Reload 一次?
function downloadFilterList( url ) {
    if ( !downloading[url] ) {
        downloading[url] = true;
        new FilterListFetcher( url, function(fetcher) {
            if( !fetcher.error ) {
                // Take this URL out of currently-being-downloaded list
                delete downloading[url];
                reloadFilters();
            }
        });
    }
}

// 需要是否需要加载.
// 从 localStorage 里面开始查.
// 如果不存在, 直接 download.
// 如果存在, 查看是否已过期, 过期则重新加载.
// 如果已经在加载列表中, 则不再加载 - @TODO: 移到 download 函数中检查.
function checkFilterListUpdate( filename ) {
    // Check filename for http prefix and if so load from localStorage instead
    if ( filename.match(/^http/i) ) {
        if ( typeof localStorage[filename] == "string" ) {
            var list = JSON.parse( localStorage[filename] );

            // If there was an error loading the list before, don't try again now, let the user
            // update manually. This is so we won't pound a filter list's server if the
            // maintainer moves the file.
            if ( !list.error ) {
                // Check whether it's time to redownload the list.
                // If list specifies its expiry time, use that. Otherwise default to 3 days.
                var now = new Date().getTime();
                var expires = list.expires ?
                        list.expires : DEFAULT_EXPIRATION_INTERVAL * MILLISECONDS_IN_SECOND;

                // If the list is expired and we aren't currently downloading it already, redownload it.
                // We may have saved a null for lastUpdated due to a bug, so replace that with now
                if ( !list.lastUpdated ) {
                    //console.log("Fixing null lastUpdated filename for " + filename);
                    list.lastUpdated = now;
                    localStorage[ filename ] = JSON.stringify( list );
                }

                // 已过期.
                // 并且没在下载列表中.
                // 下载文件.
                if( ( (now - list.lastUpdated) > expires ) &&
                    !downloading[filename] ) {
                    // console.log("Too old, so redownloading " + filename);
                    downloadFilterList( filename );
                }
            }
            // If there is any text for the filter list, return it, otherwise return a
            // blank string rather than undefined. This depends on the fetcher not
            // filling list.text with garbage on an unsuccessful fetch.
            return;
        } else {
            // This filter list was never downloaded, so download it
            // This is kept from running away by the fetcher actually storing the filter
            // list data, which is checked for above.
            // console.log("First time download: " + filename);
            downloadFilterList( filename );
            return; // Return nothing for now, it'll be reloaded later
        }
    }
    // 如果以后有本地文件，在这里添加
}

// Clears the ABP matchers of filters and reloads them.
// This will also download and cache filter lists as necessary.
function reloadFilters() {
    var urlsToLoad = [];

    // Make sure user filter URLs are in filterFiles
    loadUserFilterURLs();

    // filterFilesEnabled is a bit of a misnomer - can include URLs too, and it
    // includes the enabled state of the particular filter set.
    // But if we change it, we'll break current installations
    var filterFilesEnabled = {
        "easylist": true,
        "china": true,
        "sogou": true
    };

    // 如果存在 localStorage.filterFilesEnabled,
    // 则认为已经使用过此插件.
    // 那么使用用户本地配置.
    if ( localStorage.getItem('filterFilesEnabled') ) {
        filterFilesEnabled = JSON.parse( localStorage.getItem('filterFilesEnabled') );
    }
    else {
        localStorage.setItem( 'filterFilesEnabled', JSON.stringify(filterFilesEnabled) );
    }

    // 确认要加载的 url 地址 - 过滤规则.
    for ( var key in filterFilesEnabled ) {
        if ( filterFilesEnabled[key] )
            urlsToLoad.push( filterFiles[key] );
    }

    // 检查是否要加载.
    for ( var j = 0; j < urlsToLoad.length; j++ ) {
        checkFilterListUpdate( urlsToLoad[j] );
    }

    sogouExplorer.command.contentFilter.getAllFullListNames( function( names ) {

        // 没启用的过滤规则写到 writeFullList( name ) 中.
        names.forEach(function(name, index) {
            if ( name !== '' && !filterFilesEnabled[name] ) {
                sogouExplorer.command.contentFilter.writeFullList( name );
            }
        });

        // 下载选中但是底层没有的名单
        for (var name in filterFilesEnabled) {
            if ( filterFilesEnabled[name] === true ) {
                if ( -1 === names.indexOf(name) ) {
                    downloadFilterList( filterFiles[name] );
                }
            }
        }

        // localStorage[ "filterFilesEnabled" ] = JSON.stringify(filterFilesEnabled);
    });

}

reloadFilters();

// url改变
sogouExplorer.tabs.onUpdated.addListener(function( tabId, changeInfo, tab ) {
    if ( changeInfo.url )  {
        updateABPStatus( tabId, changeInfo.url );
    }
});

sogouExplorer.tabs.onCreated.addListener(function(tab){
    updateABPStatus(tab.id, tab.url);
});

sogouExplorer.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
    sogouExplorer.tabs.get(tabId, function(tab) {
        if (tab) {
            updateABPStatus(tabId, tab.url);
        }
    });
});


// 接受来自其它页面的消息.
// addRule/reload.
sogouExplorer.extension.onRequest.addListener(function(request, sender, sendResponse){
    //alert(JSON.stringify(request));
    if ( request.cmd == "addRules" )  {
        sogouExplorer.command.contentFilter.getAllFilters( "", function(filters) {
            sogouExplorer.command.contentFilter.writeFullList( "", filters.concat( request.filters ).join("\n") );
        });
        //alert('addRules');
    }
    else if ( request.cmd == "reloadFilters" ) {
        reloadFilters();
        sendResponse({});
    }
});

sogouExplorer.browserAction.setPopup({
    popup: "popup.html",
    width: 170,
    height: 130
});

// 首次使用或者广告过滤一直开启.
// 让 content_filter 打开.
// @NOTE: 每次启动浏览器都要通知一次.
if ( typeof(localStorage['content_filter_on']) == 'undefined' ||
    localStorage['content_filter_on'] == "true" ) {
    sogouExplorer.command.call( "content_filter", "on" );
    localStorage[ 'content_filter_on' ] = "true";
}

// 弹泡提醒 - 5s 后.
if ( typeof localStorage["firstRun"] == "undefined" ) {
    localStorage["firstRun"] = "false"; // string false ?
    window.setTimeout(function() {
        sogouExplorer.browserAction.showBalloon({
            title: "广告过滤",
            content: "您需要手动订阅过滤规则库以让广告过滤功能生效",
            icon: { path: "default.ico" }
        });
    }, 5000);
}

// 设置菜单项
var createProperties = [
    {
        type: "checkbox",
        title: "开启广告过滤",
        checked : ( typeof(localStorage['content_filter_on']) == 'undefined' || localStorage['content_filter_on'] == "true" ),
        contexts: [ "mainframe" ],
        onclick: function ( info, tab ) {
            if ( typeof(localStorage['content_filter_on']) == 'undefined' ||
                    localStorage['content_filter_on'] == "true" ) {
                localStorage[ 'content_filter_on'] = "false";
                sogouExplorer.command.call("content_filter","off");
                sogouExplorer.contextMenus.update(info.menuItemId, {checked: false});
            }
            else {
                localStorage['content_filter_on'] = "true";
                sogouExplorer.command.call("content_filter","on");
                sogouExplorer.contextMenus.update(info.menuItemId, {checked: true});
            }
        }
    },
    {
        type: "normal",
        title: "记录过滤内容",
        contexts: ["mainframe"],
        onclick: function (info, tab) {
            sogouExplorer.windows.create({
                type: "popup",
                url:"log.html",
                width: 800,
                height: 500
            });
        }
    }
];
var menuid = [];
for (var i = 0; i < createProperties.length; ++i) {
    menuid[i] = sogouExplorer.contextMenus.create( createProperties[i] );
}

// 当广告过滤开启/关闭时,
// 更新 localStorage.
// 更新 pageAction.
// 更新插件右键菜单.
sogouExplorer.command.contentFilter.onContentFilterStatusChange.addListener( function (on) {
    if (!on) {
        localStorage[ 'content_filter_on' ] = "false";
        sogouExplorer.contextMenus.update( menuid[0], {checked: false} );
        sogouExplorer.tabs.getSelected(function(tab) {
            updateABPStatus(tab.id, tab.url);
        })
    }
    else {
        localStorage['content_filter_on'] = "true";
        sogouExplorer.contextMenus.update(menuid[0], {checked: true});
        sogouExplorer.tabs.getSelected(function(tab) {
            updateABPStatus(tab.id, tab.url);
        })
    }
});

// 扩展被禁用时，更新全局开关
window.onbeforeunload = function() {
    sogouExplorer.command.call( "content_filter", "off" );
};

