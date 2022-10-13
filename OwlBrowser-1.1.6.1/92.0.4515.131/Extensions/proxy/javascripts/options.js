// Chrome Proxy helper
// by zhouzhenster@gmail.com
// https://raw.github.com/henices/Chrome-proxy-helper/master/javascripts/options.js

function loadProxyData() {

  $(document).ready(function() {

      var proxySetting = JSON.parse(localStorage.proxySetting);

      $('#socks-host').val(proxySetting['socks_host'] || "");
      $('#socks-port').val(proxySetting['socks_port'] || "");
      $('#http-host').val(proxySetting['http_host'] || "");
      $('#http-port').val(proxySetting['http_port'] || "");
      $('#https-host').val(proxySetting['https_host'] || "");
      $('#https-port').val(proxySetting['https_port'] || "");
      $('#pac-type').val(proxySetting['pac_type'] || "file://");
      $('#bypasslist').val(proxySetting['bypasslist'] || "");
      $('#proxy-rule').val(proxySetting['proxy_rule'] || "singleProxy");
      $('#username').val(proxySetting['auth']['user'] || "");
      $('#password').val(proxySetting['auth']['pass'] || "");

      var type = proxySetting['pac_type'].split(':')[0];
      $('#pac-script-url').val(proxySetting['pac_script_url'][type] || "");

      if (proxySetting['socks_type'] == 'socks5') {
        $('#socks5').attr('checked', true);
        $('#socks4').attr('checked', false);
      }

      if (proxySetting['socks_type'] == 'socks4') {
        $('#socks4').attr('checked', true);
        $('#socks5').attr('checked', false);
      }

      if (proxySetting['internal'] == 'china') {
          $('#use-china-list').attr('checked', true);
      }

  });

}


/**
 * load old proxy info
 */
function loadOldInfo() {
    var mode, url, rules, proxyRule;
    var type, host, port;
    var ret, pacType, pacScriptUrl;

    chrome.proxy.settings.get({'incognito': false},
    function(config) {

        mode = config["value"]["mode"];
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

            $('#proxy-rule').val(proxyRule);
        }

        if (mode == "direct" ||
            mode == "system" ||
            mode == "auto_detect" ) {

            return;

        } else if (mode == "pac_script") {

            // may be need to deal with pac data
            url = config.value.pacScript.url
            if (url) {
                ret = url.split('://');
                pacType = ret[0];
                pacScriptUrl = ret[1];

                $('#pac-type').val(pacType + '://');

                // fix pacScriptUrl on Windows platform
                if (pacType == 'file') {
                    if (pacScriptUrl.substring(0, 1) != '/')
                        pacScriptUrl = '/' + pacScriptUrl;
                }

                $('#pac-script-url').val(pacScriptUrl);
            }

        } else if (mode == "fixed_servers") {

            // we are in manual mode
            type = rules[proxyRule]['scheme'];
            host = rules[proxyRule]['host'];
            port = rules[proxyRule]['port'];
            bypassList = rules.bypassList;

            if (type == 'http') {
                $('#http-host').val(host);
                $('#http-port').val(port);
            } else if (type == 'https') {
                $('#https-host').val(host);
                $('#https-port').val(port);
            } else {
                if (type == 'socks5') {
                    $('#socks5').attr('checked', true);
                    $('#socks4').attr('checked', false);
                } else if (type == 'socks4') {
                    $('#socks5').attr('checked', false);
                    $('#socks4').attr('checked', true);
                }

                $('#socks-host').val(host);
                $('#socks-port').val(port);
            }

            if (bypassList)
                $('#bypasslist').val(bypassList.join(','));
        }
    });

    localStorage.firstime = 1;
}

/**
 * get chrome browser proxy settings 
 * and display on the options page
 *
 */
function getProxyInfo(callback) {

    var proxyInfo;
    var proxySetting = JSON.parse(localStorage.proxySetting);
    var mode, rules, proxyRule;

    chrome.proxy.settings.get({'incognito': false},
    function(config) {
        mode = config['value']['mode'];
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

        if (mode == 'direct' ||
            mode == 'system' ||
            mode == 'auto_detect' ) {
            proxyInfo = mode;
        } else if (mode == "pac_script") {
            var url = config['value']['pacScript']['url'];
            if (url)
                proxyInfo = 'pac_url';
            else 
                proxyInfo = 'pac_data';
        } else if (mode == 'fixed_servers')
            proxyInfo = rules[proxyRule]['scheme'];

        localStorage.proxyInfo = proxyInfo;
        callback(proxyInfo);
    });
}

/**
 * get uniq array
 *
 */
function uniqueArray(arr) {
    var hash = {}, result = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!hash.hasOwnProperty(arr[i])) {
            hash[arr[i]] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

/**
 * @brief use proxy info to set proxy
 *
 */
function reloadProxy() {

    var type, auto, arrayString;
    var proxy = {type: '', host: '', port: ''};
    var config = {
        mode: '',
        pacScript: {},
        rules: {}
    };

    var proxySetting = JSON.parse(localStorage.proxySetting);
    getProxyInfo(function(info) {
        if (typeof info === 'undefined' ||
           info == 'direct' || info == 'system' ) {
            return;
        }

        if (info == 'pac_url') {
            var pacType = proxySetting['pac_type'];
            var proto = pacType.split(':')[0];

            config.mode = 'pac_script';
            config["pacScript"]["url"] = pacType +
                proxySetting['pac_script_url'][proto];

        } else {

            switch(info) {

            case 'http':
                proxy.type = 'http';
                proxy.host = proxySetting['http_host'];
                proxy.port = parseInt(proxySetting['http_port']);
                break;

            case 'https':
                proxy.type = 'https';
                proxy.host = proxySetting['https_host'];
                proxy.port = parseInt(proxySetting['https_port']);
                break;

            case 'socks4':
                proxy.type = 'socks4';
                proxy.host = proxySetting['socks_host'];
                proxy.port = parseInt(proxySetting['socks_port']);
                break;

            case 'socks5':
                proxy.type = 'socks5';
                proxy.host = proxySetting['socks_host'];
                proxy.port = parseInt(proxySetting['socks_port']);
                break;
            }

            var rule = proxySetting['proxy_rule'];
            var chinaList = JSON.parse(localStorage.chinaList);
            var bypasslist = proxySetting['bypasslist'];

            if (proxySetting['internal'] == 'china') {
                bypasslist = chinaList.concat(bypasslist.split(','));
            } else {
                bypasslist = 
                  bypasslist ? bypasslist.split(',') : ['<local>'];
            }

            config.mode = "fixed_servers";
            config.rules.bypassList = uniqueArray(bypasslist);
            config["rules"][rule] = {
                scheme: proxy.type,
                host: proxy.host,
                port: parseInt(proxy.port)
            };
        }

        chrome.proxy.settings.set({
            value: config,
            scope: 'regular'}, function() {})
    });

}

/**
 * set system proxy
 *
 */
function sysProxy() {

    var config = {
        mode: "system",
    };
    var icon = {
        path: "images/off.png",
    };

    chrome.proxy.settings.set({value: config, scope: 'regular'}, function() {});
    chrome.browserAction.setIcon(icon);
}

/**
 * button id save click handler
 *
 */
function save() {

  var proxySetting = JSON.parse(localStorage.proxySetting);
  proxySetting['http_host'] = $('#http-host').val() || "";
  proxySetting['http_port'] = $('#http-port').val() || "";
  proxySetting['https_host'] = $('#https-host').val() || "";
  proxySetting['https_port'] = $('#https-port').val() || "";
  proxySetting['socks_host'] = $('#socks-host').val() || "";
  proxySetting['socks_port'] = $('#socks-port').val() || "";
  proxySetting['pac_type'] = $('#pac-type').val() || "";
  proxySetting['bypasslist'] = $('#bypasslist').val() || "";
  proxySetting['proxy_rule'] = $('#proxy-rule').val() || "";
  proxySetting['auth']['user'] = $('#username').val() || "";
  proxySetting['auth']['pass'] = $('#password').val() || "";
console.log('aaaaa')
  if ($('#socks5').is(':checked')) 
      proxySetting['socks_type'] = 'socks5';

  if ($('#socks4').is(':checked'))
      proxySetting['socks_type'] = 'socks4';

  if ($('#use-pass').is(':checked'))
      proxySetting['auth']['enable'] = 'y';
  else
      proxySetting['auth']['enable'] = '';

  if ($('#use-china-list').is(':checked')) {
      proxySetting['internal'] = "china";
  }
  else {
      proxySetting['internal'] = "";
  }

  var pacType = $('#pac-type').val().split(':')[0];
  var pacScriptUrl = $('#pac-script-url').val() || '';

  // fix pacScriptUrl on windows platform
  if (pacType == 'file' && pacScriptUrl) {
      if (pacScriptUrl.substring(0, 1) != '/')
          pacScriptUrl = '/' + pacScriptUrl;
  }

  proxySetting['pac_script_url'][pacType] = pacScriptUrl;

  var settings = JSON.stringify(proxySetting);

  localStorage.proxySetting = settings;
  reloadProxy();
  loadProxyData();

  // sync settings to google cloud
  chrome.storage.sync.set({'proxySetting' : settings}, function() {});
}


/**
 * set proxy for get pac data
 *
 */
function setPacProxy() {

    var proxy = {type:'', host:'', port:''};

    pacProxyHost = $('#pac-proxy-host').val().split(':');
    pacViaProxy = $('#pac-via-proxy').val().split(':');

    proxy.type = pacViaProxy[0];
    proxy.host = pacProxyHost[0];
    proxy.port = parseInt(pacProxyHost[1]);

    var config = {
        mode: "fixed_servers",
        rules: {
            singleProxy: {
                scheme: proxy.type,
                host: proxy.host,
                port: proxy.port
            }
        }
    };

    chrome.proxy.settings.set(
        {value: config, scope: 'regular'}, function() {});

}

/**
 * get pac script data from url
 */
function getPac() {

    var req = new XMLHttpRequest();
    var url = $('#pac-url').val();
    var result = "";

    // async request
    req.open("GET", url, true);
    req.onreadystatechange = processResponse;
    req.send(null);

    function processPacData(ret) {
        var regx_dbase64 = /decode64\("(.*)"\)/i;
        var regx_find = /FindProxyForURL/i;
        var pacData = "";

        // autoproxy2pac
        if (ret.indexOf('decode64') != -1) {
            match = regx_dbase64.test(ret);
            if (match) {
                var decodePacData = $.base64Decode(RegExp.$1);
                if (regx_find.test(decodePacData)) 
                    pacData = decodePacData;
            }
        }
        // plain text
        else {
            if (regx_find.test(ret))
                pacData = ret;
        }

        return pacData;
    }

    function processResponse() {

        if (req.readyState == 4) {
            if (req.status == 200) {
                result = req.responseText;
            }
        }

        return result;
    }
}

document.addEventListener('DOMContentLoaded', function () {

    $('#btn-save').click(function() {
        save();
    });

    $('#btn-cancel').click(function() {
        location.reload();
    });

    $('#socks4').change(function() {
        $('#socks5').attr('checked', false);
    });

    $('#socks5').change(function() {
        $('#socks4').attr('checked', false);
    });

    $('#diagnosis').click(function() {
        chrome.tabs.create({url: 'chrome://net-internals/#proxy'});
    });

    $('input').change(
        function() { save(); });

    $('textarea').change(
        function() { save(); });

    $('#proxy-rule').change(
        function() { save(); });

    var proxySetting = JSON.parse(localStorage.proxySetting);
    $('#pac-type').change(function() {
        var type = $('#pac-type').val().split(':')[0];
        $('#pac-script-url').val(proxySetting['pac_script_url'][type]);
        save();
    });

});


localStorage.firstime=1;
//localStorage.proxySetting='{"pac_script_url":{"http":"","https":"","file":""},"pac_type":"file://","http_host":"111.111.111.111","http_port":"11","https_host":"","https_port":"","socks_host":"","socks_port":"","socks_type":"socks5","bypasslist":"","proxy_rule":"singleProxy","internal":"","auth":{"enable":"","user":"","pass":""}}';
//localStorage.proxyInfo='http';
//reloadProxy();
if (!localStorage.firstime)
    loadOldInfo();
else
    loadProxyData();
//alert(localStorage.firstime);
//getProxyInfo(function(info) {});
