class Bezel {
    constructor(container) {
        this.container = container;

        this.container.addEventListener('animationend', () => {
            this.container.classList.remove('lemur-player-bezel-transition');
        });
    }

    switch(icon) {
        this.container.innerHTML = icon;
        this.container.classList.add('lemur-player-bezel-transition');
    }
}

export default Bezel;
