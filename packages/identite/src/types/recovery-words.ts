export interface BaseRecoveryWords {
  hashed_words: string;
}

export interface RecoveryWords extends BaseRecoveryWords {
  id: number;
  user_id: number;
  created_at: Date;
}
