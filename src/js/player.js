import Promise from 'promise-polyfill';

import utils from './utils';
import handleOption from './options';
import Template from './template';
import Icons from './icons';
import Danmaku from './danmaku';
import Events from './events';
import FullScreen from './fullscreen';
import User from './user';
import Bar from './bar';
import Timer from './timer';
import Bezel from './bezel';
import Controller from './controller';
import Setting from './setting';
import Comment from './comment';
import HotKey from './hotkey';
import ContextMenu from './contextmenu';
import InfoPanel from './info-panel';
import tplVideo from '../template/video.art';

let index = 0;

class LemurPlayer {
    dashPlayer;
    isFirstCanPlay = true;
    isEnded = false;
    /**
     * LemurPlayer constructor function
     *
     * @param {Object} options - See README
     * @constructor
     */
    constructor(options) {
        this.options = handleOption({ ...options });

        if (this.options.video.quality) {
            this.qualityIndex = this.options.video.defaultQuality;
            this.quality = this.options.video.quality[this.options.video.defaultQuality];
        }
        this.events = new Events();
        this.user = new User(this);
        this.container = this.options.container;

        this.container.classList.add('lemur-player');
        if (!this.options.danmaku) {
            this.container.classList.add('lemur-player-no-danmaku');
        }
        if (utils.isMobile) {
            this.container.classList.add('lemur-player-mobile');
        }
        this.arrow = this.container.offsetWidth <= 500;
        if (this.arrow) {
            this.container.classList.add('lemur-player-arrow');
        }

        this.template = new Template({
            container: this.container,
            options: this.options,
            index: index,
        });

        this.video = this.template.video;

        this.bar = new Bar(this.template);

        this.bezel = new Bezel(this.template.bezel);

        this.fullScreen = new FullScreen(this);

        this.controller = new Controller(this);

        if (this.options.danmaku) {
            this.danmaku = new Danmaku({
                player: this,
                container: this.template.danmaku,
                opacity: this.user.get('opacity'),
                callback: () => {
                    setTimeout(() => {
                        this.template.danmakuLoading.style.display = 'none';

                    }, 0);
                },
                error: (msg) => {
                    this.notice(msg);
                },
                apiBackend: this.options.apiBackend,
                height: this.arrow ? 24 : 30,
                time: () => this.video.currentTime,
                unlimited: this.user.get('unlimited'),
                api: {
                    danmakuID: this.options.danmaku.id,
                    address: this.options.danmaku.api,
                    token: this.options.danmaku.token,
                    maximum: this.options.danmaku.maximum,
                    addition: this.options.danmaku.addition,
                    userID: this.options.danmaku.userID,
                    speedRate: this.options.danmaku.speedRate,
                },
                events: this.events,
            });

            this.comment = new Comment(this);
        }

        this.setting = new Setting(this);

        this.docClickFun = () => {
            this.focus = false;
        };
        this.containerClickFun = () => {
            this.focus = true;
        };
        document.addEventListener('click', this.docClickFun, true);
        this.container.addEventListener('click', this.containerClickFun, true);

        this.paused = true;

        this.timer = new Timer(this);

        this.hotkey = new HotKey(this);

        this.contextmenu = new ContextMenu(this);

        (() => {
            this.dashPlayer = dashjs.MediaPlayer().create();
            this.dashPlayer.initialize(this.video, this.video.src, false);
        })();

        this.initVideo(this.video, this.dashPlayer);

        this.infoPanel = new InfoPanel(this);

        index++;
    }

    /**
     * Seek video
     */
    videoSeek(time) {
        time = Math.max(time, 0);
        if (this.dashPlayer.duration()) {
            time = Math.min(time, this.dashPlayer.duration());
        }

        this.dashPlayer.seek(time);

        if (this.danmaku) {
            this.danmaku.seek();
            this.danmaku.load();
        }

        this.bar.set('played', time / this.dashPlayer.duration(), 'width');
        this.template.ptime.innerHTML = utils.secondToTime(time);
    }

    /**
     * Play video
     */
    play(fromNative, isAutoPlay) {
        this.paused = false;
        if (this.dashPlayer.isPaused && !utils.isMobile) {
            this.bezel.switch(Icons.play);
        }

        this.template.playButton.innerHTML = Icons.pause;
        this.template.mobilePlayButton.innerHTML = Icons.pause;

        if (!fromNative) {
            const playedPromise = Promise.resolve(this.video.play());
            playedPromise
                .catch(() => {
                    if (isAutoPlay) {
                        this.video.muted = true;
                        this.template.volumeIcon.innerHTML = Icons.volumeOff;
                        this.bar.set('volume', 0, 'width');
                        this.notice('当前页面已自动静音啦, 您可以手动开启哦~', 5000);
                        this.dashPlayer.play();
                    } else {
                        this.pause();
                    }
                })
                .then(() => {});
        }
        this.timer.enable('loading');
        this.container.classList.remove('lemur-player-paused');
        this.container.classList.add('lemur-player-playing');

        if (this.danmaku) {
            this.danmaku.play();
        }

    }

    /**
     * Pause video
     */
    pause(fromNative) {
        this.paused = true;
        this.container.classList.remove('lemur-player-loading');

        if (!this.dashPlayer.isPaused() && !utils.isMobile) {
            this.bezel.switch(Icons.pause);
        }

        this.template.playButton.innerHTML = Icons.play;
        this.template.mobilePlayButton.innerHTML = Icons.play;
        if (!fromNative) {
            this.dashPlayer.pause();
        }
        this.timer.disable('loading');
        this.container.classList.remove('lemur-player-playing');
        this.container.classList.add('lemur-player-paused');
        if (this.danmaku) {
            this.danmaku.pause();
        }

    }

    switchVolumeIcon() {
        if (this.volume() >= 0.95) {
            this.template.volumeIcon.innerHTML = Icons.volumeUp;
        } else if (this.volume() > 0) {
            this.template.volumeIcon.innerHTML = Icons.volumeDown;
        } else {
            this.template.volumeIcon.innerHTML = Icons.volumeOff;
        }
    }

    /**
     * Set volume
     */
    volume(percentage, noStorage) {
        percentage = parseFloat(percentage);
        if (!isNaN(percentage)) {
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);

            this.bar.set('volume', percentage, 'width');

            if (!noStorage) {
                this.user.set('volume', percentage);
            }

            this.dashPlayer.setVolume(percentage);
            if (this.video.muted) {
                this.video.muted = false;
            }
            this.switchVolumeIcon();
        }

        return this.video.volume;
    }

    /**
     * Toggle between play and pause
     */
    toggle() {
        if (this.dashPlayer.isPaused()) {
            this.play();
        } else {
            this.pause();
        }
    }

    /**
     * attach event
     */
    on(name, callback) {
        this.events.on(name, callback);
    }

    /**
     * 此方法因当前播放器仅需要 MPEG-DASH 协议, 暂时停用
     */
    // initMSE(video, type, isAutoplay) {
    //     this.type = type;
    //
    //     if (this.type === 'auto') {
    //         if (/m3u8(#|\?|$)/i.exec(video.src)) {
    //             this.type = 'hls';
    //         } else if (/.flv(#|\?|$)/i.exec(video.src)) {
    //             this.type = 'flv';
    //         } else if (/.mpd(#|\?|$)/i.exec(video.src)) {
    //             this.type = 'dash';
    //         } else {
    //             this.type = 'normal';
    //         }
    //     }
    //
    //     if (this.type === 'hls' && (video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegURL'))) {
    //         this.type = 'normal';
    //     }
    //
    //     switch (this.type) {
    //         // https://github.com/Dash-Industry-Forum/dash.js
    //         case 'dash':
    //             if (window.dashjs) {
    //                 window.dashjs.MediaPlayer().create().initialize(video, video.src, isAutoplay);
    //                 this.events.on('destroy', () => {
    //                     window.dashjs.MediaPlayer().reset();
    //                 });
    //             } else {
    //                 this.notice("Error: Can't find dashjs.");
    //             }
    //             break;
    //         // https://github.com/video-dev/hls.js
    //         case 'hls':
    //             if (window.Hls) {
    //                 if (window.Hls.isSupported()) {
    //                     const options = this.options.pluginOptions.hls;
    //                     const hls = new window.Hls(options);
    //                     this.plugins.hls = hls;
    //                     hls.loadSource(video.src);
    //                     hls.attachMedia(video);
    //                     this.events.on('destroy', () => {
    //                         hls.destroy();
    //                         delete this.plugins.hls;
    //                     });
    //                 } else {
    //                     this.notice('Error: Hls is not supported.');
    //                 }
    //             } else {
    //                 this.notice("Error: Can't find Hls.");
    //             }
    //             break;
    //         default:
    //             break;
    //     }
    // }

    initVideo(video, dashPlayer) {

        // show video time: the metadata has loaded or changed
        this.on('durationchange', () => {
            // compatibility: Android browsers will output 1 or Infinity at first
            if (dashPlayer.duration() !== 1 && dashPlayer.duration() !== Infinity) {
                this.template.dtime.innerHTML = utils.secondToTime(dashPlayer.duration());
            }
        });

        this.on('progress', () => {
            // 判断视频缓冲区是否存在
            if (!isNaN(dashPlayer.getBufferLength('video'))) {
                const percentage = (video.currentTime + dashPlayer.getBufferLength('video')) / dashPlayer.duration();
                this.bar.set('loaded', percentage, 'width');
            } else {
                this.bar.set('loaded', 0, 'width');
            }
        });

        // video download error: an error occurs
        this.on('error', () => {
            if (!this.video.error) {
                // Not a video load error, may be poster load failed, see #307
                return;
            }
            this.notice && this.notice('加载异常, 正在重新请求视频地址');
        });

        this.on('ended', () => {
            this.bar.set('played', 1, 'width');
            this.pause();
            if (this.setting.loop) {
                this.videoSeek(0);
                this.isEnded = true;
            }
            if (this.danmaku) {
                this.danmaku.clear();
            }
        });

        // this.on('play', () => {
        //     if (this.dashPlayer.isPaused()) {
        //         this.play(true);
        //     }
        // });
        //
        // this.on('pause', () => {
        //     if (!this.dashPlayer.isPaused()) {
        //         console.log('莫名其妙的暂停事件');
        //         this.pause(true);
        //     }
        // });

        this.on('canplay', () => {

            if (this.isFirstCanPlay) {
                this.isFirstCanPlay = false;
                if (this.options.autoplay) {
                    this.play(false, true);
                }
            }

            if (this.isEnded && this.setting.loop) {

                this.isEnded = false;
                this.play();
            }
        });

        this.on('timeupdate', () => {
            const currentTime = this.video.currentTime;

            this.bar.set('played', currentTime / dashPlayer.duration(), 'width');
            const timeStamp = utils.secondToTime(currentTime);

            if (this.template.ptime.innerHTML !== timeStamp) {
                this.template.ptime.innerHTML = timeStamp;
            }
            if (this.danmaku && this.danmaku.paused) {
                this.danmaku.play();
            }

            // 判断视频是否播放结束, 允许误差在0.01范围之内, 用于预防在拖动进度条时, 一定几率导致 ended 事件未触发
            if (Math.abs(currentTime - dashPlayer.duration()) < 0.01) {
                this.video.dispatchEvent(new Event('ended'));
            }
        });

        for (let i = 0; i < this.events.videoEvents.length; i++) {
            video.addEventListener(this.events.videoEvents[i], (e) => {
                this.events.trigger(this.events.videoEvents[i], e);
            });
        }

        this.volume(this.user.get('volume'), true);

    }

    // switchQuality(index) {
    //     index = typeof index === 'string' ? parseInt(index) : index;
    //     if (this.qualityIndex === index || this.switchingQuality) {
    //         return;
    //     } else {
    //         this.prevIndex = this.qualityIndex;
    //         this.qualityIndex = index;
    //     }
    //     this.switchingQuality = true;
    //     this.quality = this.options.video.quality[index];
    //     this.template.qualityButton.innerHTML = this.quality.name;
    //
    //     let paused = this.video.paused;
    //     this.video.pause();
    //     const videoHTML = tplVideo({
    //         current: false,
    //         pic: null,
    //         preload: 'auto',
    //         url: this.quality.url,
    //     });
    //     const videoEle = new DOMParser().parseFromString(videoHTML, 'text/html').body.firstChild;
    //     this.template.videoWrap.insertBefore(videoEle, this.template.videoWrap.getElementsByTagName('div')[0]);
    //     this.prevVideo = this.video;
    //     this.video = videoEle;
    //     this.initVideo(this.video, this.quality.type || this.options.video.type);
    //     this.videoSeek(this.prevVideo.currentTime);
    //     this.events.trigger('quality_start', this.quality);
    //
    //     this.on('canplay', () => {
    //         if (this.prevVideo) {
    //             if (this.video.currentTime !== this.prevVideo.currentTime) {
    //                 this.videoSeek(this.prevVideo.currentTime);
    //                 return;
    //             }
    //             this.template.videoWrap.removeChild(this.prevVideo);
    //             this.video.classList.add('lemur-player-video-current');
    //             this.prevVideo = null;
    //             this.switchingQuality = false;
    //             this.events.trigger('quality_end');
    //             if (!paused) {
    //                 this.play();
    //             }
    //         }
    //     });
    //
    //     this.on('error', () => {
    //         if (!this.video.error) {
    //             return;
    //         }
    //         if (this.prevVideo) {
    //             this.template.videoWrap.removeChild(this.video);
    //             this.video = this.prevVideo;
    //             if (!paused) {
    //                 this.play();
    //             }
    //             this.qualityIndex = this.prevIndex;
    //             this.quality = this.options.video.quality[this.qualityIndex];
    //             this.prevVideo = null;
    //             this.switchingQuality = false;
    //         }
    //     });
    // }

    notice(text, time = 2000, opacity = 0.8) {

        const notice = Template.NewNotice(text, opacity);

        this.template.noticeList.appendChild(notice);
        this.events.trigger('notice_show', notice);

        if (time > 0) {
            setTimeout(
                (function (e, dp) {
                    return () => {
                        e.addEventListener('animationend', () => {
                            dp.template.noticeList.removeChild(e);
                        });
                        e.classList.add('remove-notice');
                        dp.events.trigger('notice_hide');
                    };
                })(notice, this),
                time
            );
        }
    }

    resize() {
        if (this.danmaku) {
            this.danmaku.resize();
        }
        this.events.trigger('resize');
    }

    speed(rate) {
        this.video.playbackRate = rate;
    }

    destroy() {
        this.pause();
        document.removeEventListener('click', this.docClickFun, true);
        this.container.removeEventListener('click', this.containerClickFun, true);
        this.fullScreen.destroy();
        this.hotkey.destroy();
        this.contextmenu.destroy();
        this.controller.destroy();
        this.timer.destroy();
        this.video.src = '';
        this.container.innerHTML = '';
        this.events.trigger('destroy');
    }

    static get version() {
        return '1.0.0';
    }
}

export default LemurPlayer;
