class Modal {
    open(content) {
        const backdrop = document.createElement('div');
        backdrop.className = "modal-backdrop show";

        const container = document.createElement('div');
        container.className = "modal-container";

        const closeBtn = document.createElement('button');
        closeBtn.className = "modal-close";
        closeBtn.innerHTML = '&times;';

        const modalContent = document.createElement('div');
        modalContent.className = "modal-modal";

        // Append content and elements
        modalContent.innerHTML = content;
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
modal1.open(`<h1>Hello world!</h1>`);
