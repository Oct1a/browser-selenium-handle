'use strict';
const script = document.createElement('script');
if (window.top === window) {
    window.script = script;
} else {
    try {
        Object.assign(script.dataset, window.top.script.dataset);
    } catch (e) {}
};
var code = "";
var dyncode = `/*文档加载前执行的脚本，编码utf8，注释请使用行内注释或者多行注释。*/
/** TODO */
`;//在页面注入动态脚本
if(!!dyncode && dyncode.indexOf('[_DYNCODE_') == -1){
	code = code + `try{` + dyncode + `}catch(ex2){}`;
};
if(code){
	script.textContent = code;
	document.documentElement.appendChild(script);
	setTimeout(()=>{ script.remove(); },200);
}

