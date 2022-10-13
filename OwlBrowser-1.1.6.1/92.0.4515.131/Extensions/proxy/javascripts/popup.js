// Chrome Proxy helper
// popup.js
// https://raw.github.com/henices/Chrome-proxy-helper/master/javascripts/popup.js
/**
 * @fileoverview *
 * @author: zhouzhenster@gmail.com
 * @update yisin
 */
var proxySetting = {
	'proxy_rule': 'singleProxy',
	'bypasslist': '',
	'socks_host': '',
	'socks_port': '',
	'socks_type': '',
	'http_host': '',
	'http_port': '',
	'https_host': '',
	'https_port': '',
	'pac_type': 'file://',
	'pac_script_url': '',
	'internal': 'local',
	'auth': {
		'user': '',
		'pass': ''
	}
};
var iipp = "no";
try{
	proxySetting = JSON.parse(localStorage.proxySetting);
}catch(e){	
	localStorage.setItem('proxySetting', JSON.stringify(proxySetting));
	localStorage.proxySetting = JSON.stringify(proxySetting);
}
var proxyRule = proxySetting['proxy_rule'];
var bypasslist = proxySetting['bypasslist'];
var socksHost = proxySetting['socks_host'];
var socksPort = proxySetting['socks_port'];
var socksType = proxySetting['socks_type'];
var httpHost = proxySetting['http_host'];
var httpPort = proxySetting['http_port'];
var httpsHost = proxySetting['https_host'];
var httpsPort = proxySetting['https_port'];
var pacType = proxySetting['pac_type'];
var pacScriptUrl = proxySetting['pac_script_url'];

var chinaList = JSON.parse(localStorage.chinaList);
if (proxySetting['internal'] == 'china') {
    bypasslist = chinaList.concat(bypasslist.split(','));
} else{ 
	bypasslist = bypasslist ? bypasslist.split(',') : ['<local>'];
}

/**
 * set help message for popup page
 */
function add_li_title() {
    var _http, _https, _socks, _pac;
    if (httpHost && httpPort) {
        _http = 'http://' + httpHost + ':' + httpPort;
        $('#http-proxy').attr('title', _http);
    }
    if (pacScriptUrl) {
        var type = pacType.split(':')[0];
        _pac = pacType + pacScriptUrl[type];
        $('#pac-script').attr('title', _pac);
    }
    if (httpsHost && httpsPort) {
        _https = 'https://' + httpsHost + ':' + httpsPort;
        $('#https-proxy').attr('title', _https);
    }
    if (socksHost && socksPort) {
        _socks = socksType + '://' + socksHost + ':' + socksPort;
        $('#socks5-proxy').attr('title', _socks);
    }
}
/**
 * set popup page item blue color
 *
 */
function color_proxy_item() {
    var mode, rules, proxyRule, scheme;
    chrome.proxy.settings.get({
        'incognito': false
    }, function(config) {       
        mode = config['value']['mode'];
		if(iipp=="no"){
			mode = "direct";
		}
        rules = config['value']['rules'];
        if (rules) {
            if (rules.hasOwnProperty('singleProxy')) {
                proxyRule = 'singleProxy';
            } else if (rules.hasOwnProperty('proxyForHttp')) {
                proxyRule = 'proxyForHttp';
            } else if (rules.hasOwnProperty('proxyForHttps')) {
                proxyRule = 'proxyForHttps'
            } else if (rules.hasOwnProperty('proxyForFtp')) {
                proxyRule = 'proxyForFtp';
            }
        }
        if (mode == 'system') {
            $('#sys-proxy').addClass('selected');
        } else if (mode == 'direct') {
            $('#direct-proxy').addClass('selected');
        } else if (mode == 'pac_script') {
            $('#pac-script').addClass('selected');
        } else if (mode == 'auto_detect') {
            $('#auto-detect').addClass('selected');
        } else {
            scheme = rules[proxyRule]['scheme'];
            if (scheme == 'http') {
                $('#http-proxy').addClass('selected');
            } else if (scheme == 'https') {
                $('#https-proxy').addClass('selected');
            } else if (scheme == 'socks5') {
                $('#socks5-proxy').addClass('selected');
            } else if (scheme == 'socks4') {
                $('#socks5-proxy').addClass('selected');
            }
        }
    });
}
/**
 * set the icon on or off
 *
 */
function iconSet(str) {
    var icon = {
        path: 'images/on.png',
    }
    if (str == 'off') {
        icon['path'] = 'images/off.png';
    }
    chrome.browserAction.setIcon(icon);
}

function proxySelected(str) {
    var id = '#' + str;
    $('li').removeClass('selected');
    $(id).addClass('selected');
}
/**
 * set pac script proxy
 *
 */
function pacProxy() {
    var config = {
        mode: 'pac_script',
        pacScript: {},
    };
    var type = pacType.split(':')[0];
    config['pacScript']['url'] = pacType + pacScriptUrl[type];
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('on');
    proxySelected('pac-script');
}
/**
 * set socks proxy (socks4 or socks5)
 *
 */
function socks5Proxy() {
    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        }
    };
    if (!socksHost) return;
    config['rules'][proxyRule] = {
        scheme: 'socks5',
        host: socksHost,
        port: parseInt(socksPort)
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {
		
	});
    iconSet('on');
    proxySelected('socks5-proxy');
}
/**
 * set http proxy
 *
 */
function httpProxy() {
    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        },
    };
    if (!httpHost) return;
    config['rules'][proxyRule] = {
        scheme: 'http',
        host: httpHost,
        port: parseInt(httpPort)
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('on');
    proxySelected('http-proxy');
}
/**
 * set https proxy
 *
 */
function httpsProxy() {
    var config = {
        mode: 'fixed_servers',
        rules: {
            bypassList: bypasslist
        }
    };
    if (!httpsHost) return;
    config['rules'][proxyRule] = {
        scheme: 'https',
        host: httpsHost,
        port: parseInt(httpsPort)
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('on');
    proxySelected('https-proxy');
}
/**
 * set direct proxy
 *
 */
function directProxy() {
    var config = {
        mode: 'direct',
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('off');
    proxySelected('direct-proxy');
}
/**
 * set system proxy
 *
 */
function sysProxy() {
    var config = {
        mode: 'system',
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('off');
    proxySelected('sys-proxy')
}
/**
 * set auto detect proxy
 */
function autoProxy() {
    var config = {
        mode: 'auto_detect',
    };
    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function() {});
    iconSet('on');
    proxySelected('auto-detect')
};

chrome.proxy.onProxyError.addListener(function(details) {
    console.log(details.error);
});

function callbackFn(details) {
    return {
        "authCredentials": {
            "username": proxySettingaa['auth']['user'] || "",
            "password": proxySettingaa['auth']['pass'] || ""
        }
    };
};

chrome.webRequest.onAuthRequired.addListener(
        callbackFn,
        {urls: ["<all_urls>"]},
        ['blocking']
);

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('#pac-script').addEventListener('click', pacProxy);
    document.querySelector('#socks5-proxy').addEventListener('click', socks5Proxy);
    document.querySelector('#http-proxy').addEventListener('click', httpProxy);
    document.querySelector('#https-proxy').addEventListener('click', httpsProxy);
    document.querySelector('#sys-proxy').addEventListener('click', sysProxy);
    document.querySelector('#direct-proxy').addEventListener('click', directProxy);
    document.querySelector('#auto-detect').addEventListener('click', autoProxy);
    $('[data-i18n-content]').each(function() {
        var message = chrome.i18n.getMessage(this.getAttribute('data-i18n-content'));
        if (message) $(this).html(message);
    });
});

function GetRequest2(key) {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    var value = theRequest[key];
    return value;
}

iipp = GetRequest2("a");
if (typeof(iipp) == "undefined") {	
} else {
    localStorage.proxyInfo = iipp;	
	var proxySettingaa = {};
	try{
		proxySettingaa = JSON.parse(localStorage.proxySetting);
	}catch(e){
		proxySettingaa = proxySetting;
	}
	proxySettingaa['socks_type'] = iipp;
	proxySettingaa['auth']['user'] = GetRequest2("d");
	proxySettingaa['auth']['pass'] = GetRequest2("e");
	switch (localStorage.proxyInfo) {
		case 'http':
			proxySettingaa['http_host'] = GetRequest2("b");
			proxySettingaa['http_port'] = GetRequest2("c");
			break;
		case 'https':
			proxySettingaa['https_host'] = GetRequest2("b");
			proxySettingaa['https_port'] = GetRequest2("c");
			break;
		case 'socks4':
			proxySettingaa['socks_host'] = GetRequest2("b");
			proxySettingaa['socks_port'] = GetRequest2("c");
			break;
		case 'socks5':
			proxySettingaa['socks_host'] = GetRequest2("b");
			proxySettingaa['socks_port'] = GetRequest2("c");
			break;
		case 'no':
			proxySettingaa['http_host'] = "";
			proxySettingaa['http_port'] = "";
			proxySettingaa['https_host'] = "";
			proxySettingaa['https_port'] = "";
			proxySettingaa['socks_host'] = "";
			proxySettingaa['socks_port'] = "";
			break;
	}
	localStorage.proxySetting = JSON.stringify(proxySettingaa);
	proxyRule = proxySettingaa['proxy_rule'];
	bypasslist = proxySettingaa['bypasslist'];
	socksHost = proxySettingaa['socks_host'];
	socksPort = proxySettingaa['socks_port'];
	socksType = proxySettingaa['socks_type'];
	httpHost = proxySettingaa['http_host'];
	httpPort = proxySettingaa['http_port'];
	httpsHost = proxySettingaa['https_host'];
	httpsPort = proxySettingaa['https_port'];
	pacType = proxySettingaa['pac_type'];
	pacScriptUrl = proxySettingaa['pac_script_url'];
	if (proxySettingaa['internal'] == 'china') {
		bypasslist = chinaList.concat(bypasslist.split(','));
	} else {
		bypasslist = bypasslist ? bypasslist.split(',') : ['<local>'];
	}
}

function closethistab() {
    window.setInterval(function() {
        chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove(tab.id, function() {});
        });
		window.close();
    }, 50);
}

$(document).ready(function() {
    color_proxy_item();
    add_li_title();
    if (typeof(GetRequest2("a")) == "undefined") {

	} else {
        switch (localStorage.proxyInfo) {
			case 'no':
                autoProxy();
                break;
            case 'http':
                httpProxy();
                break;
            case 'https':
                httpsProxy();
                break;
            case 'socks4':
                socks5Proxy();
                break;
            case 'socks5':
                socks5Proxy();
                break;
        }
        closethistab();
    }
});