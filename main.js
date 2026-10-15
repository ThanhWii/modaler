class Modal {
    #opt;
    #allowBackdropClose;
    #allowButtonClose;
    #allowEscapeClose;
    #template;
    #footerContent;
    #footerButtons = [];
    #backdrop;
    #modalFooter;

    constructor(options = {}) {
        this.#opt = {
            templateId: null,
            closeMethods: ['button', 'overlay', 'escape'],
            destroyOnClose: true,
            cssClasses: [],
            footer: false,
            onOpen: () => { },
            onClose: () => { },
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

    // Static private properties
    static #modalElements = [];
    static #scrollbarWidth;

    // Static private methods
    static #getScrollBarWidth() {
        if (Modal.#scrollbarWidth) return Modal.#scrollbarWidth;
        const div = document.createElement('div');
        Object.assign(div.style, {
            overflow: 'scroll',
            position: 'absolute',
            top: '-999px',
        });
        document.body.appendChild(div);
        Modal.#scrollbarWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return Modal.#scrollbarWidth;
    }

    // Private methods
    #onTransitionEnd(callback) {
        this.#backdrop.ontransitionend = (e) => {
            if (e.propertyName !== 'transform') return;
            if (typeof callback === 'function') callback();
        }
    }

    #handleEscapeKey = (e) => {
        const lastModal = Modal.#modalElements[Modal.#modalElements.length - 1];
        if (e.key === 'Escape' && this === lastModal) {
            this.close();
        }
    };

    #createButtons(title, cssClass, callback) {
        const button = document.createElement('button');
        button.className = cssClass;
        button.innerHTML = title;
        button.onclick = callback;
        return button;
    }

    #renderFooterButtons() {
        this.#footerButtons.forEach((button) => {
            this.#modalFooter.append(button);
        })
    }

    #renderFooterContent() {
        if (this.#modalFooter && this.#footerContent) {
            this.#modalFooter.innerHTML = this.#footerContent;
        }
    }

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

        if (this.#allowButtonClose) {
            const closeBtn = this.#createButtons('&times;', "modal-close", this.close);
            closeBtn.onclick = () => {
                console.log(this);
                this.close();
            }
            container.append(closeBtn);
        }
        const modalContent = document.createElement('div');
        modalContent.className = "modal-content";

        // Append content and elements
        modalContent.append(content);
        container.append(modalContent);
        if (this.#opt.footer) {
            this.#modalFooter = document.createElement('div');
            this.#modalFooter.className = 'modal-footer';
            this.#renderFooterContent();
            this.#renderFooterButtons();
            container.append(this.#modalFooter);
        }
        this.#backdrop.append(container);
        document.body.append(this.#backdrop);
        // Attach event listeners
        if (this.#allowBackdropClose) {
            this.#backdrop.onclick = (e) => {
                if (e.target === e.currentTarget) {
                    this.close();
                }
            }
        }
    }

    // API
    open() {
        Modal.#modalElements.push(this);

        if (!this.#backdrop) {
            this.#build();
        }
        setTimeout(() => {
            this.#backdrop.classList.add('show');
        }, 0)
        if (this.#allowEscapeClose) {
            document.addEventListener('keydown', this.#handleEscapeKey);
        }
        // Disable scrolling
        document.body.classList.add('no-scroll');
        document.body.style.paddingRight = Modal.#getScrollBarWidth() + 'px';

        this.#onTransitionEnd(this.#opt.onOpen);

        return this.#backdrop;
    }

    close(destroy = this.#opt.destroyOnClose) {
        Modal.#modalElements.pop();
        this.#backdrop.classList.remove("show");
        this.#onTransitionEnd(() => {
            if (this.#backdrop && destroy) {
                this.#backdrop.remove();
                this.#backdrop = null;
                this.#footerContent = null;
            }
            // Enable scrolling
            if (Modal.#modalElements.length === 0) {
                document.body.classList.remove('no-scroll');
                document.body.style.paddingRight = null;
            }
            // Callback
            if (typeof this.#opt.onClose === 'function') {
                this.#opt.onClose();
            }
        });
        // Remove event listeners
        if (this.#allowEscapeClose) {
            document.removeEventListener('keydown', this.#handleEscapeKey);
        }
    }

    destroy() {
        this.close(true);
    }

    setFooterContent(html) {
        this.#footerContent = html;
        this.#renderFooterContent();
    }

    addFooterButton(title, cssClass, callback) {
        const button = this.#createButtons(title, cssClass, callback);
        this.#footerButtons.push(button);
        if (this.#modalFooter) {
            this.#renderFooterButtons();
        }
    }
}

// TEST
const modal1 = new Modal({
    templateId: 'modal-1',
    destroyOnClose: false,
    cssClasses: ['class-1', 'class-2'],
    // footer: true,
    onOpen: () => {
        console.log('Modal 1 openned');
    },
    onClose: () => {
        console.log('Modal 1 closed');
    }
});
document.querySelector('#open-modal-1').onclick = () => {
    modal1.open();
}

const modal2 = new Modal({
    templateId: 'modal-2',
    closeMethods: ['button', 'escape'],
    onOpen: () => {
        console.log('Modal 2 openned');
    },
    onClose: () => {
        console.log('Modal 2 closed');
    }
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

const modal3 = new Modal({
    templateId: 'modal-3',
    closeMethods: ['escape'],
    footer: true,
    onOpen: () => {
        console.log('Modal 3 openned');
    },
    onClose: () => {
        console.log('Modal 3 closed');
    }
});
document.querySelector('#open-modal-3').onclick = () => {
    modal3.open();
}
modal3.setFooterContent('<h2>Footer Content Modal 3</h2>');
modal3.addFooterButton('<span>Danger</span>', 'modal-btn danger pull-left', (e) => {
    console.log(e);
    console.log('Danger clicked');
    modal3.close();
});
modal3.addFooterButton('Cancel', 'modal-btn', (e) => {
    console.log(e);
    console.log('Cancel clicked');
    modal3.close();
});
modal3.addFooterButton('<span>Agree</span>', 'modal-btn primary', (e) => {
    console.log(e);
    console.log('Agree clicked');
    modal3.close();
});
