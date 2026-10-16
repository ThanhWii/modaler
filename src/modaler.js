class Modaler {
    #opt;
    #allowBackdropClose;
    #allowButtonClose;
    #allowEscapeClose;
    #template;
    #content;
    #modalContent;
    #footerContent;
    #footerButtons = [];
    #backdrop;
    #modalFooter;

    constructor(options = {}) {
        if (!options.content && !options.templateId) {
            console.error(`You must provide one of 'content' or 'templateId'.`);
            return;
        }
        if (options.content && options.templateId) {
            options.templateId = null;
            console.warn(`Both 'content' and 'templatedId are specified. 'content' will take precedence, and 'templateId' will be ignore.`);
        }
        if (options.templateId) {
            this.#template = document.querySelector(`#${options.templateId}`);
            if (!this.#template) {
                console.error(`#${options.templateId} does not exists.`);
                return;
            }
        }
        this.#opt = {
            templateId: null,
            closeMethods: ['button', 'overlay', 'escape'],
            destroyOnClose: true,
            cssClasses: [],
            footer: false,
            enableScrollLock: true,
            scrollLockTarget: () => document.body,
            onOpen: () => { },
            onClose: () => { },
            ...options
        }

        this.#content = this.#opt.content;
        this.#allowBackdropClose = this.#opt.closeMethods.includes('overlay');
        this.#allowButtonClose = this.#opt.closeMethods.includes('button');
        this.#allowEscapeClose = this.#opt.closeMethods.includes('escape');
    }

    // Static private properties
    static #modalElements = [];
    static #scrollbarWidth;

    // Static private methods
    static #hasScrollbar(target) {
        if ([document.documentElement, document.body].includes(target)) {
            return document.documentElement.scrollHeight > document.documentElement.clientHeight || document.body.scrollHeight > document.body.clientHeight;
        }
        return target.scrollHeight > target.clientHeight;
    }

    static #getScrollBarWidth() {
        if (Modaler.#scrollbarWidth !== undefined) return Modaler.#scrollbarWidth;
        const div = document.createElement('div');
        Object.assign(div.style, {
            overflow: 'scroll',
            position: 'absolute',
            top: '-999px',
        });
        document.body.appendChild(div);
        Modaler.#scrollbarWidth = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return Modaler.#scrollbarWidth;
    }

    // Private methods
    #onTransitionEnd(callback) {
        this.#backdrop.ontransitionend = (e) => {
            if (e.propertyName !== 'transform') return;
            this.#backdrop.ontransitionend = null;
            if (typeof callback === 'function') callback();
        }
    }

    #handleEscapeKey = (e) => {
        const lastModal = Modaler.#modalElements[Modaler.#modalElements.length - 1];
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
        const contentNode = this.#content ? document.createElement('div') : this.#template.content.cloneNode(true);
        if (this.#content) {
            contentNode.innerHTML = this.#content;
        }
        this.#backdrop = document.createElement('div');
        this.#backdrop.className = "modaler";

        const container = document.createElement('div');
        container.className = "modaler__container";
        this.#opt.cssClasses.forEach((cssClass) => {
            if (typeof cssClass === 'string') {
                container.classList.add(cssClass);
            }
        });

        if (this.#allowButtonClose) {
            const closeBtn = this.#createButtons('&times;', "modaler__close", () => this.close());
            container.append(closeBtn);
        }
        this.#modalContent = document.createElement('div');
        this.#modalContent.className = "modaler__content";

        // Append content and elements
        this.#modalContent.append(contentNode);
        container.append(this.#modalContent);
        if (this.#opt.footer) {
            this.#modalFooter = document.createElement('div');
            this.#modalFooter.className = 'modaler__footer';
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
        Modaler.#modalElements.push(this);

        if (!this.#backdrop) {
            this.#build();
        }
        setTimeout(() => {
            this.#backdrop.classList.add('modaler--show');
        }, 0)
        if (this.#allowEscapeClose) {
            document.addEventListener('keydown', this.#handleEscapeKey);
        }
        // Disable scrolling
        if (Modaler.#modalElements.length === 1 && this.#opt.enableScrollLock) {
            const target = this.#opt.scrollLockTarget();
            if (Modaler.#hasScrollbar(target)) {
                target.classList.add('modaler--no-scroll');
                const targetPaddingRight = parseInt(getComputedStyle(target).paddingRight);
                target.style.paddingRight = Modaler.#getScrollBarWidth() + targetPaddingRight + 'px';
            }
        }

        this.#onTransitionEnd(this.#opt.onOpen);

        return this.#backdrop;
    }

    close(destroy = this.#opt.destroyOnClose) {
        Modaler.#modalElements.pop();
        this.#backdrop.classList.remove("modaler--show");
        this.#onTransitionEnd(() => {
            if (this.#backdrop && destroy) {
                this.#backdrop.remove();
                this.#backdrop = null;
                this.#modalFooter = null;
                this.#footerContent = null;
            }
            // Enable scrolling
            if (Modaler.#modalElements.length === 0 && this.#opt.enableScrollLock) {
                const target = this.#opt.scrollLockTarget();
                if (Modaler.#hasScrollbar(target)) {
                    target.classList.remove('modaler--no-scroll');
                    target.style.paddingRight = '';
                }
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

    setFooterContent(content) {
        this.#footerContent = content;
        this.#renderFooterContent();
    }

    addFooterButton(title, cssClass, callback) {
        const button = this.#createButtons(title, cssClass, callback);
        this.#footerButtons.push(button);
        if (this.#modalFooter) {
            this.#renderFooterButtons();
        }
    }

    setContent(content) {
        this.#content = content;
        if (this.#modalContent) {
            this.#modalContent.innerHTML = this.#content;
        }
    }
}
