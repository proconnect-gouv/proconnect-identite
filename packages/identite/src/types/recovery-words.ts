export interface BaseRecoveryCode {
  code: string;
  used_at: Date | null;
}

export interface RecoveryCode extends BaseRecoveryCode {
  id: number;
  user_id: number;
  created_at: Date;
}
