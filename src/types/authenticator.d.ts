import type { Base64URLString } from "@simplewebauthn/server";
import { CredentialDeviceType } from "@simplewebauthn/typescript-types";

interface BaseAuthenticator {
  credential_id: Base64URLString;
  credential_public_key: Uint8Array;
  counter: number;
  // Ex: 'singleDevice' | 'multiDevice'
  credential_device_type: CredentialDeviceType;
  credential_backed_up: boolean;
  // Ex: ['usb' | 'ble' | 'nfc' | 'internal']
  transports?: AuthenticatorTransport[];
  display_name: string | null;
  last_used_at: Date | null;
  usage_count: number;
  user_verified: boolean;
}

interface Authenticator extends BaseAuthenticator {
  user_id: number;
  created_at: Date;
}

interface SerializedAuthenticator extends Omit<Authenticator, "credential_id"> {
  credential_id: string;
}
