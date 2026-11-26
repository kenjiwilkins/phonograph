/**
 * Keeps Tab inside a dialog: wraps from the last focusable element to the first and back. Call it
 * from the dialog's Tab keydown handler with the elements that can take focus.
 */
export function trapTab(
  event: KeyboardEvent,
  container: HTMLElement | null,
  selector = 'a[href], button:not([disabled])'
) {
  const focusable = container?.querySelectorAll<HTMLElement>(selector);
  if (!focusable?.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
