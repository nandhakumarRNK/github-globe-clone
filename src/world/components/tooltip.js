export class Tooltip {
    constructor(container) {
        this.container = container;

        this.el = document.createElement('div');
        this.el.style.position = 'absolute';
        this.el.style.display = 'none';
        this.el.style.pointerEvents = 'none';
        this.el.style.padding = '10px';
        this.el.style.background = 'rgba(0, 0, 0, 0.5)';
        this.el.style.color = '#fff';

        this.container.appendChild(this.el);
    }

    showAt([x, y], html) {
        this.el.style.display = 'block';
        this.el.style.left = `${x}px`;
        this.el.style.top = `${y}px`;
        this.el.innerHTML = html;
    }

    hide() {
        this.el.style.display = 'none';
    }
}