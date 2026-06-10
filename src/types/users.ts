export interface CreatorProfile {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  profile_picture_url: string | null;
  niche_tags: string[];
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
  reputation_score: number;
  wallet_balance: string;
}

export interface OrgProfile {
  id: string;
  user_id: string;
  brand_name: string;
  description: string;
  profile_picture_url: string | null;
  website_url: string;
  reputation_score: number;
  wallet_balance: string;
}
