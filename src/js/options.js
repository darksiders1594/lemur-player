import defaultApiBackend from './api.js';

export default (options) => {
    // default options
    const defaultOption = {
        container: options.element,
        autoplay: false,
        loop: false,
        lang: (navigator.language || navigator.browserLanguage).toLowerCase(),
        airplay: true,
        hotkey: true,
        preload: 'metadata',
        volume: 0.7,
        playbackSpeed: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        apiBackend: defaultApiBackend,
        video: {},
        contextmenu: [],
        mutex: true,
        pluginOptions: { hls: {}, flv: {}, dash: {} },
        preventClickToggle: false
    };
    for (const defaultKey in defaultOption) {
        if (defaultOption.hasOwnProperty(defaultKey) && !options.hasOwnProperty(defaultKey)) {
            options[defaultKey] = defaultOption[defaultKey];
        }
    }
    if (options.video) {
        !options.video.type && (options.video.type = 'auto');
    }
    if (typeof options.danmaku === 'object' && options.danmaku) {
        !options.danmaku.userID && (options.danmaku.userID = 'KJulien');
    }

    if (options.video.quality) {
        options.video.url = options.video.quality[options.video.defaultQuality].url;
    }

    if (options.lang) {
        options.lang = options.lang.toLowerCase();
    }

    options.contextmenu = options.contextmenu.concat([
        {
            text: '视频统计信息',
            click: (player) => {
                player.infoPanel.triggle();
            },
        }
    ]);

    return options;
};
