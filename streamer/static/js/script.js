const url_span = document.getElementById('url_span');
const url_span_text = url_span.textContent;
const items_div = document.getElementById('items_div');
const items_ul = document.getElementById('items_ul');
const upload_div = document.getElementById('upload_div');

const upload_progress_div = document.getElementById('upload_progress_div');
const upload_progress_span = document.getElementById('upload_progress_span');

const rest_div = document.getElementById('rest_div');
const streamer_video = document.getElementById('streamer_video');

function loadItems() { // 加载项目列表
    fetch('/items')
    .then(response => response.json())
    .then(items_dict => {
        // 清空 items_ul 内部所有元素后将 name 添加进 items_ul
        items_ul.innerHTML = ''; 
        Object.entries(items_dict).forEach(([name, status]) => {
            let item_li = document.createElement('li'); // 创建项目名称li标签和点击查看
            item_li.textContent = name;
            item_li.addEventListener('click', (event) => {event.stopPropagation(); showItem(name);});
            let item_delete_button = document.createElement('button'); // 创建删除按钮
            item_delete_button.textContent = 'delete';
            item_delete_button.addEventListener('click', (event) => {event.stopPropagation(); deleteItem(name);})
            item_li.appendChild(item_delete_button);
            let item_operate_div = document.createElement('div'); // 创建操作div
            let status_li = document.createElement('li'); // 创建播放状态显示（绿色：播放中，红色：未播放）
            status_li.className = 'status_li';
            let color = "green"; if (status === false) {color = "red";}
            status_li.style.backgroundColor = color;
            item_operate_div.appendChild(status_li);
            let item_play_button = document.createElement('button'); // 创建播放按钮
            item_play_button.textContent = 'play';
            item_play_button.addEventListener('click', (event) => {event.stopPropagation(); playItem(name);})
            item_operate_div.appendChild(item_play_button);
            let item_stop_button = document.createElement('button'); // 创建停止按钮
            item_stop_button.textContent = 'stop';
            item_stop_button.addEventListener('click', (event) => {event.stopPropagation(); stopItem(name);})
            item_operate_div.appendChild(item_stop_button);
            item_li.appendChild(item_operate_div);
            items_ul.appendChild(item_li);
        });
    })
    .catch(error => {
    });
}

function uploadItem(file) { // 上传项目
    let form_data = new FormData();
    form_data.append('file', file);

    // 显示进度并清零进度
    upload_progress_div.style.display = 'flex';
    upload_progress_span.innerHTML = '0%';

    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            let percentComplete = Math.ceil((e.loaded / e.total) * 100);
            upload_progress_span.innerHTML = percentComplete + '%';
        }
    };
    xhr.onload = function() { // 上传完成
        loadItems();
        upload_progress_div.style.display = 'none';
    };
    xhr.send(form_data);
}
function deleteItem(name) { // 删除项目
    fetch(`/delete?name=${name}`)
    .then(response => response.json())
    .then(data => {
        loadItems(); 
    })
    .catch(error => {
        console.info(error);
    });
}

function showItem(name) {
    url_span.textContent = url_span_text + name;
}

function playItem(name) { // 播放项目
    fetch(`/play?name=${name}`)
    .then(response => response.json())
    .then(data => {
        loadItems(); 
    })
    .catch(error => {
    });
}
function stopItem(name) { // 停止项目
    fetch(`/stop?name=${name}`)
    .then(response => response.json())
    .then(data => {
        loadItems(); 
    })
    .catch(error => {
    });
}

function eventInit() { // 各种监听事件初始化
    // 拖拽上传事件监听
    upload_div.addEventListener('dragover', function(event) {event.preventDefault();});
    items_div.ondragenter = function(event) {event.preventDefault(); upload_div.classList.add('dragover');};
    upload_div.ondragleave = function(event) {event.preventDefault(); upload_div.classList.remove('dragover');};
    upload_div.addEventListener('drop', function(event) {
        event.preventDefault();
        upload_div.classList.remove('dragover');
        // 获取拖拽进入的文件并逐个验证文件扩展名然后上传
        let files = event.dataTransfer.files;
        for (let i=0; i<files.length; i++) {
            let file = files[i];
            uploadItem(file);
        }
    });
}

loadItems();
eventInit();
