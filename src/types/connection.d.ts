interface BaseConnection {
  user_id: number;
  oidc_client_id: number;
  organization_id: number | null;
  sp_name: string | null;
  user_ip_address: string | null;
}

interface Connection extends BaseConnection {
  id: number;
  // created_at and updated_at are redundant after 04/03/2023
  // before migration 1680524813673_normalize-connection-counter
  // created_at was used to store the first connection date
  // updated_at was used to store the last connection date
  // merging these columns will result in a data loss
  created_at: Date;
  updated_at: Date;
}
