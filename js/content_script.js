
document.addEventListener('DOMContentLoaded', function () {
    console.log('我被执行了！');
    var jsPath = 'js/inject.js';
    var temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    temp.setAttribute('charset','gb2312');
    // 获得的地址类似：chrome-extension://ihcokhadfjfchaeagdoclpnjdiokfakg/js/inject.js
    temp.src = chrome.extension.getURL(jsPath);
    // console.log(temp.src)
    temp.onload = function () {
        // 放在页面不好看，执行完后移除掉
        // this.parentNode.removeChild(this);
    };
    document.body.appendChild(temp);
});