/*自定义菜单*/
var menuTitle = '[TITLE]';
var menuUrl = '[URL]';
{
  const startup = function() {
    chrome.contextMenus.create({
      id: 'menu-owlssky',
      title: (menuTitle == '[TITLE]' ? '访问猫头鹰官网' : menuTitle),
      contexts: ['page']
    });
  };
  chrome.runtime.onStartup.addListener(startup);
  chrome.runtime.onInstalled.addListener(startup);
};
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'menu-owlssky') {
    chrome.tabs.create({
      url: (menuUrl == '[URL]' ? 'https://www.owlssky.com' : menuUrl)
    });
  }
});
chrome.runtime.onMessage.addListener(function(a, d, e) {
  var b = d.tab.id;
  switch(a.type) {
    case 'block': 
      break;
    case 'reset': 
      break;
  };
  e({});
});

