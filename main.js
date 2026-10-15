class Modal {
    #opt;
    #allowBackdropClose;
    #allowButtonClose;
    #allowEscapeClose;

    constructor(options = {}) {
        this.#opt = {
            templateId: null,
            closeMethods: ['button', 'overlay', 'escape'],
            ...options
        }
        this.#allowBackdropClose = this.#opt.closeMethods.includes('overlay');
        this.#allowButtonClose = this.#opt.closeMethods.includes('button');
        this.#allowEscapeClose = this.#opt.closeMethods.includes('escape');
    }

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

    open() {
        // const { templatedId, allowBackdropClose = true } = options;
        const template = document.querySelector(`#${this.#opt.templateId}`);
        if (!template) {
            console.error(`#${this.#opt.templateId} does not exists.`);
            return;
        }

        const content = template.content.cloneNode(true);
        const backdrop = document.createElement('div');
        backdrop.className = "modal-backdrop show";

        const container = document.createElement('div');
        container.className = "modal-container";

        const closeBtn = document.createElement('button');
        closeBtn.className = "modal-close";
        closeBtn.innerHTML = '&times;';

        const modalContent = document.createElement('div');
        modalContent.className = "modal-content";

        // Append content and elements
        modalContent.append(content);
        container.append(closeBtn, modalContent);
        backdrop.append(container);
        document.body.append(backdrop);

        // Attach event listeners
        if (this.#allowButtonClose) {
            closeBtn.onclick = () => {
                this.close(backdrop);
            }
        }
        if (this.#allowBackdropClose) {
            backdrop.onclick = (e) => {
                if (e.target === e.currentTarget) {
                    this.close(backdrop);
                }
            }
        }
        if (this.#allowEscapeClose) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.close(backdrop);
                }
            });
        }

        // Disable scrolling
        document.body.classList.add('no-scroll');
        document.body.style.paddingRight = Modal.#getScrollBarWidth() + 'px';

        return backdrop;
    }

    close(modalElement) {
        modalElement.classList.remove("show");
        modalElement.ontransitionend = (e) => {
            if (e.propertyName === 'transform') {
                modalElement.remove();
            }
        }
        // Enable scrolling
        document.body.classList.remove('no-scroll');
        document.body.style.paddingRight = '';
    }
}

// TEST
const modal1 = new Modal({
    templateId: 'modal-1',
    // footer: true,
    // cssClass: ['class-1', 'class-2'],
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
