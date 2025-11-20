import type {
  AuthenticatorTransportFuture,
  Base64URLString,
  CredentialDeviceType,
} from "@simplewebauthn/server";

interface BaseAuthenticator {
  credential_id: Base64URLString;
  credential_public_key: Uint8Array;
  counter: number;
  // Ex: 'singleDevice' | 'multiDevice'
  credential_device_type: CredentialDeviceType;
  credential_backed_up: boolean;
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransportFuture[];
  display_name: string | null;
  last_used_at: Date | null;
  usage_count: number;
  user_verified: boolean;
}

interface Authenticator extends BaseAuthenticator {
  user_id: number;
  created_at: Date;
}
