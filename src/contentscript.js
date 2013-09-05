//alert(1);
if (typeof(window.com_sogou_abp) == 'undefined') {
    window.com_sogou_abp = {
        currentElement: null,
        currentElement_backgroundColor: null,
        currentElement_boxShadow: null,
        highlightColor: "yellow",
        isIE: false,
        clickHideFilters: null,
        selectorList: null,
        clickHide_activated: false,
        clickHide_activate: function() {
            if (this.clickHide_activated == true) {
                return;
            }
            this.clickHide_activated = true;
            try {
                var elts = document.getElementsByTagName('object');
                for (var i = 0; i < elts.length; i++)
                    com_sogou_abp.addElementOverlay(elts[i]);
                elts = document.getElementsByTagName('embed');
                for (var i = 0; i < elts.length; i++)
                    com_sogou_abp.addElementOverlay(elts[i]);
                elts = document.getElementsByTagName('img');
                for (var i = 0; i < elts.length; i++)
                    com_sogou_abp.addElementOverlay(elts[i]);
                elts = document.getElementsByTagName('iframe');
                for (var i = 0; i < elts.length; i++)
                    com_sogou_abp.addElementOverlay(elts[i]);
            } catch (e) {
                //alert(e);
            }

            if (document.addEventListener) {
                document.addEventListener("mouseover", com_sogou_abp.mouseOverHandler, true);
                document.addEventListener("mouseout", com_sogou_abp.mouseOutHandler, true);
                document.addEventListener("click", com_sogou_abp.clickHide_mouseClick, true);
            } else {
                document.attachEvent("onmouseover", com_sogou_abp.mouseOverHandler);
                document.attachEvent("onmouseout", com_sogou_abp.mouseOutHandler);
                document.attachEvent("onclick", com_sogou_abp.clickHide_mouseClick);
            }

        },
        mouseOverHandler: function(e) {
            if (com_sogou_abp.clickHide_activated == false) {
                return;
            }
            var event = e ? e : window.event;
            var target = event.target ? event.target : event.srcElement;
            if (target.id || target.className || target.src) {
                if (com_sogou_abp.currentElement != null &&
                    com_sogou_abp.currentElement_backgroundColor != null) {
                    com_sogou_abp.currentElement.style.backgroundColor = com_sogou_abp.currentElement_backgroundColor;
                }
                com_sogou_abp.currentElement = target;
                com_sogou_abp.currentElement_backgroundColor = target.style.backgroundColor;
                if (!com_sogou_abp.isIE)
                    com_sogou_abp.currentElement_boxShadow = target.style.getPropertyValue("-webkit-box-shadow");

                target.style.backgroundColor = com_sogou_abp.highlightColor;
            }
        },
        mouseOutHandler: function(e) {
            var event = e ? e : window.event;
            var target = event.target ? event.target : event.srcElement;
            if (target == com_sogou_abp.currentElement) {
                if (com_sogou_abp.currentElement != null &&
                    com_sogou_abp.currentElement_backgroundColor != null) {
                    com_sogou_abp.currentElement.style.backgroundColor = com_sogou_abp.currentElement_backgroundColor;
                    if (!com_sogou_abp.isIE)
                        com_sogou_abp.currentElement.style.setProperty("-webkit-box-shadow", currentElement_boxShadow);

                    //com_sogou_abp.currentElement = null;
                }
            }
        },
        addElementOverlay: function(elt) {
            if (!elt) return null;
            var url = this.getElementURL(elt);
            if (!elt.className && !elt.id && !url) return;
            if (typeof(getComputedStyle) != 'undefined')
                var thisStyle = getComputedStyle(elt, null);
            else {
                var thisStyle = {
                    width: elt.offsetWidth,
                    height: elt.offsetHeight
                };
                ////alert(thisStyle.width + ", " + thisStyle.height);
            }
            var overlay = document.createElement('div');
            overlay.prisoner = elt;
            overlay.prisonerURL = url;
            overlay.className = "__adblockplus__overlay";
            if (!this.isIE) {
                overlay.setAttribute('style', 'opacity:0.4; background-color:#ffffff; display:inline-box; ' + 'width:' + thisStyle.width + '; height:' + thisStyle.height + '; position:absolute; overflow:hidden; -webkit-box-sizing:border-box; z-index: 99999');
            } else {
                overlay.style.cssText = 'filter:Alpha(opacity=40); background-color:#ffffff; display:inline-block; ' + 'width:' + thisStyle.width + 'px; height:' + thisStyle.height + 'px; position:absolute; overflow:hidden; z-index: 99999';
                /*overlay.style.filter = "Alpha(opacity=40)";
                overlay.style.backgroundColor = "#ffffff";
                overlay.style.display = "inline-block";
                overlay.style.width = thisStyle.width;
                overlay.style.height = thisStyle.height;
                overlay.style.position = 'absolute';
                overlay.style.overflow = 'hidden';
                overlay.style.zIndex = 99999;*/
            }
            var pos = com_sogou_abp.getPosFromElement(elt);
            ////alert(elt.tagName);
            ////alert(pos);
            overlay.style.left = pos[0] + "px";
            overlay.style.top = pos[1] + "px";
            // elt.parentNode.appendChild(overlay, elt);
            document.body.appendChild(overlay);
            return overlay;
        },
        clickHide_mouseClick: function(e) {
            //alert(2);
            var event = e ? e : window.event;
            if (!com_sogou_abp.currentElement) return;
            //alert(3);
            var elt = com_sogou_abp.currentElement;
            var url = null;
            if (com_sogou_abp.currentElement.className && com_sogou_abp.currentElement.className == "__adblockplus__overlay") {
                elt = com_sogou_abp.currentElement.prisoner;
                url = com_sogou_abp.currentElement.prisonerURL;
            } else if (elt.src) {
                url = elt.src;
            }
            //alert(4);

            // Only normalize when the element contains a URL (issue 328.)
            // The URL is not always normalized, so do it here
            if (url)
                url = com_sogou_abp.normalizeURL(com_sogou_abp.relativeToAbsoluteUrl(url));
            //alert(5);

            // Construct filters. The popup will retrieve these.
            // Only one ID
            var elementId = elt.id ? elt.id.split(' ').join('') : null;
            // Can have multiple classes, and there might be extraneous whitespace
            var elementClasses = null;
            if (elt.className) {
                elementClasses = elt.className.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').split(' ');
            }
            //alert(6);

            com_sogou_abp.clickHideFilters = new Array();
            com_sogou_abp.selectorList = new Array();
            if (elementId) {
                com_sogou_abp.clickHideFilters.push(document.location.host + "###" + elementId);
                com_sogou_abp.selectorList.push("#" + elementId);
            }
            if (elementClasses) {
                for (var i = 0; i < elementClasses.length; i++) {
                    com_sogou_abp.clickHideFilters.push(document.location.host + "##." + elementClasses[i]);
                    com_sogou_abp.selectorList.push("." + elementClasses[i]);
                }
            }
            if (url) {
                com_sogou_abp.clickHideFilters.push(com_sogou_abp.relativeToAbsoluteUrl(url));
                if (elt.src) {
                    com_sogou_abp.clickHideFilters.push(document.location.host + "##" + elt.localName + '[src="' + elt.src + '"]');
                    com_sogou_abp.selectorList.push(elt.localName + '[src="' + url + '"]');
                }
            }
            //alert(7);
            // Show popup
            com_sogou_abp.clickHide_showDialog(event.clientX, event.clientY, com_sogou_abp.clickHideFilters);
            //alert(8);

            // Highlight the unlucky elements
            // Restore currentElement's box-shadow and bgcolor so that highlightElements won't save those
            com_sogou_abp.currentElement.style.backgroundColor = com_sogou_abp.currentElement_backgroundColor;
            // Highlight the elements specified by selector in yellow
            if (!com_sogou_abp.isIE) {
                com_sogou_abp.currentElement.style.setProperty("-webkit-box-shadow", com_sogou_abp.currentElement_boxShadow);
                //alert(8.5);
            }
            com_sogou_abp.highlightElements(com_sogou_abp.selectorList.join(","));
            //alert(9);
            // Now, actually highlight the element the user clicked on in red
            if (!com_sogou_abp.isIE)
                com_sogou_abp.currentElement.style.setProperty("-webkit-box-shadow", "inset 0px 0px 5px #fd1708");
            com_sogou_abp.currentElement.style.backgroundColor = "#f6a1b5";

            // Half-deactivate click-hide so the user has a chance to click the page action icon.
            // currentElement is still set to the putative element to be blocked.
            com_sogou_abp.clickHide_rulesPending();
            //alert(10);
            if (!com_sogou_abp.isIE)
                event.preventDefault();
            else
                return false;
        },
        clickHide_rulesPending: function() {
            com_sogou_abp.clickHide_activated = false;
            if (document.removeEventListener) {
                document.removeEventListener("mouseover", com_sogou_abp.mouseOverHandler, true);
                document.removeEventListener("mouseout", com_sogou_abp.mouseOverHandler, true);
                document.removeEventListener("click", com_sogou_abp.clickHide_mouseClick, true);
            } else {
                document.detachEvent("onmouseover", com_sogou_abp.mouseOverHandler);
                document.detachEvent("onmouseout", com_sogou_abp.mouseOutHandler);
                document.detachEvent("onclick", com_sogou_abp.clickHide_mouseClick);
            }
        },
        addRules: function(filters) {
            sogouExplorer.extension.sendRequest({
                cmd: "addRules",
                filters: filters
            });
        },
        clickHide_showDialog: function(left, top, filters) {
            // Limit the length the filters string shown so it doesn't clip
            var filtersString = "";
            for (var i = 0; i < filters.length; i++) {
                if (filters[i].length > 80)
                    filtersString += filters[i].substring(0, 80) + "&hellip;";
                else
                    filtersString += filters[i];
                filtersString += "<br/>";
            }

            this.clickHideFiltersDialog = document.createElement('div');
            if (!this.isIE) {
                this.clickHideFiltersDialog.setAttribute('style', 'visibility:hidden; -webkit-user-select:none; font-family: Helvetica,Arial,sans-serif !important; font-size: 10pt; color: #505050 !important; position: fixed; -webkit-box-shadow: 5px 5px 20px rgba(0,0,0,0.5); background: #ffffff; z-index: 99999; padding: 10px; border-radius: 5px');
            } else {
                this.clickHideFiltersDialog.style.cssText = 'visibility:hidden; font-family: Helvetica,Arial,sans-serif; font-size: 10pt; color: #505050; position: fixed;  background: #ffffff; z-index: 99999; padding: 10px; border: 1px solid';
                /*this.clickHideFiltersDialog.style.visibility = 'hidden';
                this.clickHideFiltersDialog.style.fontFamily = 'Helvetica,Arial,sans-serif';
                this.clickHideFiltersDialog.style.fontSize = '10pt';
                this.clickHideFiltersDialog.style.color = '#505050';
                this.clickHideFiltersDialog.style.position = 'fixed';
                this.clickHideFiltersDialog.style.background = '#ffffff';
                this.clickHideFiltersDialog.style.zIndex = 99999;
                this.clickHideFiltersDialog.style.padding = '10px';*/
            }
            this.clickHideFiltersDialog.innerHTML = '<table style="margin:0px;border:0px;"><tr><td style="padding:0; background: #ffffff; padding-right: 5px; border: 0px; vertical-align: middle;"><img src="' + sogouExplorer.extension.getURL('default-big.png') + '"/></td><td style="padding:0; background: #ffffff; text-align: left; vertical-align: middle; border: 0px;">' + "添加过滤规则?" + '</td></tr></table><div style="border:1px solid #c0c0c0; padding:3px; min-width: 200px; font-size:8pt !important; line-height: 10pt !important; font-color: #909090 !important; background: #ffffff !important">' + filtersString + '</div>';

            buttonsDiv = document.createElement('div');
            if (!this.isIE) {
                buttonsDiv.setAttribute('style', 'text-align: right');
            } else {
                buttonsDiv.style.textAlign = 'right';
            }

            function makeButton(id) {
                var b = document.createElement('button');
                b.setAttribute("id", id);
                // Use the jQuery UI style for the button explicitly
                if (!this.isIE) {
                    b.setAttribute("style", "padding: 3px; margin-left: 5px; font-size: 8pt; border: 1px solid #d3d3d3; background: #e6e6e6 url(" + sogouExplorer.extension.getURL("jquery-ui/css/smoothness/images/ui-bg_glass_75_e6e6e6_1x400.png") + ") 50% 50% repeat-x; color: #555555; -webkit-border-radius: 4px; font-family: Helvetica, Arial, sans-serif;");
                } else {
                    b.style.cssText = "padding: 3px; margin-left: 5px; font-size: 8pt; border: 1px solid #d3d3d3; background: #e6e6e6 url(" + sogouExplorer.extension.getURL("jquery-ui/css/smoothness/images/ui-bg_glass_75_e6e6e6_1x400.png") + ") 50% 50% repeat-x; color: #555555; -webkit-border-radius: 4px; font-family: Helvetica, Arial, sans-serif;";
                }
                return b;
            }
            var addButton = makeButton("addButton");
            addButton.innerText = "添加";
            addButton.onclick = function() {
                //alert('addButton onclick');
                // Save the filters that the user created
                //sogouExplorer.extension.sendRequest({reqtype: "cache-filters", filters: clickHideFilters});
                //sogouExplorer.extension.sendRequest({reqtype: "apply-cached-filters", filters: filters});

                // Do Add Rule
                com_sogou_abp.addRules(com_sogou_abp.clickHideFilters);
                com_sogou_abp.injectCss(com_sogou_abp.selectorList.join(",") + "{display: none !important;}");

                //alert(0);
                // Explicitly get rid of currentElement in case removeAdsAgain() doesn't catch it
                if (com_sogou_abp.currentElement.parentNode) {
                    //alert(1);
                    com_sogou_abp.currentElement.parentNode.removeChild(com_sogou_abp.currentElement);
                    // currentElement may actually be our overlay if right-click element selection was used
                    if (com_sogou_abp.currentElement.prisoner && com_sogou_abp.currentElement.prisoner.parentNode)
                        com_sogou_abp.currentElement.prisoner.parentNode.removeChild(com_sogou_abp.currentElement.prisoner);
                }
                //alert(2);
                com_sogou_abp.clickHide_deactivate();
                //removeAdsAgain();
                // Tell options.html to refresh its user filters listbox
                //sogouExplorer.extension.sendRequest({reqtype: "refresh-user-filters-box"});
                //alert('addButton onclick end');

            };
            var cancelButton = makeButton("cancelButton");
            cancelButton.innerText = "取消";
            cancelButton.onclick = function() {
                // Tell popup (indirectly) to shut up about easy create filter
                //sogouExplorer.extension.sendRequest({reqtype: "set-clickhide-active", active: false});
                com_sogou_abp.clickHide_deactivate();
            }
            buttonsDiv.appendChild(addButton);
            buttonsDiv.appendChild(cancelButton);

            // Make dialog partly transparent when mouse isn't over it so user has a better
            // view of what's going to be blocked
            this.clickHideFiltersDialog.onmouseout = function() {
                if (!com_sogou_abp.isIE) {
                    com_sogou_abp.clickHideFiltersDialog.style.setProperty("opacity", "0.7");
                } else {
                    com_sogou_abp.clickHideFiltersDialog.style.filter = "Alpha(opacity=70)";
                }
            }
            this.clickHideFiltersDialog.onmouseover = function() {
                if (!com_sogou_abp.isIE) {
                    com_sogou_abp.clickHideFiltersDialog.style.setProperty("opacity", "1.0");
                } else {
                    com_sogou_abp.clickHideFiltersDialog.style.filter = "Alpha(opacity=100)";
                }
            }

            this.clickHideFiltersDialog.appendChild(buttonsDiv);
            document.body.appendChild(this.clickHideFiltersDialog);
            // Position in upper-left all the time
            this.clickHideFiltersDialog.style.left = "50px";
            this.clickHideFiltersDialog.style.top = "50px";
            this.clickHideFiltersDialog.style.visibility = "visible";
            if (!this.isIE)
                this.clickHideFiltersDialog.addEventListener('mousedown', this.dragStart, false);
            else
                this.clickHideFiltersDialog.attachEvent('onmousedown', this.dragStart);
        },


        // Highlight elements according to selector string. This would include
        // all elements that would be affected by proposed filters.
        highlightElements: function(selectorString) {
            //alert("highlightElements");
            if (this.highlightedElementsSelector) {
                this.unhighlightElements();
            }
            this.highlightedElementsSelector = selectorString;
            if (!com_sogou_abp.isIE) {
                this.highlightedElements = document.querySelectorAll(selectorString);
                this.highlightedElementsBoxShadows = new Array();
                this.highlightedElementsBGColors = new Array();
                //alert(1);

                for (var i = 0; i < this.highlightedElements.length; i++) {
                    this.highlightedElementsBoxShadows[i] = this.highlightedElements[i].style.getPropertyValue("-webkit-box-shadow");
                    this.highlightedElementsBGColors[i] = this.highlightedElements[i].style.backgroundColor;
                    this.highlightedElements[i].style.setProperty("-webkit-box-shadow", "inset 0px 0px 5px #fd6738");
                    this.highlightedElements[i].style.backgroundColor = "#f6e1e5";
                }
            } else {
                this.injectCss(selectorString + " {background-color: #f6e1e5 !important;}", "com_sogou_abp_highlight_style");
            }
            //alert("highlightElements end");

        },

        // Unhighlight all elements, including those that would be affected by
        // the proposed filters
        unhighlightElements: function() {
            if (this.highlightedElementsSelector == null)
                return;
            if (!this.isIE) {
                this.highlightedElements = document.querySelectorAll(this.highlightedElementsSelector);
                for (var i = 0; i < this.highlightedElements.length; i++) {
                    this.highlightedElements[i].style.setProperty("-webkit-box-shadow", this.highlightedElementsBoxShadows[i]);
                    this.highlightedElements[i].style.backgroundColor = this.highlightedElementsBGColors[i];
                }
            } else {
                this.removeCss("com_sogou_abp_highlight_style");
            }
            this.highlightedElementsSelector = null;
        },
        clickHide_deactivate: function() {
            if (this.clickHideFiltersDialog) {
                this.clickHideFiltersDialog.style.cssText = 'visibility: hidden';
                document.body.removeChild(this.clickHideFiltersDialog);
                this.clickHideFiltersDialog = null;
            }
            if (this.currentElement) {
                this.unhighlightElements();
                if (!com_sogou_abp.isIE)
                    this.currentElement.style.setProperty("-webkit-box-shadow", com_sogou_abp.currentElement_boxShadow);
                this.currentElement.style.backgroundColor = com_sogou_abp.currentElement_backgroundColor;
                this.currentElement = null;
                this.clickHideFilters = null;
            }

            this.clickHide_activated = false;
            if (!document)
                return; // This can happen inside a nuked iframe...I think

            if (document.removeEventListener) {
                document.removeEventListener("mouseover", com_sogou_abp.mouseOverHandler, true);
                document.removeEventListener("mouseout", com_sogou_abp.mouseOverHandler, true);
                document.removeEventListener("click", com_sogou_abp.clickHide_mouseClick, true);

                // Remove overlays
                // For some reason iterating over the array returend by getElementsByClassName() doesn't work
                var elt;
                while (elt = document.querySelector('.__adblockplus__overlay'))
                    elt.parentNode.removeChild(elt);
            }
            // IE
            else {
                document.detachEvent("onmouseover", com_sogou_abp.mouseOverHandler);
                document.detachEvent("onmouseout", com_sogou_abp.mouseOutHandler);
                document.detachEvent("onclick", com_sogou_abp.clickHide_mouseClick);
                var elems = com_sogou_abp.getElementsByClass("__adblockplus__overlay", document.body, "div");
                var len = elems.length;
                for (var i = 0; i < len; i++) {
                    try {
                        elems[i].parentNode.removeChild(elems[i]);
                    } catch (e) {
                        //do nothing, in case this element is already deleted with some ancestor element.
                    }
                }
            }
        },


        //Drag Handlers
        // Allow dragging of the clickhide dialog box. This is nice to have for blocking elements
        // inside small iframes that are too narrow to completely contain the clickhide dialog box.
        // This way the user can drag the box over to click one of its buttons.
        // Not a perfect solution but better than nothing.
        draggedElement: null,
        dragMouseOffset: null,
        docUserSelect: null, // Saves value of document-wide -webkit-user-select

        dragEnd: function(e) {
            if (com_sogou_abp.draggedElement) {
                if (!com_sogou_abp.isIE) {
                    document.removeEventListener("mouseup", com_sogou_abp.dragEnd, false);
                    document.removeEventListener("mousemove", com_sogou_abp.dragMove, false);
                    document.documentElement.style.setProperty('-webkit-user-select', docUserSelect);
                } else {
                    document.detachEvent("onmouseup", com_sogou_abp.dragEnd);
                    document.detachEvent("onmousemove", com_sogou_abp.dragMove);
                    document.detachEvent("onselectstart", com_sogou_abp.preventSelectInIE);
                }
                com_sogou_abp.draggedElement = null;
            }
        },
        preventSelectInIE: function() {
            return false;
        },
        dragStart: function(e) {
            var event = e ? e : window.event;
            var target = event.target ? event.target : event.srcElement;
            com_sogou_abp.draggedElement = target;
            var pos = com_sogou_abp.getPosFromElement(target);
            if (!com_sogou_abp.isIE) {
                com_sogou_abp.dragMouseOffset = [e.pageX - pos[0], e.pageY - pos[1]];
                document.addEventListener("mouseup", com_sogou_abp.dragEnd, false);
                document.addEventListener("mousemove", com_sogou_abp.dragMove, false);
                // Make document un-highlightable during drag. Otherwise, if user drags too fast and
                // the mouse pointer leaves the bounds of the dialog box, text selection on the page
                // will be triggered, and that is ugly
                com_sogou_abp.docUserSelect = document.documentElement.style.getPropertyCSSValue('-webkit-user-select');
                document.documentElement.style.setProperty('-webkit-user-select', 'none');
            } else {
                com_sogou_abp.dragMouseOffset = [event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - pos[0],
                    event.clientY + document.body.scrollTop + document.documentElement.scrollTop - pos[1]
                ];
                document.attachEvent("onmouseup", com_sogou_abp.dragEnd);
                document.attachEvent("onmousemove", com_sogou_abp.dragMove);
                document.attachEvent("onselectstart", com_sogou_abp.preventSelectInIE);
            }
        },
        dragMove: function(e) {
            if (com_sogou_abp.draggedElement) {
                var event = e ? e : window.event;
                if (!com_sogou_abp.isIE) {
                    com_sogou_abp.draggedElement.style.left = (e.pageX - com_sogou_abp.dragMouseOffset[0]) + "px";
                    com_sogou_abp.draggedElement.style.top = (e.pageY - com_sogou_abp.dragMouseOffset[1]) + "px";
                } else {
                    com_sogou_abp.draggedElement.style.left = (event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - com_sogou_abp.dragMouseOffset[0]) + "px";
                    com_sogou_abp.draggedElement.style.top = (event.clientY + document.body.scrollTop + document.documentElement.scrollTop - com_sogou_abp.dragMouseOffset[1]) + "px";
                }
            }
        },

        //Utils
        getElementsByClass: function(searchClass, node, tag) {
            var classElements = new Array();
            if (node == null)
                node = document;
            if (tag == null)
                tag = '*';
            var els = node.getElementsByTagName(tag);
            var elsLen = els.length;
            var pattern = new RegExp("(^|\\s)" + searchClass + "(\\s|$)");
            for (i = 0, j = 0; i < elsLen; i++) {
                if (pattern.test(els[i].className)) {
                    classElements[j] = els[i];
                    j++;
                }
            }
            return classElements;
        },
        // This function Copyright (c) 2008 Jeni Tennison, from jquery.uri.js
        // and licensed under the MIT license. See jquery-*.min.js for details.
        removeDotSegments: function(u) {
            var r = '',
                m = [];
            if (/\./.test(u)) {
                while (u !== undefined && u !== '') {
                    if (u === '.' || u === '..') {
                        u = '';
                    } else if (/^\.\.\//.test(u)) { // starts with ../
                        u = u.substring(3);
                    } else if (/^\.\//.test(u)) { // starts with ./
                        u = u.substring(2);
                    } else if (/^\/\.(\/|$)/.test(u)) { // starts with /./ or consists of /.
                        u = '/' + u.substring(3);
                    } else if (/^\/\.\.(\/|$)/.test(u)) { // starts with /../ or consists of /..
                        u = '/' + u.substring(4);
                        r = r.replace(/\/?[^\/]+$/, '');
                    } else {
                        m = u.match(/^(\/?[^\/]*)(\/.*)?$/);
                        u = m[2];
                        r = r + m[1];
                    }
                }
                return r;
            } else {
                return u;
            }
        },

        normalizeURL: function(url) {
            var components = url.match(/(.+:\/\/.+?)\/(.*)/);
            if (!components)
                return url;
            var newPath = com_sogou_abp.removeDotSegments(components[2]);
            if (newPath.length == 0)
                return components[1];
            if (newPath[0] != '/')
                newPath = '/' + newPath;
            return components[1] + newPath;
        },
        relativeToAbsoluteUrl: function(url) {
            // If URL is already absolute, don't mess with it
            if (!url || url.match(/^http/i))
                return url;
            // Leading / means absolute path
            if (url[0] == '/') {
                return document.location.protocol + "//" + document.location.host + url;
            }

            if (typeof(document.baseURI) == 'undefined')
                return document.location.href.substr(0, document.location.href.lastIndexOf('/')) + "//" + document.location.host + "//" + url;
            // Remove filename and add relative URL to it
            var base = document.baseURI.match(/.+\//);
            if (!base)
                return document.baseURI + "/" + url;
            return base[0] + url;
        },
        // Extracts source URL from an IMG, OBJECT, EMBED, or IFRAME
        getElementURL: function(elt) {
            // Check children of object nodes for "param" nodes with name="movie" that specify a URL
            // in value attribute
            var url;
            var bFound = false;
            if (elt.tagName.toUpperCase() == "OBJECT" && !(url = elt.getAttribute("data"))) {
                // No data attribute, look in PARAM child tags for a URL for the swf file
                var params = elt.getElementsByTagName("param");
                // This OBJECT could contain an EMBED we already nuked, in which case there's no URL
                var len = params.length;

                for (var i = 0; i < len; i++) {
                    if (params[i].getAttribute('name') != null && params[i].getAttribute('name') == 'movie') {
                        bFound = true;
                        url = params[i].getAttribute("value");
                    }
                }
                if (bFound == false) {
                    for (i = 0; i < len; i++) {
                        if (params[i].getAttribute('name') != null && params[i].getAttribute('name') == 'src')
                            url = params[0].getAttribute("value");
                    }
                }
            } else if (!url) {
                url = elt.getAttribute("src") || elt.getAttribute("href");
            }
            return url;
        },
        getPosFromElement: function(elt) {
            var l = 0;
            var t = 0;
            for (; elt; elt = elt.offsetParent) {
                l += elt.offsetLeft;
                t += elt.offsetTop;
            }
            return [l, t];
        },
        injectCss: function(rule, styleId) {
            var head = document.getElementsByTagName('head')[0],
                style = document.createElement('style'),
                rules = document.createTextNode(rule);
            if (styleId) {
                if (this.isIE)
                    style.id = styleId;
                else
                    style.setAttribute('id', styleId);
            }
            style.type = 'text/css';
            if (style.styleSheet)
                style.styleSheet.cssText = rules.nodeValue;
            else
                style.appendChild(rules);
            head.appendChild(style);
        },
        removeCss: function(styleId) {
            var style = document.getElementById(styleId);
            style.parentNode.removeChild(style);
        }
    };
    com_sogou_abp.isIE = !(navigator.userAgent.indexOf("MSIE") == -1);
    sogouExplorer.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(request) {
            switch (request.cmd) {
                case "isClipping":
                    if (window.top == window) //顶层窗口才发
                        port.postMessage({
                            cmd: "isClipping",
                            result: com_sogou_abp.clickHide_activated
                        });
                    break;
                case "startClipping":
                    com_sogou_abp.clickHide_activate();
                    if (window.top == window) //顶层窗口才发
                        port.postMessage({
                            cmd: "isClipping",
                            result: com_sogou_abp.clickHide_activated
                        });
                    break;
                case "cancelClipping":
                    com_sogou_abp.clickHide_deactivate();
                    if (window.top == window) //顶层窗口才发
                        port.postMessage({
                            cmd: "isClipping",
                            result: com_sogou_abp.clickHide_activated
                        });
                    break;
            }
        });
    });
    /*    sogouExplorer.extension.onRequest.addListener(function (request, sender, sendResponse){
        switch (request.cmd) {
            case "isClipping":
                sendResponse({cmd: "isClipping", result: com_sogou_abp.clickHide_activated});
                break;
            case "startClipping":
                com_sogou_abp.clickHide_activate();
                sendResponse({cmd: "isClipping", result: com_sogou_abp.clickHide_activated});
                break;
            case "cancelClipping":
                com_sogou_abp.clickHide_deactivate();
                sendResponse({cmd: "isClipping", result: com_sogou_abp.clickHide_activated});
                break;
        }
    });*/
}
