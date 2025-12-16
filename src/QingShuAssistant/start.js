
// 设置video
const setVideo = (onended) => {
    // 获取视频元素
    const playbackRate = 1;
    const currentTime = 0;
    const showControls = true;
    const isMuted = true;

    // 设置video属性
    const setVideoProps = (vd) => {
        vd.playbackRate = playbackRate; // 设置播放倍率,2倍速
        vd.controls = showControls;
        vd.muted = isMuted;
        vd.currentTime = vd.duration * currentTime;
        setTimeout(() => {
            // $('.vjs-control-bar').css('opacity', 1).css('display', 'block');
            $('.vjs-control-bar').hide();
            vd.controls = showControls;
        }, 2000);
    };

    // 开始播放
    const autoPlay = (vd) => {
        setTimeout(() => {
            setVideoProps(vd);
            $('#vjs_video_3').find('.vjs-big-play-button').click(); // video 蒙版点击启动播放
            // setTimeout(() => {
            // $('.vjs-control-bar').css('opacity', 1).css('display', 'block');
            // }, 3000);
        }, 1000);
    };

    // 底部消息栏 - 播放进度
    var messageBar = $('#messageBar');
    var spCurrentDuration = messageBar.find('#spCurrentDuration');
    var spCurrentTime = messageBar.find('#spCurrentTime');

    var video;
    var interval = setInterval(() => {
        video = $('#vjs_video_3_html5_api').get(0);// document.getElementById("vjs_video_3_html5_api");
        if (video) {
            window.clearInterval(interval);

            // 刷新页面时 canplay 事件没有触发，可能是因为视频资源加载过快，导致事件在你的脚本绑定之前已经触发
            // 检查视频元素的 readyState 属性，手动触发相应的逻辑
            if (video.readyState >= 3) {
                var duration = video.duration;
                spCurrentDuration.text(`${Math.floor(duration / 60).toString().padStart(2, '0')}:${Math.floor(duration % 60).toString().padStart(2, '0')}`)
                autoPlay(video);
            } else {
                var played = false;
                video.oncanplay = () => {
                    if (!played) {
                        played = true;
                        var duration = video.duration;
                        spCurrentDuration.text(`${Math.floor(duration / 60).toString().padStart(2, '0')}:${Math.floor(duration % 60).toString().padStart(2, '0')}`)
                        autoPlay(video);
                    }
                };
            }
            // 注册播放完成事件
            video.onended = onended;
            video.ontimeupdate = () => {
                video.controls = true;
                var curTime = Math.floor(video.currentTime);
                spCurrentTime.text(`${Math.floor(curTime / 60).toString().padStart(2, '0')}:${(curTime % 60).toString().padStart(2, '0')}`);
            };
        }
    }, 200);

};

// 解析课程列表
const getNextLesson = (currentNodeId) => {
    // 获取课程列表
    var aTagList = document.getElementsByTagName('a');
    logInfo("all tags <a/>", aTagList);

    // 底部消息栏
    var messageBar = $('#messageBar');
    var spCurrentLesson = messageBar.find('#spCurrentLesson');
    var spNextLesson = messageBar.find('#spNextLesson');

    var lessonList = [];
    var findCurrent = false;
    var nextLesson = null;
    for (let i = 0; i < aTagList.length; i++) {
        const a = aTagList[i];
        var aTagId = a.getAttribute('id');
        if (aTagId && aTagId.indexOf('courseware-') >= 0) {
            lessonList.push(a);

            // 下一节需要播放的课
            if (findCurrent && !nextLesson) {
                nextLesson = a;
                var nextLessonName = $(nextLesson).children('span').text()
                spNextLesson.text(nextLessonName).attr('title', nextLessonName);
            }

            // 标记当前播放课程的a标签
            if (aTagId.indexOf(currentNodeId) > 0) {
                findCurrent = true;
                var currentLessonName = $(a).children('span').text();
                spCurrentLesson.text(currentLessonName).attr('title', currentLessonName);
            }
        }
    }

    logInfo("all lessons", lessonList);

    return { lessonList, nextLesson };
}

// 获取当前URL “nodeId” 参数
const getQueryString = (name) => {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == name) {
            return pair[1];
        }
    }
    return (false);
}

// 手动添加mate标签
const appendMeta = () => {
    // 在页面初始化时在head标签插入meta标签
    const metaTag = document.getElementsByTagName('meta');
    let isHasTag = true;
    for (let i = 0; i < metaTag.length; i++) {   //避免重复插入meta标签
        const httpEquiv = metaTag[i].httpEquiv;
        if (httpEquiv == 'Content-Security-Policy') {
            isHasTag = false;
        }
    }
    if (isHasTag) {
        const headItem = document.head;
        let oMeta = document.createElement('meta');
        oMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        oMeta.content = "default-src * 'self' 'unsafe-inline' 'unsafe-eval' data: gap: content: https://xxx.com;media-src * blob: 'self' http://* 'unsafe-inline' 'unsafe-eval';style-src * 'self' 'unsafe-inline';img-src * 'self' data: content:;connect-src * blob:;";
        headItem.appendChild(oMeta)
    }
}

// 添加底部消息栏
const appendMessageBar = () => {
    var html = '<div id="messageBar"><div class="messageGrid"><div class="messageItem"><div class="messageTitle">【当前课程】</div><div id="spCurrentLesson" class="lessonName">-</div></div><div class="messageItem"><div>【课程时长】</div><div id="spCurrentDuration">00:00</div></div><div class="messageItem"><div class="messageTitle">【播放进度】</div><div id="spCurrentTime">00:00</div></div><div class="messageItem"><div class="messageTitle">【下一课】</div><div id="spNextLesson" class="lessonName">-</div></div></div><div class="messageCopyright">@青书学堂助手 v1.0.0</div></div>';
    $('body').append(html);
}

// console log
const logInfo = (msg, data) => {
    console.log(`[青书学堂助手]：${msg} ==> `, data);
}

(function () {
    // $(function () {
    //     appendMeta();

    appendMessageBar();

    if (window.location.href.indexOf('/CourseShow') < 0) {
        console.log('', 'Current page is not a valid course!');
        return;
    }

    var currentLesson = getQueryString("nodeId") || 'kcjs_1_1';
    logInfo("current lesson", currentLesson);
    if (!currentLesson) {
        return;
    }

    var interval = setInterval(() => {
        const { lessonList, nextLesson } = getNextLesson(currentLesson);
        logInfo("next lesson", nextLesson);
        if (lessonList) {
            window.clearInterval(interval);

            setVideo(() => {
                if (!nextLesson) {
                    logInfo('当前课程已全部播放完毕，请切换下一科目！')
                    return;
                }
                var next = $(nextLesson);
                next.parents('ul').css('display', 'block');
                // $(nextLesson).click();
                // $(nextLesson).parent().click();
                var href = next.attr('href');
                next.attr('href', 'javascript:void(0);');
                next.attr('onclick', href.replace('javascript: ', ''));
                next.children().click();
                return;

                // 方式二：执行 a 标签中的js方法
                // var id = nextLesson.getAttribute('id');
                // logInfo("nextLesson id", id)
                // var nodeId = id.replace('courseware-', '');
                // // eval(href.replace('javascript: ',''));
                // var coursewareNodesManager = null;
                // var interval = setInterval(() => {
                //     coursewareNodesManager = window.CoursewareNodesManager;
                //     if (coursewareNodesManager) {
                //         window.clearInterval(interval);
                //         coursewareNodesManager.onMenuClick(nodeId);
                //     }
                // }, 200);

                // 方式三：URL直接跳转 -- ?teachPlanId=103&periodId=28&courseId=895&nodeId=kcjs_2_1
                // var id = nextLesson.getAttribute('id');
                // logInfo("nextLesson id", id)
                // var nodeId = id.replace('courseware-', '');
                // var currentUrl = window.location.href;
                // var nextUrl = currentUrl.replace(currentLesson, nodeId);
                // window.location.href = nextUrl;

            });
        }
    }, 500);
    // });
})();