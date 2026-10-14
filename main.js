class Modal {
    open(options = {}) {
        const { templatedId } = options;
        const template = document.querySelector(`#${templatedId}`);
        if (!template) {
            console.error(`#${templatedId} does not exists.`);
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
        closeBtn.onclick = () => {
            this.closeModal(backdrop);
        }
        backdrop.onclick = (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal(backdrop);
            }
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal(backdrop);
            }
        });

        return backdrop;
    }

    closeModal(modalElement) {
        modalElement.classList.remove("show");
        modalElement.ontransitionend = (e) => {
            if (e.propertyName === 'transform') {
                modalElement.remove();
            }
        }
    }
}

// TEST
const modal1 = new Modal();
document.querySelector('#open-modal-1').onclick = () => {
    modal1.open({
        templatedId: 'modal-1',
    });
}

const modal2 = new Modal();
document.querySelector('#open-modal-2').onclick = () => {
    const modalElement = modal2.open({
        templatedId: 'modal-2',
    });

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
