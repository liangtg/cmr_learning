console.log('inject execute');

var cmrData = {
    retry: 5,
    interval: 5000,
    cid: _global_data["courseid"],
    times: Number.MAX_VALUE - 1,
    titles: [],
    links: [],
    title: '',
    url: '',
    shift: function () {
        this.times++;
        console.log(this.times)
        if (this.times < this.retry) return;
        if (this.times >= this.retry) this.times = 0;
        this.title = this.titles.shift();
        this.url = this.links.shift();
    }
};

function loadUrl(url, fun) {
    $("#cmrtmp").load(url, function (response, status, xhr) {
        if ('success' == status) {
            console.log('load success');
            if (response.length <= 50) console.log(response)
            fun();
        }
    });
}


function loadLinks() {
    console.log('load link start' + cmrData.titles.length)
    if (cmrData.titles.length <= 0) return;
    cmrData.shift();
    console.log(cmrData.url)
    loadUrl(cmrData.url + ' .cont', function () {
        var sts = document.getElementById('cmrtmp').getElementsByClassName('st');
        for (let index = 0; index < sts.length; index++) {
            const st = sts[index];
            try {
                var stType = st.getElementsByClassName('st_title')[0].innerText.split('、')[1];
                var stID = st.getElementsByTagName('table')[1].getElementsByTagName('td')[0].innerText.slice(1, -1);
                var stQues = st.getElementsByTagName('table')[1].getElementsByClassName('MsoNormal')[0].innerText;
                var stAnswer = st.querySelector('#answer').innerText.slice(4);
                // console.log(stType + stID + stAnswer)
                localStorage[cmrData.cid + '.' + stID + '.t'] = stType
                localStorage[cmrData.cid + '.' + stID + '.q'] = stQues
                localStorage[cmrData.cid + '.' + stID + '.a'] = stAnswer.trim().replace(/[\r\n]/g, "");
            } catch (error) {
                console.log(error)
                console.log(st)
            }

        }
        console.log('continue load links');
        window.setTimeout(loadLinks, cmrData.interval);
    });

}
function startLoadLianxi() {
    let lianxi = "Modelzhlx.asp?CourseID=";

    console.log(_global_data)
    let tmp = document.createElement("div");
    tmp.setAttribute("id", "cmrtmp");
    tmp.setAttribute('style', 'display:none');
    document.body.appendChild(tmp);

    loadUrl(lianxi + _global_data["courseid"] + " .result", function () {
        let tbody = document.getElementById('cmrtmp').getElementsByTagName('tbody')[0]
        let trs = tbody.getElementsByTagName('tr')


        for (let index = 0; index < trs.length; index++) {
            const tr = trs[index];
            cmrData.titles[index] = tr.getElementsByClassName('capture')[0].innerText
            cmrData.links[index] = tr.getElementsByClassName('searchquestion')[0].href
        }
        console.log(cmrData.titles);
        console.log(cmrData.links);
        loadLinks()
    });

}

function findST() {
    let iframe = document.getElementById("iframe");
    if (iframe === null) return;
    // "http://learning.cmr.com.cn/student/acourse/HomeworkCenter/PracDeal.asp*"
    //  iframe.setAttribute('onload',findST);
    //  iframeResize();
    let iwindow = iframe.contentWindow;
    let idoc = iwindow.document;
    let sts = idoc.getElementsByClassName('st_cont');
    if (sts.length == 0) {
    }
    console.log('find 试题' + sts.length)
    for (let index = 0; index < sts.length; index++) {
        const st = sts[index];
        // let stType = st.getElementsByClassName('st_title')[0].innerText.split('、')[1];
        let stID = st.getElementsByTagName('table')[0].getElementsByTagName('td')[0].innerText.slice(1, -1);
        // console.log("试题ID:" + stID)
        // let stQues = st.getElementsByTagName('table')[1].getElementsByClassName('MsoNormal')[0].innerText;
        let stAnswer = localStorage[cmrData.cid + '.' + stID + '.a'];
        let stANum = -1;
        if ("正确" == stAnswer) stANum = 1;
        else if ('错误' == stAnswer) stANum = 0;
        // console.log('q:' + stID + ' a: ' + (stAnswer ? (stAnswer + stAnswer.length) : "--"));
        let findA = false;
        let inputs = st.getElementsByTagName('input');
        for (let iindex = 0; iindex < inputs.length; iindex++) {
            const input = inputs[iindex];
            // console.log(input.value + stAnswer+input.innerText)
            // console.log(stAnswer.length + stAnswer)
            // console.log(input.value == stAnswer)
            let inputText = input.innerText.trim().replace(/[\r\n]/g, "");
            // console.log(input.value)
            // console.log(inputText ? (inputText + inputText.length) : "...")
            if (input.value == stAnswer || input.value == stANum || inputText == stAnswer) {
                input.checked = true;
                findA = true;
                break;
            }
        }
        if (!findA) {
            console.log(stID)
            if (stAnswer) {
                st.getElementsByTagName('table')[0].getElementsByTagName('td')[0].innerText += stAnswer;
            }
        }

    }
}

// window.setInterval(findST, 2000)
var actionArea = document.createElement('div');
actionArea.setAttribute('style', 'position: fixed; right: 0px; top: 0px;');
var actionBtn = document.createElement('button');
actionBtn.setAttribute('onClick', 'findST()');
actionBtn.innerText = '搜索答案'
actionArea.appendChild(actionBtn)

document.body.appendChild(actionArea)

startLoadLianxi();