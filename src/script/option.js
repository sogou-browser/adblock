

function loadCheckbox(id) {
    document.getElementById(id).checked = typeof localStorage[id] == "undefined" ? false : localStorage[id] == "true";
}

function saveCheckbox(id) {
    localStorage[id] = document.getElementById(id).checked;
}

function addFilter(filterText, callback)
{
    sogouExplorer.command.contentFilter.getAllFilters("", function(filters){
            filters.push(filterText);
            sogouExplorer.command.contentFilter.writeFullList("", filters.join('\n'));
            if (typeof callback === "function")
                callback();
        });
}

function removeFilter(filterText, callback)
{
    sogouExplorer.command.contentFilter.getAllFilters("", function(filters){
            for (var i = 0, len = filters.length; i < len; ++i) {
                if (filters[i] == filterText) {
                    var result = filters.slice(0, i).concat(filters.slice(i + 1));
                    sogouExplorer.command.contentFilter.writeFullList("", result.join('\n'));
                    if (typeof callback === "function")
                        callback();
                    return;
                }
            }
            if (typeof callback === "function")
                callback();
            return;
        });
}

function loadOptions() {
    // Show icon in address bar?
    //loadCheckbox("closeAdbNow");

    // User-entered filters
    $("#filterLists").children().remove()
    showUserFilters();

    setSwitchAddBlockText();

    //Load User filter Urls
    loadUserFilterURLs();
    for(key in filterFiles) {
        if(!key.match(/^user_/))
            addFilterListEntry(key);
        else
            addUserURLEntry(key, filterFiles[key]);
    }

    // Filter lists enabled state
    var filterFilesEnabled = typeof localStorage["filterFilesEnabled"] == "string" ? JSON.parse(localStorage["filterFilesEnabled"]) : {};
    for(var key in filterFilesEnabled) {
        document.getElementById(key).checked = filterFilesEnabled[key];
    }


    saveOptions(); // Save any defaults that were created
}

function saveOptions() {
    // Filter lists
    //alert("saveOptions");
    var filterFilesEnabled = {};
    var userFilterURLs = {};
    for(var key in filterFiles) {
        filterFilesEnabled[key] = document.getElementById(key).checked;
        if(key.match(/^user_/)) { // User-added filter?
            userFilterURLs[key] = document.getElementById(key + "_url").innerHTML;
        }
        if (!filterFilesEnabled[key])
            delete localStorage[filterFiles[key]];
    }
    localStorage["filterFilesEnabled"] = JSON.stringify(filterFilesEnabled);
    localStorage["userFilterURLs"] = JSON.stringify(userFilterURLs);
    sogouExplorer.extension.sendRequest({cmd: "reloadFilters"}, function() { checkAllFilterLists(); });

}

// Add a filter string to the list box.
function appendToListBox(boxId, text) {
    var elt = document.createElement("option");
    elt.text = text;
    elt.value = text;
    document.getElementById(boxId).add(elt, null);
}

//如果到年，则不是非常精确
function calculateTimeDiffString(timeDiff) {
    var postfix = ["秒","分钟","小时","天","月","年"];
    var timePeriod = [60,60,24,30,12.166666];
    var index = 0;
    var tempTime = timeDiff / 1000;
    var i = 0;
    for (; i < timePeriod.length; i++)
    {
        if (tempTime < timePeriod[i])
            break;
        tempTime /= timePeriod[i];
    }
    if (i == 0 && tempTime < 30)
        return "刚刚";
    return parseInt(tempTime) + postfix[i] + "前";
}


//Filter List Section


// Checks into our possible cached copy of this filter list and updates the UI accordingly
function checkFilterList(key) {
    //alert("checkFilterList");
    // Hide status message
    $("#" + key + "_msg").css("display", "none");

    var url = filterFiles[key];
    try {
        if(url in localStorage) {
            var list = JSON.parse(localStorage[url]);
            if(!list.error) {
                // We didn't used to store lastDownloaded, so we check for its existence and fall back on lastUpdated if necessary
                // lastDownloaded: Last time the list was downloaded
                // lastUpdated: Last time the list reports that it was updated, or else the last time it was downloaded
                var lastDownloaded = list.lastDownloaded ? list.lastDownloaded : list.lastUpdated;
                // Only display status message if checked
                if(document.getElementById(key).checked) {
                  var d = new Date(lastDownloaded);
                    var timeDateString = null;
                    var now = new Date();
                    if(d.toDateString() == now.toDateString())
                    {
                        timeDateString = "最后更新于 " + d.toLocaleTimeString() + " 今日";
                    }
                    else
                    {
                        timeDateString = "最后更新于" + d.toLocaleTimeString() + " " + d.toDateString();
                    }
                    var timeDiff = Date.now() - lastDownloaded;

                    $("#" + key + "_msg").css("color", "#b0b0b0").text(calculateTimeDiffString(timeDiff)).attr('title',timeDateString).css("display", "inline");
                }
            }
            else {
                // Display error only if checked
                if(document.getElementById(key).checked) {
                    $("#" + key + "_msg").text(list.error).css("color", "#a03030").css("display", "inline");
                }
            }
        } else {
            // If we don't have this filter list but it's enabled, fetch it
            if(document.getElementById(key).checked == true)
                updateFilterList(key);
        }
    } catch (e) {}
}

// Check to see if all filter lists are up to date
function checkAllFilterLists() {
    for(key in filterFiles) {
        checkFilterList(key);
    }
}

// Called when user explicitly requests filter list updates
function updateFilterLists() {
    for(key in filterFiles) {
        // Hide status message
        $("#" + key + "_msg").css("display", "none");
        updateFilterList(key);
    }
    // Now that we've updatd the filter lists, make sure they are loaded
    sogouExplorer.extension.sendRequest({cmd: "reloadFilters"});
}

// Updates a single filter list and informs the user what happened
function updateFilterList(key) {
    // Checkbox not checked? Not a URL?
    if(document.getElementById(key).checked == false || (filterFiles[key] !== 'test.txt' && !filterFiles[key].match(/^http/i)))
        return;

    // Hide status message
    $("#" + key + "_msg").css("color", "#b0b0b0").html("正在更新<img src='waiting.gif'/>").css("display", "inline");

    new FilterListFetcher(key, function(fetcher) {
        if(fetcher.error) {
            $("#" + fetcher.name + "_msg").text(fetcher.error).css("color", "#a03030").css("display", "inline");
            document.getElementById(key).checked = false;
        } else {
            // Force display of "updated now" message
            checkFilterList(key);
        }
    });
}

// Adds an entry for a filter list to the UI.
// TODO: Merge this with addUserURLEntry() as this is too much duplicated code
function addFilterListEntry(key) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = key;
    checkbox.addEventListener("click", function() { saveOptions(); });
    var label = document.createElement('span');
    if(filterListAuthors[key])
        label.innerHTML = filterListTitles[key] + " 作者：" + filterListAuthors[key];
    else
        label.innerHTML = filterListTitles[key];
    label.innerHTML += " "; // Space to separate status message from description
    // Status message
    var msg = document.createElement("span");
    msg.id = key + "_msg";
    msg.class = "flMsg";
    var div = document.createElement('div');
    div.id = key + "_div";
    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(msg);
    document.getElementById("filterLists").appendChild(div);
}

// Adds an entry for a filter list URL to the UI
function addUserURLEntry(key, url) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = key;
    checkbox.checked = true;
    checkbox.addEventListener("click", function() { saveOptions(); });
    var label = document.createElement('span');
    label.id = key + "_url";
    label.innerHTML = url;
    var del = document.createElement('span');
    del.innerHTML = ' <a href="#" onclick="deleteUserURLEntry(\'' + key + '\')">[删除]</a> ';
    // Status message
    var msg = document.createElement("span");
    msg.id = key + "_msg";
    msg.class = "flMsg";
    var div = document.createElement('div');
    div.id = key + "_div";
    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(del);
    div.appendChild(msg);
    document.getElementById("userFilterLists").appendChild(div);
}

// Deletes an entry for a filter list URL from the UI
function deleteUserURLEntry(key) {
    if(key in filterFiles)
        delete filterFiles[key];
    var foo = document.getElementById(key + "_div");
    document.getElementById("userFilterLists").removeChild(foo);
    saveOptions();
}

// Adds and saves the user-entered filter list URL
function addUserURLFromBox() {
    var key = "user_" + (new Date()).getTime();
    var url = document.getElementById("newURL").value;

    // Extract URL from ABP subscription link
    var matches;
    if(matches = url.match(/^abp:\/*?subscribe.*[\?&]location=(.+?)(&|$)/i))
        url = decodeURIComponent(matches[1]);

    if(!url.match(/^http/i) && !url.match(/^file/))
        return;
    addUserURLEntry(key, url);
    document.getElementById("newURL").value = "";
    filterFiles[key] = url;
    // Trigger download
    updateFilterList(key);
    saveOptions();
}

function showUserFilters() {
    function addFilters(userFilters){
        $("#userFiltersBox").children().remove();
        $("#excludedDomainsBox").children().remove();
        for(var i = 0; i < userFilters.length; i++)
        {
            var endIndex = userFilters[i].indexOf("^$document");
            if (userFilters[i].indexOf("@@||") == 0 && endIndex > 0)
            {
                var domain = userFilters[i].substring(4, endIndex);
                appendToListBox("excludedDomainsBox", domain);
            }
            else
                appendToListBox("userFiltersBox", userFilters[i]);

        }
    }
    sogouExplorer.command.contentFilter.getAllFilters("", addFilters);
}

function addWhiteListDomain()
{
    var domain = document.getElementById("newWhitelistDomain").value.split(' ').join('\t').split('\t').join('');
    var rule = "@@||" + domain + "^$document";
    addFilter(rule, loadOptions);
}

// Removes currently selected whitelisted domains
function removeSelectedExcludedDomain() {
    var excludedDomainsBox = document.getElementById("excludedDomainsBox");
    for (var i = excludedDomainsBox.length-1; i >= 0; i--) {
        if (excludedDomainsBox.options[i].selected)
        {
            removeFilter("@@||" + excludedDomainsBox.options[i].value + "^$document", loadOptions);
        }
    }
}

function addTypedFilter()
{
    var filterText = document.getElementById("newFilter").value.replace(/^\s*(.+?)\s*$/g, "$1");
    // ABP filters accept also CSS selectors, spaces are allowed inside filter
    if(filterText == "") return;
    addFilter(filterText, loadOptions);
}

function removeSelectedFilters()
{
    var userFiltersBox = document.getElementById("userFiltersBox");
    for (var i = userFiltersBox.length-1; i >= 0; i--) {
        if (userFiltersBox.options[i].selected)
        {
            removeFilter(userFiltersBox.options[i].value, loadOptions);
        }
    }
}

function toggleFiltersInRawFormat() {
    $(".rawFilters").toggle();
    if($(".rawFilters").is(":visible")) {
        var iNumReturned = 0;
        function addFiltersToRawFiltersText(userFilters){
            if (iNumReturned == 0)
            {
                $("#rawFiltersText").attr("value","");
                iNumReturned++;
            }
            var text = "";
            for(var i = 0; i < userFilters.length; i++)
            {
                text += userFilters[i] + "\n";
            }
            var textArea = document.getElementById("rawFiltersText");
            textArea.value = textArea.value + text;
        }
        sogouExplorer.command.contentFilter.getAllFilters("", addFiltersToRawFiltersText);
    }
}

// Imports filters in the raw text box
function importRawFiltersText() {
    $(".rawFilters").hide();
    //alert(document.getElementById("rawFiltersText").value);
    var filters = document.getElementById("rawFiltersText").value;
    sogouExplorer.command.contentFilter.writeFullList("", filters);
    loadOptions();
}

function setSwitchAddBlockText (){
    var span = document.getElementById('switchAddBlockText');
    if (typeof(localStorage['content_filter_on']) == 'undefined' || localStorage['content_filter_on'] == "true")
        span.innerText = '立即关闭广告过滤';
    else
        span.innerText = '立即开启广告过滤';
}

function switchAddBlock(){
    if (typeof(localStorage['content_filter_on']) == 'undefined' || localStorage['content_filter_on'] == "true")
    {
        localStorage['content_filter_on'] = "false";
        sogouExplorer.command.call("content_filter","off");
    }
    else
    {
        localStorage['content_filter_on'] = "true";
        sogouExplorer.command.call("content_filter","on");
    }
    setSwitchAddBlockText();
}

// Display jQuery UI elements
$(function() {
    $('#tabs').tabs();
    $('button').button();
    $('.addButton').button('option', 'icons', {primary: 'ui-icon-plus'});
    $('.removeButton').button('option', 'icons', {primary: 'ui-icon-minus'});
    $('#userFiltersBox').dblclick(function(event){$('#newFilter').attr('value',this.options[this.selectedIndex].value);});
    $('#excludedDomainsBox').dblclick(function(event){$('#newWhitelistDomain').attr('value',this.options[this.selectedIndex].value);});
});