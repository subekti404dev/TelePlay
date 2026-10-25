/**
 * Copy text to the clipboard.
 *
 * `navigator.clipboard` only exists in secure contexts (HTTPS or localhost).
 * TelePlay is commonly served over plain HTTP on a LAN IP (e.g.
 * http://192.168.1.10:81), where the Async Clipboard API is unavailable and
 * `navigator.clipboard.writeText()` throws — so copying silently did nothing.
 * Fall back to a hidden textarea + execCommand('copy') in that case.
 */
export async function copyText(text: string): Promise<boolean> {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Permission denied / not focused — fall through to the legacy path.
        }
    }

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);

        const selection = document.getSelection();
        const previousRange = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

        textarea.select();
        textarea.setSelectionRange(0, text.length);

        const copied = document.execCommand('copy');

        document.body.removeChild(textarea);
        if (previousRange && selection) {
            selection.removeAllRanges();
            selection.addRange(previousRange);
        }

        return copied;
    } catch {
        return false;
    }
}
