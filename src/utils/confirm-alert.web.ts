import type { ConfirmButton } from './confirm-alert';

/**
 * Web: react-native-web's Alert.alert is a no-op, so confirmations that gate
 * destructive actions (logout, data reset, booking cancel) would silently do
 * nothing. Uses the browser's native confirm dialog to preserve the same
 * flows; native keeps the system Alert dialog (confirm-alert.ts).
 */
export function confirmAlert(title: string, message: string, buttons: ConfirmButton[]) {
  if (buttons.length === 0) {
    window.alert([title, message].filter(Boolean).join('\n'));
    return;
  }

  const confirmed = window.confirm([title, message].filter(Boolean).join('\n\n'));

  const confirmButton = buttons.find((button) => button.style !== 'cancel');
  const cancelButton = buttons.find((button) => button.style === 'cancel');
  const chosen = confirmed ? confirmButton : cancelButton;

  chosen?.onPress?.();
}
