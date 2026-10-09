//

export interface BaseConnection {
  user_id: number;
  oidc_client_id: number;
  organization_id: number | null;
  sp_name: string | null;
  user_ip_address: string | null;
}

export interface Connection extends BaseConnection {
  id: number;
  created_at: Date;
  updated_at: Date;
}
