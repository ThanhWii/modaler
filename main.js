class Modal {
    #opt;
    #allowBackdropClose;
    #allowButtonClose;
    #allowEscapeClose;
    #backdrop;
    #template;

    constructor(options = {}) {
        this.#opt = {
            templateId: null,
            closeMethods: ['button', 'overlay', 'escape'],
            destroyOnClose: true,
            cssClasses: [],
            ...options
        }
        this.#template = document.querySelector(`#${this.#opt.templateId}`);
        if (!this.#template) {
            console.error(`#${this.#opt.templateId} does not exists.`);
            return;
        }
        this.#allowBackdropClose = this.#opt.closeMethods.includes('overlay');
        this.#allowButtonClose = this.#opt.closeMethods.includes('button');
        this.#allowEscapeClose = this.#opt.closeMethods.includes('escape');
    }

    // Static private methods
    static #getScrollBarWidth() {
        if (this.#getScrollBarWidth.value) return this.#getScrollBarWidth.value;
        const div = document.createElement('div');
        Object.assign(div.style, {
            overflow: 'scroll',
            position: 'absolute',
            top: '-999px',
        });
        document.body.appendChild(div);
        this.#getScrollBarWidth.value = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return this.#getScrollBarWidth.value;
    }

    // Private methods
    #build() {
        const content = this.#template.content.cloneNode(true);
        this.#backdrop = document.createElement('div');
        this.#backdrop.className = "modal-backdrop";

        const container = document.createElement('div');
        container.className = "modal-container";
        this.#opt.cssClasses.forEach((cssClass) => {
            if (typeof cssClass === 'string') {
                container.classList.add(cssClass);
            }
        });

        const closeBtn = document.createElement('button');
        closeBtn.className = "modal-close";
        closeBtn.innerHTML = '&times;';

        const modalContent = document.createElement('div');
        modalContent.className = "modal-content";

        // Append content and elements
        modalContent.append(content);
        container.append(closeBtn, modalContent);
        this.#backdrop.append(container);
        document.body.append(this.#backdrop);
        // Attach event listeners
        if (this.#allowButtonClose) {
            closeBtn.onclick = () => {
                this.close();
            }
        }
        if (this.#allowBackdropClose) {
            this.#backdrop.onclick = (e) => {
                if (e.target === e.currentTarget) {
                    this.close();
                }
            }
        }
        if (this.#allowEscapeClose) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            });
        }

        // Disable scrolling
        document.body.classList.add('no-scroll');
        document.body.style.paddingRight = Modal.#getScrollBarWidth() + 'px';
    }

    // API
    open() {
        if (!this.#backdrop) {
            this.#build();
        }
        setTimeout(() => {
            this.#backdrop.classList.add('show');
        }, 0)

        return this.#backdrop;
    }

    close(destroy = this.#opt.destroyOnClose) {
        this.#backdrop.classList.remove("show");
        this.#backdrop.ontransitionend = (e) => {
            if (e.propertyName === 'transform' && destroy) {
                this.#backdrop.remove();
                this.#backdrop = null;
            }
        }
        // Enable scrolling
        document.body.classList.remove('no-scroll');
        document.body.style.paddingRight = '';
    }

    destroy() {
        this.close(true);
    }
}

// TEST
const modal1 = new Modal({
    templateId: 'modal-1',
    destroyOnClose: false,
    cssClasses: ['class-1', 'class-2'],
    // footer: true,
    // onOpen: () => {
    //     console.log('Modal opened');
    // },
    // onClose: () => {
    //     console.log('Modal closed');
    // }
});
document.querySelector('#open-modal-1').onclick = () => {
    modal1.open();
}

const modal2 = new Modal({
    templateId: 'modal-2',
    closeMethods: ['button', 'escape'],
});
document.querySelector('#open-modal-2').onclick = () => {
    const modalElement = modal2.open();
    const form = modalElement.querySelector('#login-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const formData = {
                email: form.querySelector('#email').value.trim(),
                password: form.querySelector('#password').value.trim(),
            }
            console.log(formData);
        }
    }
}
