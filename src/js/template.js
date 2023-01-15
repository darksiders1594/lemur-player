import Icons from './icons';
import tplPlayer from '../template/player.art';
import utils from './utils';

class Template {
    constructor(options) {
        this.container = options.container;
        this.options = options.options;
        this.index = options.index;
        this.init();
    }

    init() {
        this.container.innerHTML = tplPlayer({
            options: this.options,
            index: this.index,
            icons: Icons,
            mobile: utils.isMobile,
            video: {
                current: true,
                pic: this.options.video.pic,
                airplay: utils.isSafari && !utils.isChrome ? this.options.airplay : false,
                preload: this.options.preload,
                url: this.options.video.url,
            },
        });

        this.volumeBar = this.container.querySelector('.lemur-player-volume-bar-inner');
        this.volumeBarWrap = this.container.querySelector('.lemur-player-volume-bar');
        this.volumeBarWrapWrap = this.container.querySelector('.lemur-player-volume-bar-wrap');
        this.volumeButton = this.container.querySelector('.lemur-player-volume');
        this.volumeButtonIcon = this.container.querySelector('.lemur-player-volume-icon');
        this.volumeIcon = this.container.querySelector('.lemur-player-volume-icon .lemur-player-icon-content');
        this.playedBar = this.container.querySelector('.lemur-player-played');
        this.loadedBar = this.container.querySelector('.lemur-player-loaded');
        this.playedBarWrap = this.container.querySelector('.lemur-player-bar-wrap');
        this.playedBarTime = this.container.querySelector('.lemur-player-bar-time');
        this.danmaku = this.container.querySelector('.lemur-player-danmaku');
        this.danmakuLoading = this.container.querySelector('.lemur-player-danmaku-loading');
        this.video = this.container.querySelector('.lemur-player-video-current');
        this.bezel = this.container.querySelector('.lemur-player-bezel-icon');
        this.playButton = this.container.querySelector('.lemur-player-play-icon');
        this.mobilePlayButton = this.container.querySelector('.lemur-player-mobile-play');
        this.videoWrap = this.container.querySelector('.lemur-player-video-wrap');
        this.controllerMask = this.container.querySelector('.lemur-player-controller-mask');
        this.ptime = this.container.querySelector('.lemur-player-ptime');
        this.settingButton = this.container.querySelector('.lemur-player-setting-icon');
        this.settingBox = this.container.querySelector('.lemur-player-setting-box');
        this.mask = this.container.querySelector('.lemur-player-mask');
        this.loop = this.container.querySelector('.lemur-player-setting-loop');
        this.loopToggle = this.container.querySelector('.lemur-player-setting-loop .lemur-player-toggle-setting-input');
        this.showDanmaku = this.container.querySelector('.lemur-player-setting-show-danmaku');
        this.showDanmakuToggle = this.container.querySelector('.lemur-player-show-danmaku-setting-input');
        this.unlimitDanmaku = this.container.querySelector('.lemur-player-setting-danmaku-unlimited');
        this.unlimitDanmakuToggle = this.container.querySelector('.lemur-player-danmaku-unlimited-setting-input');
        this.speed = this.container.querySelector('.lemur-player-setting-speed');
        this.speedItem = this.container.querySelectorAll('.lemur-player-setting-speed-item');
        this.danmakuOpacityBar = this.container.querySelector('.lemur-player-danmaku-bar-inner');
        this.danmakuOpacityBarWrap = this.container.querySelector('.lemur-player-danmaku-bar');
        this.danmakuOpacityBarWrapWrap = this.container.querySelector('.lemur-player-danmaku-bar-wrap');
        this.danmakuOpacityBox = this.container.querySelector('.lemur-player-setting-danmaku');
        this.dtime = this.container.querySelector('.lemur-player-dtime');
        this.controller = this.container.querySelector('.lemur-player-controller');
        this.commentInput = this.container.querySelector('.lemur-player-comment-input');
        this.commentButton = this.container.querySelector('.lemur-player-comment-icon');
        this.commentSettingBox = this.container.querySelector('.lemur-player-comment-setting-box');
        this.commentSettingButton = this.container.querySelector('.lemur-player-comment-setting-icon');
        this.commentSettingFill = this.container.querySelector('.lemur-player-comment-setting-icon path');
        this.commentSendButton = this.container.querySelector('.lemur-player-send-icon');
        this.commentSendFill = this.container.querySelector('.lemur-player-send-icon path');
        this.commentColorSettingBox = this.container.querySelector('.lemur-player-comment-setting-color');
        this.browserFullButton = this.container.querySelector('.lemur-player-full-icon');
        this.webFullButton = this.container.querySelector('.lemur-player-theater-mode-icon');
        this.menu = this.container.querySelector('.lemur-player-menu');
        this.menuItem = this.container.querySelectorAll('.lemur-player-menu-item');
        this.qualityList = this.container.querySelector('.lemur-player-quality-list');
        this.airplayButton = this.container.querySelector('.lemur-player-airplay-icon');
        this.qualityButton = this.container.querySelector('.lemur-player-quality-icon');
        this.barPreview = this.container.querySelector('.lemur-player-bar-preview');
        this.barWrap = this.container.querySelector('.lemur-player-bar-wrap');
        this.noticeList = this.container.querySelector('.lemur-player-notice-list');
        this.infoPanel = this.container.querySelector('.lemur-player-info-panel');
        this.infoPanelClose = this.container.querySelector('.lemur-player-info-panel-close');
        this.infoVersion = this.container.querySelector('.lemur-player-info-panel-item-version .lemur-player-info-panel-item-data');
        this.infoFPS = this.container.querySelector('.lemur-player-info-panel-item-fps .lemur-player-info-panel-item-data');
        this.infoType = this.container.querySelector('.lemur-player-info-panel-item-type .lemur-player-info-panel-item-data');
        this.infoUrl = this.container.querySelector('.lemur-player-info-panel-item-url .lemur-player-info-panel-item-data');
        this.infoResolution = this.container.querySelector('.lemur-player-info-panel-item-resolution .lemur-player-info-panel-item-data');
        this.infoDuration = this.container.querySelector('.lemur-player-info-panel-item-duration .lemur-player-info-panel-item-data');
        this.infoDanmakuId = this.container.querySelector('.lemur-player-info-panel-item-danmaku-id .lemur-player-info-panel-item-data');
        this.infoDanmakuApi = this.container.querySelector('.lemur-player-info-panel-item-danmaku-api .lemur-player-info-panel-item-data');
        this.infoDanmakuAmount = this.container.querySelector('.lemur-player-info-panel-item-danmaku-amount .lemur-player-info-panel-item-data');
    }

    static NewNotice(text, opacity) {
        const lastNotice = document.getElementsByClassName('lemur-player-notice');
        let index = lastNotice.length - 1;
        if (typeof lastNotice[index] !== "undefined") {
            lastNotice[index].style.display='none';
        }
        const notice = document.createElement('div');
        notice.classList.add('lemur-player-notice');
        notice.style.opacity = opacity;
        notice.innerText = text;
        return notice;
    }
}

export default Template;
