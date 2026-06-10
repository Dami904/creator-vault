export type ProfileType = "creator" | "organization";

export type UserRole = "admin" | "creator" | "organization";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile_type: ProfileType;
  wallet_address: string | null;
  created_at: string;
}
