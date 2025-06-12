// This function prevents the context menu from showing up when right-clicking
// It's important for game controls to work properly
export function preventContextMenu() {
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });
}
