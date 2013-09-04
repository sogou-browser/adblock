/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Adblock Plus for Chrome.
 *
 * The Initial Developer of the Original Code is
 * T. Joseph <tom@adblockplus.org>.
 * Portions created by the Initial Developer are Copyright (C) 2009-2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  Wladimir Palant
 *
 * ***** END LICENSE BLOCK ***** */

// List of suggested filter lists
var filterFiles = {
  "easylist": "https://easylist-downloads.adblockplus.org/easylist.txt", // "easylist.txt",
     "china": "http://adblock-chinalist.googlecode.com/svn/trunk/adblock.txt", // "adblock.txt",
   "maxthon": "http://go.maxthon.cn/mx3/adfilter/index.htm", // maxthon
     "sogou": "http://sext.ie.sogou.com/app/adblock/re.php", // sogou list
    "extras": "https://easylist-downloads.adblockplus.org/chrome_supplement.txt",
   "wuleren": "http://sext.ie.sogou.com/app/adblock/wuleren-list.php", // 网友Wuleren提供
   "germany": "https://easylist-downloads.adblockplus.org/easylistgermany.txt", // "easylistgermany.txt",
    "fanboy": "https://secure.fanboy.co.nz/fanboy-adblock.txt",
 "fanboy_es": "https://secure.fanboy.co.nz/fanboy-espanol.txt",
    "france": "https://easylist-downloads.adblockplus.org/liste_fr+easylist.txt", // "liste_fr.txt",
    "russia": "https://ruadlist.googlecode.com/svn/trunk/advblock.txt",
     "korea": "http://abp-corset.googlecode.com/hg/corset.txt", // "corset.txt",
   "romania": "http://www.zoso.ro/pages/rolist.txt", // "menetzrolist.txt",
     "italy": "http://mozilla.gfsolone.com/filtri.txt", // "filtri.txt",
    "poland": "http://www.niecko.pl/adblock/adblock.txt", // PLgeneral
   "hungary": "http://pete.teamlupus.hu/hufilter.txt", // hufilter
  "sogou_test_hidden": "test.txt"
};


var filterListTitles = {
   "easylist": '<a target="_blank" href="http://easylist.adblockplus.org/">EasyList</a><span style="color:red">(推荐)</span>',
    "germany": 'EasyList Germany',
     "fanboy": '<a target="_blank" href="http://www.fanboy.co.nz/adblock/">Fanboy\'s List</a>',
  "fanboy_es": "Fanboy's Español/Português supplement",
     "france": 'EasyList + Liste FR (Français)',
      "china": '<a target="_blank" href="http://code.google.com/p/adblock-chinalist/">ChinaList</a> (中文)<span style="color:red">(推荐)</span>',
      "sogou": '<a target="_blank" href="http://sext.ie.sogou.com/app/adblock/re.php">SogouList</a> (中文)<span style="color:red">(推荐)</span>',
    "wuleren": '<a target="_blank" href="http://sext.ie.sogou.com/app/adblock/wuleren-list.php">搜狗论坛网友提供的规则</a> (中文)',
    "maxthon": '<a target="_blank" href="http://go.maxthon.cn/mx3/adfilter/index.htm">Maxthon</a> (中文)',
     "russia": '<a target="_blank" href="http://code.google.com/p/ruadlist/">RU AdList</a> (Русский, Українська)',
      "korea": '<a target="_blank" href="http://corset.tistory.com/">Corset</a> (한국어)',
    "romania": '<a target="_blank" href="http://www.picpoc.ro/">ROList</a> (Românesc)',
      "italy": '<a target="_blank" href="http://mozilla.gfsolone.com/">Xfiles</a> (Italiano)',
     "poland": '<a target="_blank" href="http://www.niecko.pl/adblock/">PLgeneral</a> (Polski)',
    "hungary": '<a target="_blank" href="http://pete.teamlupus.hu/site/?pg=hufilter">hufilter</a> (Magyar)',
     "extras": '<a target="_blank" href="' + filterFiles["extras"] + '">Recommended filters for Google Chrome</a><span style="color:red">(推荐)</span>',
  "sogou_test_hidden": '<a target="_blank" href="test.txt">搜狗测试名单</a>'
};

var filterListAuthors = {
   "easylist": 'Michael, Ares2, Erunno, Khrin, MonztA',
    "germany": 'Ares2, Erunno, MonztA',
     "fanboy": 'fanboy, Nitrox',
  "fanboy_es": 'fanboy, Nitrox',
     "france": 'Lian',
      "china": 'Gythialy',
    "maxthon": "maxthon",
      "sogou": "sogou",
    "wuleren": "wuleren",
     "russia": 'Lain_13',
      "korea": 'maybee',
    "romania": 'MenetZ, Zoso',
      "italy": 'Gioxx',
     "poland": 'Krzysztof Niecko',
    "hungary": 'Szabó Péter',
  "sogou_test_hidden": 'sogou'
};

// Filter lists turned on by default, guessed based on i18n reported locale.
// "easylist" and "extras" should be on by default everywhere, so it isn't included here.
var defaultFilterListsByLocale = {
  "de": ['easylist', 'germany'],
  "es": ['easylist', 'fanboy_es'],
  "fr": ['france'],
  "hu": ['easylist', 'hungary'],
  "it": ['easylist', 'italy'],
  "ko": ['easylist', 'korea'],
  "po": ['easylist', 'poland'],
  "pt": ['easylist', 'fanboy_es'],
  "pt_BR": ['easylist', 'fanboy_es'],
  "ro": ['easylist', 'romania'],
  "ru": ['easylist', 'russia'],
  "zh": ['easylist', 'china'],
  "zh_CN": ['easylist', 'china', "maxthon", "sogou", "wuleren"],
  "zh_TW": ['easylist', 'china', "maxthon"]
};

var maxthon = {
  findRules: function( obj, rulesKey ) {
    var strRules = '';
    for ( var key in obj ) {
      if ( key == rulesKey ) {
        var tempRules = obj[key];

        // 处理针对特定网站的rule
        if (typeof obj["name"] != "undefined"){
          var name = obj["name"];
          var tempRules = this.makeRulesForSite( tempRules, name );
        }

        // console.log(tempRules);
        return tempRules;
      }

      var childObj = obj[key];
      if (typeof childObj == "object"){
        //strRules += findRules(childObj, rulesKey) + "```````````````````````````";
        strRules += this.findRules( childObj, rulesKey );
      }
    }

    return strRules;
  },

  makeRulesForSite: function( tempRules, name ) {
    var arrRules = tempRules.split('\n');
    var retRules = '';

    for ( var i = 0; i < arrRules.length; i++ ){
      var rule = arrRules[i];
      if ( !rule ) {
        continue;
      }

      // 如果是注释，直接continue
      if ( rule.indexOf('!') == 0 ) {
        retRules += rule;
        continue;
      }

      // 如果规则中有##, 那么要在前面加上网址限定符
      if ( rule.indexOf("##") != -1 ) {
        rule = this.addDomainPrefix( rule, name );
        retRules += rule + '\n';
        continue;
      }

      // 其它情况就在后面加上网址限定符
      rule += "$domain=" + name;
      retRules += rule + '\n';
    }

    return retRules;
  },

  addDomainPrefix: function( rule, name ) {
    // 如果##不是处于字符串的开头，说明已经包含了网址前缀，直接返回
    if ( rule.indexOf("##") != 0 ) {
      return rule;
    }
    return name + rule;
  },

  handleQMark: function( rules ){
    var arrRules = rules.split('\n');
    for (var i = 0; i < arrRules.length; i++){
      var rule = arrRules[i];
      if ( !rule ){
        continue;
      }

      if ( rule.indexOf('?') != -1 && rule.indexOf("##") == -1 ) {
        //console.log(rule);
        //qRules += rule + "<br />";
        // 删除该规则
        delete arrRules[i];
      }
    }
    return arrRules.join('\n');
  }
};

// Default filter list expiration time is 3 days (specified in milliseconds)
// But, in case that is garbled in the filter list, clamp it to a predefined range
const MILLISECONDS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 60 * SECONDS_IN_MINUTE;
const SECONDS_IN_DAY = 24 * SECONDS_IN_HOUR;
const MIN_EXPIRATION_INTERVAL = 1 * SECONDS_IN_DAY;
const DEFAULT_EXPIRATION_INTERVAL =  3 * SECONDS_IN_DAY;
const MAX_EXPIRATION_INTERVAL = 14 * SECONDS_IN_DAY;


// Adds entries in filterFiles for any user filters. Other functions will
// reference filterFiles directly, even though global variables are evil.
function loadUserFilterURLs() {
  // Get rid of all user_* entries; we'll restore them from localStorage
  for( key in filterFiles ) {
    if ( key.match(/^user_/) )
      delete filterFiles[key];
  }

  // Read the user filter URLs from localStorage
  if ( typeof localStorage["userFilterURLs"] != "string" ) {
    return; // Nothing there
  }

  // 用户可订阅其它过滤规则 - URL 地址.
  var urls = JSON.parse( localStorage["userFilterURLs"] );
  for ( key in urls ) {
    filterFiles[key] = urls[key];
  }
}


// TODO: In case of error fetching a filter list, check to see whether
// we already have a copy cached, and leave it there.
// At present the cached copy can be deleted.
function FilterListFetcher(nameOrUrl, callback) {

  // 确定 name/url.
  if ( nameOrUrl.match(/^http/i) ) {
    this.url = nameOrUrl;
    this.name = null;
    for ( var name in filterFiles ) {
        if ( filterFiles[name] == this.url ) {
            this.name = name;
            break;
        }
    }
    if ( this.name == null ) {
      this.name = nameOrUrl;
    }
  }
  else {
    this.name = nameOrUrl;
    this.url = filterFiles[nameOrUrl];
  }

  // Accept name as URL if it starts with http
  this.callback = typeof callback === 'function' ? callback : function() {};
  this.xhr = new XMLHttpRequest();
  this.error = false;
  var fetcher = this;
  this.xhr.onreadystatechange = function () {
    if ( this.readyState != 4 ) return;
    if ( this.status == 200 ) {
      // Check if it's actually a filter set and if so, save it along with its expiry information
      var result = this.responseText;

      if (result.match(/\[Adblock/)) {

        var expires = DEFAULT_EXPIRATION_INTERVAL;
        if ( /\bExpires\s*(?::|after)\s*(\d+)\s*(h)?/i.test(result) ) {
          var interval = parseInt(RegExp.$1);
          if (RegExp.$2)
            interval *= SECONDS_IN_HOUR;
          else
            interval *= SECONDS_IN_DAY;

          if (interval > 0)
            expires = interval;
        }
        expires *= MILLISECONDS_IN_SECOND;

        localStorage[ fetcher.url ] = JSON.stringify({
          lastDownloaded: Date.now(),
          lastUpdated: Date.now(),
          expires: expires
          /*, text: result*/
        });

        /* 在此添加获取处理结果 */
        sogouExplorer.command.contentFilter.writeFullList( fetcher.name, this.responseText );


        fetcher.callback( fetcher );
        return;
      }
      else if ( result.match(/Maxthon\sList/i) ) {
        try {
          var rules = result;
          //rules = rules.replace(/,\s}/g, '}');   // 去掉}之前的最后一个,
          //rules = rules.replace(/,\s]/g, ']');   // 去掉]之前的最后一个,
          rules = eval( '(' + rules + ')' );
          var expires = DEFAULT_EXPIRATION_INTERVAL;
          var strRules = maxthon.findRules( rules, "data_1_0" );
          strRules = maxthon.handleQMark( strRules );
          //console.log(strRules);
          localStorage[ fetcher.url ] = JSON.stringify({
            lastDownloaded: Date.now(),
            lastUpdated: Date.now(),
            expires: expires
          });

          sogouExplorer.command.contentFilter.writeFullList( fetcher.name, strRules );
          fetcher.callback( fetcher );
          return;
        }catch(e){
          console.log(e);
        }
      } else {
        fetcher.error = "您输入的url不是abp filter列表";
        fetcher.callback(fetcher);
        return;
      }
    }
    else if( this.status == 404 ) {
      fetcher.error = "Error 404: 在服务器上没有找到列表";
      localStorage[ fetcher.url ] = JSON.stringify({
        lastUpdated: Date.now(),
        error: fetcher.error
      });
      fetcher.callback( fetcher );
      return;
    }
    else if ( this.status == 503 ) {
      // Most likely a 503 means quota exceeded on the server
      // XXX: We aren't signaling an error here because we don't want to disable checking of this filter list
    }
    // TODO: Doesn't actually do anything in case of other errors
  }

  try {
    this.xhr.open( "GET", this.url, true );
    this.xhr.send( null );
  }
  catch (e) {
    fetcher.error = "Useless error message: " + e;
    fetcher.callback(fetcher);
  }
}

