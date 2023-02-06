class Events {
    events;
    videoEvents;
    playerEvents;

    constructor() {
        this.events = {};

        this.videoEvents = [
            'canplay',
            'canplaythrough',
            'durationchange',
            'ended',
            'error',
            'pause',
            'play',
            'progress',
            'timeupdate'
        ];
        this.playerEvents = [
            'danmaku_show',
            'danmaku_hide',
            'danmaku_clear',
            'danmaku_loaded',
            'danmaku_send',
            'danmaku_opacity',
            'contextmenu_show',
            'contextmenu_hide',
            'notice_show',
            'notice_hide',
            'quality_start',
            'quality_end',
            'destroy',
            'resize',
            'fullscreen',
            'fullscreen_cancel',
            'webfullscreen',
            'webfullscreen_cancel'
        ];
    }

    on(name, callback) {
        if (this.type(name) && typeof callback === 'function') {
            // 判断 name 属性是否在 events 对象中存在
            if (!this.events.hasOwnProperty(name)) {
                // 向 events 对象中添加属性, 其对应的值初始化为数组类型
                this.events[name] = [];
            }
            // 在数组的末尾插入 callback 函数
            this.events[name].push(callback);
        }
    }

    trigger(name, info) {
        if (this.events[name] && this.events[name].length > 0) {
            for (let i = 0; i < this.events[name].length; i++) {
                this.events[name][i](info);
            }
        }
    }

    type(name) {
        if (this.playerEvents.indexOf(name) !== -1) {
            return 'player';
        } else if (this.videoEvents.indexOf(name) !== -1) {
            return 'video';
        }

        console.error(`Unknown event name: ${name}`);
        return null;
    }
}

export default Events;
