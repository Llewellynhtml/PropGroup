export type Platform = 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'pinterest' | 'x';

export type PostType = 'story' | 'reel' | 'post' | 'ad' | 'cover' | 'profile' | 'video' | 'short';

export interface Property {
  id: string;
  title: string;
  price: number;
  city?: string;
  area?: string;
  beds?: number;
  baths?: number;
  parking?: number;
  size?: number;
  listing_type?: 'sale' | 'rent';
  description?: string;
  images?: (string | any)[];
  created_by_id?: string;
  created_by_role?: 'agent' | 'agency' | 'admin';
  agent_id?: string | null;
  agency_id?: string | null;
  status?: 'draft' | 'active' | 'sold' | 'rented' | 'pending' | 'archived';
  featured?: boolean;
  created_at?: string;
  updated_at?: string;

  // Legacy/Compatibility fields
  sqft?: number;
  location?: string;
  location_city?: string;
  location_area?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_size_m2?: number;
  type?: string;
  currency?: string;
  short_description?: string;
  image?: string;
  image_urls?: string[];
  amenities?: any[];
  agent?: string;
}

export interface Agent {
  id: string;
  full_name: string;
  email: string;
  // Primary contact
  cellphone?: string;
  whatsapp_number?: string;
  // Professional (SA-specific)
  job_title?: string;
  ppra_number?: string;           // Property Practitioners Regulatory Authority
  bio?: string;
  specialisation?: string;        // Residential | Commercial | Rentals | Industrial
  areas?: string[];               // e.g. ['Sandton', 'Rosebank']
  // Social
  instagram_url?: string;
  linkedin_url?: string;
  // Assets
  profile_photo_url?: string;
  // Agency relationship
  agency_id: string;
  join_method?: 'code' | 'email_invite' | 'request';
  status?: 'active' | 'pending' | 'inactive';
  created_at?: string;
  // Legacy compatibility fields (mapped from new columns)
  cellphone_number?: string;      // = cellphone
  role_optional?: string;         // = job_title
  license_number?: string;        // = ppra_number
  specialization?: string;        // = specialisation (old spelling)
  office_number_optional?: string;
  bio_optional?: string;
  linkedin_url_optional?: string;
  instagram_url_optional?: string;
}

export interface Agency {
  id: string;
  agency_name: string;
  trading_name?: string;          // DBA short name shown on posts
  email: string;
  office_number?: string;
  // Location (SA-specific)
  province?: string;              // GP | WC | KZN | EC | LP | MP | FS | NW | NC
  city?: string;
  office_address?: string;
  website_url?: string;
  agent_count_range?: string;     // 1-5 | 6-15 | 16-30 | 31+
  logo_url?: string;
  // Agent joining
  join_code?: string;             // e.g. ACME-X7F2
  join_code_expires_at?: string;
  // Freemium plan
  plan?: 'free' | 'growth' | 'scale';
  plan_started_at?: string;
  trial_ends_at?: string;
  plan_agent_limit?: number;
  plan_post_limit?: number;
  plan_platform_limit?: number;
  created_at?: string;
}

export const SA_PROVINCES = [
  { code: 'GP', name: 'Gauteng' },
  { code: 'WC', name: 'Western Cape' },
  { code: 'KZN', name: 'KwaZulu-Natal' },
  { code: 'EC', name: 'Eastern Cape' },
  { code: 'LP', name: 'Limpopo' },
  { code: 'MP', name: 'Mpumalanga' },
  { code: 'FS', name: 'Free State' },
  { code: 'NW', name: 'North West' },
  { code: 'NC', name: 'Northern Cape' },
] as const;

export const PLAN_LIMITS = {
  free:   { agents: 3,   posts: 5,   platforms: 2, label: 'Free',   price: 0 },
  growth: { agents: 15,  posts: 9999, platforms: 6, label: 'Growth', price: 699 },
  scale:  { agents: 9999, posts: 9999, platforms: 6, label: 'Scale',  price: 1899 },
} as const;

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Branding {
  id: string;
  agency_id: string;
  primary_color: string;
  primary_color_hex?: string;
  secondary_color: string;
  secondary_color_hex?: string;
  accent_color_hex?: string;
  background_color_hex?: string;
  logo_url: string;
  watermark_logo_optional_url?: string;
  font_family: string;
  body_font_family?: string;
  heading_font_family?: string;
  company_name: string;
  default_cta_text?: string;
  website_url?: string;
  default_hashtags_optional?: string;
}

export interface HistoryItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  created_at?: string;
  details: string;
  property_title?: string;
  agent_name?: string;
  platform?: string;
  thumbnail_url?: string;
  aspect_ratio?: string;
  style?: string;
  brand_name?: string;
}

export interface PostConfig {
  propertyId?: string;
  agentId?: string;
  platform?: Platform;
  type?: PostType;
  tone?: string;
  contentType?: string;
  brandingId?: string;
  activePreviewPlatform?: string;
  templateId?: string;
  selectedImages?: string[];
  selectedFacts?: string[];
  selectedAmenities?: string[];
  headlineOverride?: string;
  ctaOverride?: string;
  captionOverride?: string;
  subheadlineOverride?: string;
  videoUrl?: string;
  layoutStyle?: 'Modern' | 'Classic' | 'Minimal' | 'Bold' | 'Elegant';
  selectedPlatforms?: string[];
  contactToggles?: { whatsapp?: boolean; cell?: boolean; email?: boolean; photo?: boolean };
  preferences?: any;
}

export interface Template {
  id: string;
  name: string;
  type: PostType;
  preview_url: string;
  platforms: Platform[];
  category?: string;
  description?: string;
  style_theme?: string;
  listing_status?: string;
  is_favorite?: boolean;
  tags?: string;
  version?: number;
  thumbnail_url?: string;
  supported_formats?: string[];
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed' | 'Archived';

export interface Lead {
  id: string;
  propertyId?: string;
  postId?: string;
  agentId?: string;
  source: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  status: LeadStatus;
  message?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  propertyTitle?: string;
  agentName?: string;
  notes?: LeadNote[];
  tasks?: LeadTask[];
}

export interface LeadNote {
  id: string;
  leadId: string;
  agentId: string;
  agentName?: string;
  content: string;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  agentId: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface ScheduledPost {
  id?: string;
  propertyId: string;
  agentId?: string;
  platform?: Platform;
  platforms?: string[];
  type?: PostType;
  caption: string;
  scheduledAt?: string;
  date?: string;
  time?: string;
  status: 'scheduled' | 'published' | 'draft' | 'failed';
  image?: string;
  imageURL?: string;
  videoURL?: string;
  createdAt?: string;
  propertyTitle?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

export type UserRole = 'admin' | 'manager' | 'agent' | 'agency' | 'marketer' | 'developer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  cellphone?: string;
  agency_name?: string;
  office_number?: string;
  city?: string;
  logo_url?: string;
  agency_id?: string;
}