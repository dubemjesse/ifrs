export interface UserSession {
  id: number;
  user_id: number;
  session_token: string;
  expires_at: Date;
  created_at: Date;
  last_accessed: Date;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
}

export interface CreateSessionRequest {
  user_id: number;
  ip_address?: string;
  user_agent?: string;
}

export interface SessionResponse {
  id: number;
  expires_at: Date;
  created_at: Date;
  last_accessed: Date;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
}