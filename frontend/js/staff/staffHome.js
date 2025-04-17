export function initStaff_home() {
    console.log("initializing staff home js");
    window.addEventListener('message', (event) => {
        if (event.data.call === 'SHOW_TOAST') {
            const container = document.getElementById('global-toast-container');
            const toast = document.createElement('div');
            toast.className = `global-toast ${event.data.toastType}`;
            toast.innerHTML = event.data.message;
            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 4000);
        }
    });
}