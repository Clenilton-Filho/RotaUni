import { Alert } from 'react-native';

export type ConfirmButtonStyle = 'default' | 'cancel' | 'destructive';

export type ConfirmButton = {
  text: string;
  style?: ConfirmButtonStyle;
  onPress?: () => void;
};

/**
 * Native (Android): renders the standard system dialog via Alert.alert.
 * Web behavior is provided by confirm-alert.web.tsx.
 */
export function confirmAlert(title: string, message: string, buttons: ConfirmButton[]) {
  Alert.alert(title, message, buttons);
}
