console.log('inject execute');

var cmrData = {
    retry: 5,
    interval: 3000,
    cid: _global_data["courseid"],
    times: Number.MAX_VALUE - 1,
    titles: [],
    links: [],
    title: '',
    url: '',
    tikuCount: 0,
    shift: function () {
        this.times++;
        if (this.times < this.retry) return;
        if (this.times >= this.retry) this.times = 0;
        this.title = this.titles.shift();
        this.url = this.links.shift();
    }
};

function loadUrl(url, fun) {
    $("#cmrtmp").load(url, function (response, status, xhr) {
        if ('success' == status) {
            if (response.length <= 50) console.log(response)
            fun();
        }
    });
}


function loadLinks() {
    updateTikuCount();
    cmrData.shift();
    if (cmrData.titles.length <= 0 && ('' == cmrData.url || undefined == cmrData.url)) return;
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
    let iwindow = iframe.contentWindow;
    let idoc = iwindow.document;
    let sts = idoc.getElementsByClassName('st_cont');

    console.log('find 试题' + sts.length)
    for (let index = 0; index < sts.length; index++) {
        const st = sts[index];
        let stID = st.getElementsByTagName('table')[0].getElementsByTagName('td')[0].innerText.slice(1, -1);
        let stAnswer = localStorage[cmrData.cid + '.' + stID + '.a'];
        let stANum = -1;
        if ("正确" == stAnswer) stANum = 1;
        else if ('错误' == stAnswer) stANum = 0;
        // console.log('q:' + stID + ' a: ' + (stAnswer ? (stAnswer + stAnswer.length) : "--"));
        let findA = false;
        let inputs = st.getElementsByTagName('input');
        let ansList = [];
        if (stAnswer) ansList = stAnswer.split(',')
        for (let iindex = 0; iindex < inputs.length; iindex++) {
            const input = inputs[iindex];
            let inputText = input.innerText.trim().replace(/[\r\n]/g, "");
            if (input.value == stAnswer || input.value == stANum || inputText == stAnswer || ansList.indexOf(input.value) != -1) {
                input.checked = true;
                findA = true;
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

function saveZuoYe() {
    let iframe = document.getElementById("iframe");
    if (iframe === null) return;
    let iwindow = iframe.contentWindow;
    let idoc = iwindow.document;
    let sts = idoc.getElementsByClassName('st_cont');

    console.log('find zuo ye:' + sts.length)
    for (let index = 0; index < sts.length; index++) {
        const st = sts[index];
        let stID = st.getElementsByTagName('table')[0].getElementsByTagName('td')[0].innerText.slice(1, -1);
        let stAnswer = localStorage[cmrData.cid + '.' + stID + '.a'];
        let stQues = st.getElementsByTagName('table')[0].getElementsByTagName('td')[1].innerText
        let ansTag = st.nextElementSibling
        let tmp;
        while (ansTag) {
            if (ansTag.tagName.toLowerCase() == 'p') {
                tmp = ansTag.innerText;
                break;
            }
            ansTag = ansTag.nextElementSibling;
        }
        let saveAns = tmp.slice(tmp.lastIndexOf('：') + 1).trim()
        if (!stAnswer) {
            console.log('save :' + stID + '-' + saveAns)
            localStorage[cmrData.cid + '.' + stID + '.t'] = ""
            localStorage[cmrData.cid + '.' + stID + '.q'] = stQues
            localStorage[cmrData.cid + '.' + stID + '.a'] = saveAns.trim().replace(/[\r\n]/g, "");
        }


    }
}

function exportTiku() {
    if (cmrData.tikuCount == 0) return;
    let list = {};
    let ids = [];
    for (let index = 0; index < localStorage.length; index++) {
        let key = localStorage.key(index);
        if (key.startsWith(cmrData.cid)) {
            id = key.split('.', 2)[1];
            if (ids.indexOf(id) != -1) {
                continue;
            }
            ids.push(id);
            type = localStorage.getItem(cmrData.cid + '.' + id + '.t');
            if (!list[type]) list[type] = [];
            list[type].push({ id: id, q: localStorage.getItem(cmrData.cid + '.' + id + '.q'), a: localStorage.getItem(cmrData.cid + '.' + id + '.a') });
        }
    }
    console.log(list)
    let keys = Object.keys(list);
    keys.forEach(function (key) {
        list[key].sort(function (a, b) {
            return a.id - b.id;
        });
    });
    console.log(list)
    let newBody = document.createElement('div');
    keys.forEach(function (key) {
        newBody.appendChild(document.createElement('div')).innerText = key;
        let stList = newBody.appendChild(document.createElement('div'));
        list[key].forEach(function (item) {
            stList.appendChild(document.createElement('div')).innerText = '[' + item.id + '](' + item.q + ')';
            stList.appendChild(document.createElement('div')).innerText = item.a;
        });
    });
    document.body.innerHTML = newBody.innerHTML;
}

function updateTikuCount() {
    cmrData.tikuCount = 0;
    let id = cmrData.cid + "."
    for (let index = 0; index < localStorage.length; index++) {
        let key = localStorage.key(index);
        if (key.startsWith(id)) cmrData.tikuCount++;
    }
    document.getElementById('tikuCount').innerText = cmrData.tikuCount / 3
}

function startExecute() {
    updateTikuCount();
    if (null) {
        console.log('null == true')
    } else {
        console.log('null == false')
    }
}

startExecute();

// startLoadLianxi();