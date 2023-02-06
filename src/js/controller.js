import utils from './utils';
import Icons from './icons';

class Controller {
    constructor(player) {
        this.player = player;

        this.autoHideTimer = 0;
        if (!utils.isMobile) {
            this.setAutoHideHandler = this.setAutoHide.bind(this);
            this.player.container.addEventListener('mousemove', this.setAutoHideHandler);
            this.player.container.addEventListener('click', this.setAutoHideHandler);
            this.player.on('play', this.setAutoHideHandler);
            this.player.on('pause', this.setAutoHideHandler);
        }

        this.initPlayButton();
        this.initPlayedBar();
        this.initFullButton();
        this.initQualityButton();
        this.initAirplayButton();
        if (!utils.isMobile) {
            this.initVolumeButton();
        }
    }

    initPlayButton() {
        this.player.template.playButton.addEventListener('click', () => {
            this.player.toggle();
        });

        this.player.template.mobilePlayButton.addEventListener('click', () => {
            this.player.toggle();
        });

        if (!utils.isMobile) {
            if (!this.player.options.preventClickToggle) {
                this.player.template.videoWrap.addEventListener('click', () => {
                    this.player.toggle();
                });
                this.player.template.controllerMask.addEventListener('click', () => {
                    this.player.toggle();
                });
            }
        } else {
            this.player.template.videoWrap.addEventListener('click', () => {
                this.toggle();
            });
            this.player.template.controllerMask.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    initPlayedBar() {
        // 视频是否被自动暂停
        let isAutoPause = false;

        // 进度条正在被拖动
        const videoProgressMove = (e) => {
            // 视频是否处于暂停的状态
            let isPause = this.player.video.paused;
            // 如果视频正在播放, 则将其自动暂停
            if (!isPause) {
                this.player.pause();
                isAutoPause = true;
            }
            let percentage = (e.clientX - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.template.ptime.innerHTML = utils.secondToTime(percentage * this.player.video.duration);
        };

        // 进度条拖动结束
        const videoProgressUpdate = (e) => {
            document.removeEventListener(utils.nameMap.dragEnd, videoProgressUpdate);
            document.removeEventListener(utils.nameMap.dragMove, videoProgressMove);
            let percentage = (e.clientX - utils.getBoundingClientRectViewLeft(this.player.template.playedBarWrap)) / this.player.template.playedBarWrap.clientWidth;
            percentage = Math.max(percentage, 0);
            percentage = Math.min(percentage, 1);
            this.player.bar.set('played', percentage, 'width');
            this.player.videoSeek(this.player.bar.get('played') * this.player.video.duration);
            this.player.timer.enable('progress');

            // 如果视频曾被自动暂停, 则此时恢复播放
            if (isAutoPause) {
                this.player.play();
                isAutoPause = false;
            }
        };

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragStart, () => {
            this.player.timer.disable('progress');
            document.addEventListener(utils.nameMap.dragMove, videoProgressMove);
            document.addEventListener(utils.nameMap.dragEnd, videoProgressUpdate);
        });

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragMove, (e) => {
            if (this.player.video.duration) {
                const px = this.player.template.playedBarWrap.getBoundingClientRect().left;
                const tx = e.clientX - px;
                if (tx < 0 || tx > this.player.template.playedBarWrap.offsetWidth) {
                    return;
                }
                const time = this.player.video.duration * (tx / this.player.template.playedBarWrap.offsetWidth);

                this.player.template.playedBarTime.style.left = `${tx - (time >= 3600 ? 25 : 20)}px`;
                this.player.template.playedBarTime.innerText = utils.secondToTime(time);
                this.player.template.playedBarTime.classList.remove('hidden');
            }
        });

        this.player.template.playedBarWrap.addEventListener(utils.nameMap.dragEnd, () => {
        });

        if (!utils.isMobile) {
            this.player.template.playedBarWrap.addEventListener('mouseenter', () => {
                if (this.player.video.duration) {
                    this.player.template.playedBarTime.classList.remove('hidden');
                }
            });

            this.player.template.playedBarWrap.addEventListener('mouseleave', () => {
                if (this.player.video.duration) {
                    this.player.template.playedBarTime.classList.add('hidden');
                }
            });
        }
    }

    initFullButton() {
        this.player.template.browserFullButton.addEventListener('click', () => {
            this.player.fullScreen.toggle('browser');
        });

        this.player.template.webFullButton.addEventListener('click', () => {
            this.player.fullScreen.toggle('web');
        });
    }

    initVolumeButton() {
        const vWidth = 50;

        const volumeMove = (event) => {
            const e = event || window.event;
            const percentage = ((e.clientX) - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap)) / vWidth;
            this.player.volume(percentage);
        };
        const volumeUp = () => {
            document.removeEventListener(utils.nameMap.dragEnd, volumeUp);
            document.removeEventListener(utils.nameMap.dragMove, volumeMove);
            this.player.template.volumeButton.classList.remove('lemur-player-volume-active');
        };

        this.player.template.volumeBarWrapWrap.addEventListener('click', (event) => {
            const e = event || window.event;
            const percentage = (e.clientX - utils.getBoundingClientRectViewLeft(this.player.template.volumeBarWrap)) / vWidth;
            this.player.volume(percentage);
        });
        this.player.template.volumeBarWrapWrap.addEventListener(utils.nameMap.dragStart, () => {
            document.addEventListener(utils.nameMap.dragMove, volumeMove);
            document.addEventListener(utils.nameMap.dragEnd, volumeUp);
            this.player.template.volumeButton.classList.add('lemur-player-volume-active');
        });
        this.player.template.volumeButtonIcon.addEventListener('click', () => {
            if (this.player.video.muted) {
                this.player.video.muted = false;
                this.player.switchVolumeIcon();
                this.player.bar.set('volume', this.player.volume(), 'width');
            } else {
                this.player.video.muted = true;
                this.player.template.volumeIcon.innerHTML = Icons.volumeOff;
                this.player.bar.set('volume', 0, 'width');
            }
        });
    }

    initQualityButton() {
        if (this.player.options.video.quality) {
            this.player.template.qualityList.addEventListener('click', (e) => {
                if (e.target.classList.contains('lemur-player-quality-item')) {
                    this.player.switchQuality(e.target.dataset.index);
                }
            });
        }
    }

    initAirplayButton() {
        if (this.player.options.airplay) {
            if (window.WebKitPlaybackTargetAvailabilityEvent) {
                this.player.video.addEventListener(
                    'webkitplaybacktargetavailabilitychanged',
                    function (event) {
                        switch (event.availability) {
                            case 'available':
                                this.template.airplayButton.disable = false;
                                break;

                            default:
                                this.template.airplayButton.disable = true;
                        }

                        this.template.airplayButton.addEventListener(
                            'click',
                            function () {
                                this.video.webkitShowPlaybackTargetPicker();
                            }.bind(this)
                        );
                    }.bind(this.player)
                );
            } else {
                this.player.template.airplayButton.style.display = 'none';
            }
        }
    }

    setAutoHide() {
        this.show();
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = setTimeout(() => {
            if (this.player.video.played.length && !this.player.paused && !this.disableAutoHide) {
                this.hide();
            }
        }, 3000);
    }

    show() {
        this.player.container.classList.remove('lemur-player-hide-controller');
    }

    hide() {
        this.player.container.classList.add('lemur-player-hide-controller');
        this.player.setting.hide();
        this.player.comment && this.player.comment.hide();
    }

    isShow() {
        return !this.player.container.classList.contains('lemur-player-hide-controller');
    }

    toggle() {
        if (this.isShow()) {
            this.hide();
        } else {
            this.show();
        }
    }

    destroy() {
        if (!utils.isMobile) {
            this.player.container.removeEventListener('mousemove', this.setAutoHideHandler);
            this.player.container.removeEventListener('click', this.setAutoHideHandler);
        }
        clearTimeout(this.autoHideTimer);
    }
}

export default Controller;
