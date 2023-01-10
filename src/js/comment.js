import utils from './utils';

class Comment {
    constructor(player) {
        this.player = player;

        this.player.template.mask.addEventListener('click', () => {
            this.hide();
        });
        this.player.template.commentButton.addEventListener('click', () => {
            this.show();
        });
        this.player.template.commentSettingButton.addEventListener('click', () => {
            this.toggleSetting();
        });

        this.player.template.commentColorSettingBox.addEventListener('click', () => {
            const sele = this.player.template.commentColorSettingBox.querySelector('input:checked+span');
            if (sele) {
                const color = this.player.template.commentColorSettingBox.querySelector('input:checked').value;
                this.player.template.commentSettingFill.style.fill = color;
                this.player.template.commentInput.style.color = color;
                this.player.template.commentSendFill.style.fill = color;
            }
        });

        this.player.template.commentInput.addEventListener('click', () => {
            this.hideSetting();
        });
        this.player.template.commentInput.addEventListener('keydown', (e) => {
            const event = e || window.event;
            if (event.keyCode === 13) {
                this.send();
            }
        });

        this.player.template.commentSendButton.addEventListener('click', () => {
            this.send();
        });
    }

    show() {
        this.player.controller.disableAutoHide = true;
        this.player.template.controller.classList.add('lemur-player-controller-comment');
        this.player.template.mask.classList.add('lemur-player-mask-show');
        this.player.container.classList.add('lemur-player-show-controller');
        this.player.template.commentInput.focus();
    }

    hide() {
        this.player.template.controller.classList.remove('lemur-player-controller-comment');
        this.player.template.mask.classList.remove('lemur-player-mask-show');
        this.player.container.classList.remove('lemur-player-show-controller');
        this.player.controller.disableAutoHide = false;
        this.hideSetting();
    }

    showSetting() {
        this.player.template.commentSettingBox.classList.add('lemur-player-comment-setting-open');
    }

    hideSetting() {
        this.player.template.commentSettingBox.classList.remove('lemur-player-comment-setting-open');
    }

    toggleSetting() {
        if (this.player.template.commentSettingBox.classList.contains('lemur-player-comment-setting-open')) {
            this.hideSetting();
        } else {
            this.showSetting();
        }
    }

    send() {
        this.player.template.commentInput.blur();

        // 如果用户按了 Enter 键, 却没有在弹幕发送框输入文字, 则关闭发送框
        if (!this.player.template.commentInput.value.replace(/^\s+|\s+$/g, '')) {
            this.hide();
            return;
        }

        this.player.danmaku.send(
            {
                text: this.player.template.commentInput.value,
                color: utils.color2Number(this.player.container.querySelector('.lemur-player-comment-setting-color input:checked').value),
                type: parseInt(this.player.container.querySelector('.lemur-player-comment-setting-type input:checked').value),
            },
            () => {
                this.player.template.commentInput.value = '';
                this.hide();
            }
        );
    }
}

export default Comment;
