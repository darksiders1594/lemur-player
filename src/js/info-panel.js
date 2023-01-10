class InfoPanel {
    constructor(player) {
        this.container = player.template.infoPanel;
        this.template = player.template;
        this.video = player.video;
        this.player = player;

        this.template.infoPanelClose.addEventListener('click', () => {
            this.hide();
        });
    }

    show() {
        this.beginTime = Date.now();
        this.update();
        this.player.timer.enable('info');
        this.player.timer.enable('fps');
        this.container.classList.remove('lemur-player-info-panel-hide');
    }

    hide() {
        this.player.timer.disable('info');
        this.player.timer.disable('fps');
        this.container.classList.add('lemur-player-info-panel-hide');
    }

    triggle() {
        if (this.container.classList.contains('lemur-player-info-panel-hide')) {
            this.show();
        } else {
            this.hide();
        }
    }

    update() {
        this.template.infoVersion.innerHTML = `v 1.0.0`;
        this.template.infoType.innerHTML = this.player.type;
        this.template.infoUrl.innerHTML = this.player.options.video.url;
        this.template.infoResolution.innerHTML = `${this.player.video.videoWidth} x ${this.player.video.videoHeight}`;
        this.template.infoDuration.innerHTML = this.player.video.duration;
        if (this.player.options.danmaku) {
            this.template.infoDanmakuId.innerHTML = this.player.options.danmaku.id;
            this.template.infoDanmakuApi.innerHTML = this.player.options.danmaku.api;
            this.template.infoDanmakuAmount.innerHTML = this.player.danmaku.dan.length;
        }
    }

    fps(value) {
        this.template.infoFPS.innerHTML = `${value.toFixed(1)}`;
    }
}

export default InfoPanel;