import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Linkedin, Facebook, Instagram, Youtube, Twitter,
  Download, ChevronRight, Maximize2,
  Minimize2, Check, Layers, Monitor, Smartphone, Square,
  Play, Image as ImageIcon, MapPin, Bed, Bath,
  Car, Maximize, Video, Info, Database, Layers as LayersIcon,
  PlusSquare, Layout
} from 'lucide-react';
import { Property, Agent, Branding } from '../types';
import { formatCurrency } from '../utils/format';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TemplateFormat {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  type: 'post' | 'story' | 'video' | 'reel' | 'short' | 'pin' | 'cover';
  icon: React.ReactNode;
  description: string;
}

export interface PlatformDef {
  id: string;
  name: string;
  color: string;
  gradient: string;
  lightColor: string;
  brandColor: string;
  textColor: string;
  icon: React.ReactNode;
  formats: TemplateFormat[];
}

export interface TemplateDesign {
  id: string;
  name: string;
  style: 'modern' | 'luxury' | 'minimal' | 'bold' | 'editorial';
  description: string;
}

interface SocialMediaTemplatesProps {
  property?: Property;
  agent?: Agent;
  branding?: Branding;
  onCreatePost?: (platformId: string, formatId: string, designId: string) => void;
}

// ─── Platform Definitions ────────────────────────────────────────────────────
export const PLATFORMS: PlatformDef[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #0c5fd4 100%)',
    lightColor: '#ECF3FF',
    brandColor: '#1877F2',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    formats: [
      { id: 'facebook_post', name: 'Post', width: 1200, height: 630, aspectRatio: '1.91:1', type: 'post', icon: <Monitor size={14}/>, description: 'Landscape post for news feed' },
      { id: 'facebook_story', name: 'Story', width: 1080, height: 1920, aspectRatio: '9:16', type: 'story', icon: <Smartphone size={14}/>, description: 'Full-screen story format' },
      { id: 'facebook_video', name: 'Video', width: 1080, height: 1080, aspectRatio: '1:1', type: 'video', icon: <Square size={14}/>, description: 'Square video thumbnail' },
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    gradient: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
    lightColor: '#FFF0F5',
    brandColor: '#E1306C',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22">
        <defs>
          <linearGradient id="ig-grad-new" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#f09433', stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: '#e6683c', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#dc2743', stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: '#cc2366', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#bc1888', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <rect width="20" height="20" x="2" y="2" rx="5" fill="url(#ig-grad-new)" />
        <rect width="10" height="10" x="7" y="7" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.5" fill="none" />
        <circle cx="17.5" cy="6.5" r="1" fill="white" />
      </svg>
    ),
    formats: [
      { id: 'instagram_post', name: 'Post', width: 1080, height: 1350, aspectRatio: '4:5', type: 'post', icon: <ImageIcon size={14}/>, description: '4:5 portrait for more feed real estate' },
      { id: 'instagram_reel', name: 'Reels', width: 1080, height: 1920, aspectRatio: '9:16', type: 'reel', icon: <Play size={14}/>, description: 'Full vertical for Reels' },
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    gradient: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
    lightColor: '#EBF4FA',
    brandColor: '#0A66C2',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="#0A66C2" d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003zM7.12 20.452H3.558V9h3.562v11.452zM5.339 7.433a2.062 2.062 0 110-4.124 2.062 2.062 0 010 4.124zM20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z"/>
      </svg>
    ),
    formats: [
      { id: 'linkedin_post', name: 'Post', width: 1200, height: 1200, aspectRatio: '1:1', type: 'post', icon: <Square size={14}/>, description: 'Square post for maximum feed visibility' },
      { id: 'linkedin_story', name: 'Story', width: 1080, height: 1920, aspectRatio: '9:16', type: 'story', icon: <Smartphone size={14}/>, description: 'Vertical story format' },
      { id: 'linkedin_video', name: 'Video', width: 1080, height: 1920, aspectRatio: '9:16', type: 'video', icon: <Video size={14}/>, description: 'Vertical video cover' },
    ]
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    gradient: 'linear-gradient(135deg, #E60023 0%, #ad081b 100%)',
    lightColor: '#FDECEC',
    brandColor: '#E60023',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="#E60023" d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.771-2.25 3.771-5.496 0-2.873-2.065-4.882-5.013-4.882-3.414 0-5.419 2.561-5.419 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
      </svg>
    ),
    formats: [
      { id: 'pinterest_pin', name: 'Pin', width: 1000, height: 1500, aspectRatio: '2:3', type: 'pin', icon: <ImageIcon size={14}/>, description: '2:3 standard pin format' },
    ]
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#010101',
    gradient: 'linear-gradient(135deg, #010101 0%, #333 100%)',
    lightColor: '#F2EBFF',
    brandColor: '#8B5CF6',
    textColor: '#fff',
    icon: (
      <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="#25F4EE" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17h.01c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.776 8.776 0 01-1.87-1.41c-.02 3.83 0 7.66-.01 11.49-.15 1.28-.66 2.51-1.53 3.45-1.55 1.78-4.11 2.45-6.36 1.83-2.31-.6-4.2-2.73-4.52-5.06-.39-2.33.8-4.87 2.89-5.9 1-.53 2.14-.73 3.28-.66v4.03a4.72 4.72 0 00-2.22 1.35c-.9 1-1.09 2.5-.47 3.67.63 1.23 2.08 1.95 3.47 1.69 1.34-.23 2.38-1.5 2.47-2.86.04-1.3 0-2.6 0-3.9V0h1.36z" transform="translate(-0.5, -0.5)" />
          <path fill="#FE2C55" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17h.01c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.776 8.776 0 01-1.87-1.41c-.02 3.83 0 7.66-.01 11.49-.15 1.28-.66 2.51-1.53 3.45-1.55 1.78-4.11 2.45-6.36 1.83-2.31-.6-4.2-2.73-4.52-5.06-.39-2.33.8-4.87 2.89-5.9 1-.53 2.14-.73 3.28-.66v4.03a4.72 4.72 0 00-2.22 1.35c-.9 1-1.09 2.5-.47 3.67.63 1.23 2.08 1.95 3.47 1.69 1.34-.23 2.38-1.5 2.47-2.86.04-1.3 0-2.6 0-3.9V0h1.36z" transform="translate(0.5, 0.5)" />
          <path fill="#FFF" d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17h.01c1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.776 8.776 0 01-1.87-1.41c-.02 3.83 0 7.66-.01 11.49-.15 1.28-.66 2.51-1.53 3.45-1.55 1.78-4.11 2.45-6.36 1.83-2.31-.6-4.2-2.73-4.52-5.06-.39-2.33.8-4.87 2.89-5.9 1-.53 2.14-.73 3.28-.66v4.03a4.72 4.72 0 00-2.22 1.35c-.9 1-1.09 2.5-.47 3.67.63 1.23 2.08 1.95 3.47 1.69 1.34-.23 2.38-1.5 2.47-2.86.04-1.3 0-2.6 0-3.9V0h1.36z"/>
        </svg>
      </div>
    ),
    formats: [

      { id: 'tiktok_video', name: 'Video', width: 1080, height: 1920, aspectRatio: '9:16', type: 'video', icon: <Smartphone size={14}/>, description: 'Full vertical video cover' },
    ]
  },
  {
    id: 'x',
    name: 'Twitter',
    color: '#000000',
    gradient: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
    lightColor: '#F5F8FA',
    brandColor: '#000000',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    formats: [
      { id: 'x_post', name: 'Post Image', width: 1600, height: 900, aspectRatio: '16:9', type: 'post', icon: <Monitor size={14}/>, description: '16:9 image post' },
      { id: 'x_video', name: 'Video', width: 1600, height: 900, aspectRatio: '16:9', type: 'video', icon: <Video size={14}/>, description: '16:9 video thumbnail' },
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    gradient: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
    lightColor: '#FFF0F0',
    brandColor: '#FF0000',
    textColor: '#fff',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24">
        <path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
        <path fill="#FFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    formats: [
      { id: 'youtube_thumbnail', name: 'Thumbnail', width: 1920, height: 1080, aspectRatio: '16:9', type: 'cover', icon: <Monitor size={14}/>, description: '16:9 thumbnail / video cover' },
      { id: 'youtube_short', name: 'Shorts', width: 1080, height: 1920, aspectRatio: '9:16', type: 'short', icon: <Smartphone size={14}/>, description: 'Vertical Shorts format' },
    ]
  },
];

export const DESIGNS: TemplateDesign[] = [
  { id: 'modern', name: 'Modern', style: 'modern', description: 'Clean lines, bold typography, striking contrast' },
  { id: 'luxury', name: 'Luxury', style: 'luxury', description: 'Gold accents, dark palette, premium feel' },
  { id: 'minimal', name: 'Minimal', style: 'minimal', description: 'White space, subtle details, refined elegance' },
  { id: 'bold', name: 'Bold', style: 'bold', description: 'High impact, saturated colors, strong CTAs' },
  { id: 'editorial', name: 'Editorial', style: 'editorial', description: 'Magazine-style, typographic, sophisticated' },
];

// ─── Sample Data ─────────────────────────────────────────────────────────────

const SAMPLE_PROPERTY: Property = {
  id: 'demo',
  title: 'Clifton Beachfront Villa',
  price: 28500000,
  city: 'Cape Town',
  area: 'Clifton',
  beds: 5,
  baths: 4,
  parking: 3,
  size: 620,
  listing_type: 'sale',
  description: 'Breathtaking unobstructed ocean views from every room. This architectural masterpiece blends indoor and outdoor living seamlessly.',
  images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'],
  status: 'active',
  currency: 'ZAR',
};

const SAMPLE_AGENT: Agent = {
  id: 'demo-agent',
  full_name: 'Samantha van der Berg',
  email: 'samantha@proppost.co.za',
  cellphone: '+27 82 456 7890',
  profile_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
  role_optional: 'Senior Property Specialist',
  agency_id: 'demo-agency',
};

const SAMPLE_BRANDING: Branding = {
  id: 'demo-brand',
  agency_id: 'demo-agency',
  primary_color: '#1E3A5F',
  primary_color_hex: '#1E3A5F',
  secondary_color: '#C9A84C',
  secondary_color_hex: '#C9A84C',
  accent_color_hex: '#E8F4F8',
  background_color_hex: '#FAFAFA',
  logo_url: '',
  font_family: 'Georgia, serif',
  company_name: 'PropPost Realty',
  default_cta_text: 'WhatsApp to View',
  website_url: 'www.proppost.co.za',
  default_hashtags_optional: '#realestate #capetown #luxuryliving',
};

// ─── Helper: Scale canvas to preview container ───────────────────────────────

export function getScaledDimensions(format: TemplateFormat, maxW: number, maxH?: number) {
  const { width, height } = format;
  const targetH = maxH || maxW;
  const scaleW = maxW / width;
  const scaleH = targetH / height;
  const scale = Math.min(scaleW, scaleH);
  return { 
    width: width * scale, 
    height: height * scale, 
    scale 
  };
}

// ─── Template Renderer ────────────────────────────────────────────────────────

export interface TemplateRendererProps {
  format: TemplateFormat;
  platform: PlatformDef;
  design: TemplateDesign;
  property: Property;
  agent?: Agent;
  branding?: Branding;
  scale?: number;
  onElementClick?: (data: { label: string; field: string; value: any; source: string }) => void;
  activeElementField?: string | null;
  styleOverrides?: Record<string, React.CSSProperties>;
  showMappingLabels?: boolean;
  isThumbnail?: boolean;
}

export function TemplateRenderer({ 
  format, platform, design, property, agent: agentProp, branding: brandingProp, 
  scale = 1, onElementClick, activeElementField, styleOverrides = {},
  showMappingLabels = false, isThumbnail = false
}: TemplateRendererProps) {
  const branding = brandingProp || SAMPLE_BRANDING;
  const agent = agentProp || SAMPLE_AGENT;

  const W = format.width;
  const H = format.height;
  const isVertical = H > W;
  const isSquare = W === H;
  const isWide = W > H;

  // Interactive element wrapper
  const DataElement = ({ 
    label, field, source, value, children, style = {} 
  }: { 
    label: string, field: string, source: string, value: any, children: React.ReactNode, style?: React.CSSProperties 
  }) => {
    const isActive = activeElementField === field;
    const globalOverride = styleOverrides[field] || {};
    
    // Inject globalOverride into children to ensure visual update when adjusting styling
    const injectedChildren = React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          style: {
            ...((child.props as any).style || {}),
            ...globalOverride
          }
        });
      }
      return child;
    });

    return (
      <div 
        onClick={() => onElementClick?.({ label, field, value, source })}
        style={{
          ...style,
          cursor: 'pointer',
          border: isActive ? `2px solid #C9A84C` : (showMappingLabels ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'),
          borderRadius: 4,
          padding: isActive ? 2 : (style.padding || 0),
          backgroundColor: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
          position: 'relative',
          transition: 'all 0.2s',
          boxSizing: 'border-box',
          minWidth: showMappingLabels ? 40 : 'auto',
          minHeight: showMappingLabels ? 10 : 'auto',
        }}
        title={`Source: ${source}.${field}`}
      >
        {showMappingLabels ? (
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px dashed rgba(255,255,255,0.2)',
            borderRadius: 4,
            padding: '2px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 16,
          }}>
            <span style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: isThumbnail ? Math.max(18, W * 0.04) : Math.max(10, W * 0.022),
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}>
              {label}
            </span>
          </div>
        ) : injectedChildren}
        {isActive && (
          <div style={{
            position: 'absolute',
            top: -24,
            left: 0,
            backgroundColor: '#C9A84C',
            color: '#000',
            fontSize: Math.max(10, W * 0.024),
            padding: '2px 8px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
            zIndex: 100,
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}>
            {label}
          </div>
        )}
      </div>
    );
  };

  const primary = branding.primary_color_hex || branding.primary_color || '#1E3A5F';
  const gold = branding.secondary_color_hex || branding.secondary_color || '#C9A84C';
  const company = branding.company_name || 'PropPost Realty';
  const cta = branding.default_cta_text || 'WhatsApp to View';
  const website = branding.website_url || 'www.proppost.co.za';

  const propTitle = property.title || 'Stunning Property';
  const propPrice = formatCurrency(property.price || 0, property.currency || 'USD');
  const propCity = property.city || property.location_city || 'Cape Town';
  const propArea = property.area || property.location_area || '';
  const propBeds = property.beds || property.bedrooms || 0;
  const propBaths = property.baths || property.bathrooms || 0;
  const propSize = property.size || property.floor_size_m2 || 0;
  const propParking = property.parking || 0;
  const propImage = (property.images && property.images[0]) ? String(property.images[0]) : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80';
  const agentName = agent.full_name || 'Agent Name';
  const agentRole = agent.role_optional || 'Property Specialist';
  const agentPhone = agent.cellphone || agent.cellphone_number || '+27 82 000 0000';
  const agentPhoto = agent.profile_photo_url || '';
  const hashtags = branding.default_hashtags_optional || '#realestate #property';

  const styles: Record<string, React.CSSProperties> = {
    modern: {
      '--bg': '#0F172A',
      '--surface': primary,
      '--text': '#FFFFFF',
      '--accent': gold,
      '--muted': 'rgba(255,255,255,0.6)',
      '--overlay': 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.9) 100%)',
    } as any,
    luxury: {
      '--bg': '#0A0A0A',
      '--surface': '#111111',
      '--text': '#F5E6C8',
      '--accent': '#C9A84C',
      '--muted': 'rgba(245,230,200,0.5)',
      '--overlay': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.92) 100%)',
    } as any,
    minimal: {
      '--bg': '#FAFAFA',
      '--surface': '#FFFFFF',
      '--text': '#111827',
      '--accent': primary,
      '--muted': '#6B7280',
      '--overlay': 'linear-gradient(180deg, rgba(250,250,250,0) 0%, rgba(250,250,250,0.95) 70%)',
    } as any,
    bold: {
      '--bg': primary,
      '--surface': gold,
      '--text': '#FFFFFF',
      '--accent': '#FFFFFF',
      '--muted': 'rgba(255,255,255,0.7)',
      '--overlay': 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.85) 100%)',
    } as any,
    editorial: {
      '--bg': '#F8F5F0',
      '--surface': '#1A1A1A',
      '--text': '#1A1A1A',
      '--accent': '#C41E3A',
      '--muted': '#6B6B6B',
      '--overlay': 'linear-gradient(180deg, rgba(248,245,240,0) 0%, rgba(248,245,240,0.97) 65%)',
    } as any,
  };

  const s = styles[design.style];
  const isDark = ['modern', 'luxury', 'bold'].includes(design.style);

  const containerStyle: React.CSSProperties = {
    ...s,
    width: W,
    height: H,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: branding.heading_font_family || 'Georgia, serif',
    flexShrink: 0,
    backgroundColor: (s as any)['--bg']
  };

  // Render based on orientation and design
  if (isVertical || isSquare) {
    return (
      <div style={containerStyle}>
        {/* Background Image */}
        {showMappingLabels ? (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: '#1A1D23',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ImageIcon size={isThumbnail ? W * 0.35 : W * 0.15} color="rgba(255,255,255,0.05)" />
            <div style={{
              position: 'absolute',
              color: 'rgba(255,255,255,0.1)',
              fontSize: isThumbnail ? W * 0.1 : W * 0.04,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em'
            }}>IMAGE</div>
          </div>
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${propImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        )}

        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: (s as any)['--overlay'],
        }} />

        {/* Layout divider or top bar color */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: `${H * 0.03}px ${W * 0.05}px`,
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
        }}>
          <DataElement label="Agency Name" field="company_name" source="Branding" value={company}>
            <div style={{
              color: (s as any)['--accent'],
              fontSize: W * 0.035,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              {company}
            </div>
          </DataElement>
          <DataElement label="Listing Type" field="listing_type" source="Property" value={property.listing_type}>
            <div style={{
              backgroundColor: (s as any)['--accent'],
              color: isDark ? '#000' : '#fff',
              padding: `${H * 0.008}px ${W * 0.035}px`,
              borderRadius: W * 0.02,
              fontSize: W * 0.026,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
            </div>
          </DataElement>
        </div>

        {/* Platform badge */}
        <div style={{
          position: 'absolute',
          top: H * 0.1,
          right: W * 0.05,
          backgroundImage: platform.gradient,
          borderRadius: '50%',
          width: W * 0.1,
          height: W * 0.1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: W * 0.045,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {platform.icon}
        </div>

        {/* Content bottom */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          padding: `${H * 0.04}px ${W * 0.06}px ${H * 0.04}px`,
        }}>
          {/* Location */}
          <DataElement label="Location" field="city" source="Property" value={`${propArea}, ${propCity}`}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: W * 0.015,
              color: (s as any)['--accent'],
              fontSize: W * 0.03,
              marginBottom: H * 0.01,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
            }}>
              <MapPin size={W * 0.03} />
              {propArea}{propArea && propCity ? ', ' : ''}{propCity}
            </div>
          </DataElement>

          {/* Title */}
          <DataElement label="Title" field="title" source="Property" value={propTitle}>
            <div style={{
              color: isDark ? '#fff' : (s as any)['--text'],
              fontSize: W * 0.062,
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: H * 0.015,
              letterSpacing: '-0.01em',
            }}>
              {propTitle}
            </div>
          </DataElement>

          {/* Price */}
          <DataElement label="Price" field="price" source="Property" value={propPrice}>
            <div style={{
              color: (s as any)['--accent'],
              fontSize: W * 0.075,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: H * 0.02,
            }}>
              {propPrice}
            </div>
          </DataElement>

          {/* Stats row */}
          <DataElement label="Property Features" field="features" source="Property" value="Multiple Fields">
            <div style={{
              display: 'flex', gap: W * 0.04,
              marginBottom: H * 0.025,
              flexWrap: 'wrap',
            }}>
              {[
                { icon: <Bed size={W * 0.028}/>, val: `${propBeds} Beds` },
                { icon: <Bath size={W * 0.028}/>, val: `${propBaths} Baths` },
                { icon: <Car size={W * 0.028}/>, val: `${propParking} Parking` },
                { icon: <Maximize size={W * 0.028}/>, val: `${propSize}m²` },
              ].filter(x => x.val.replace(/[^0-9]/g,'') !== '0').map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: W * 0.01,
                  color: isDark ? 'rgba(255,255,255,0.85)' : (s as any)['--muted'],
                  fontSize: W * 0.028,
                  fontWeight: 500,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                  padding: `${H * 0.008}px ${W * 0.025}px`,
                  borderRadius: W * 0.015,
                }}>
                  {item.icon} {item.val}
                </div>
              ))}
            </div>
          </DataElement>

          {/* Divider */}
          <div style={{
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            marginBottom: H * 0.02,
          }} />

          {/* Agent row */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <DataElement label="Agent Profile" field="agent" source="Agent" value={`${agentName}, ${agentRole}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: W * 0.025 }}>
                {agentPhoto && (
                  <div style={{
                    width: W * 0.1, height: W * 0.1,
                    borderRadius: '50%',
                    backgroundColor: showMappingLabels ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: `${W * 0.005}px solid ${(s as any)['--accent']}`,
                    overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {showMappingLabels ? (
                      <span style={{ fontSize: isThumbnail ? 32 : 12, color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PIC</span>
                    ) : (
                      <img src={agentPhoto} alt={agentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                )}
                <div>
                  <div style={{
                    color: isDark ? '#fff' : (s as any)['--text'],
                    fontSize: W * 0.03,
                    fontWeight: 600,
                  }}>{agentName}</div>
                  <div style={{
                    color: (s as any)['--accent'],
                    fontSize: W * 0.025,
                  }}>{agentRole}</div>
                </div>
              </div>
            </DataElement>
            <DataElement label="Call To Action" field="default_cta_text" source="Branding" value={cta}>
              <div style={{
                backgroundColor: (s as any)['--accent'],
                color: isDark && design.style !== 'minimal' ? '#000' : '#fff',
                padding: `${H * 0.012}px ${W * 0.04}px`,
                borderRadius: W * 0.025,
                fontSize: W * 0.028,
                fontWeight: 700,
                textAlign: 'center',
                lineHeight: 1.2,
              }}>
                {cta}
              </div>
            </DataElement>
          </div>

          {/* Website + Hashtags */}
          <div style={{
            marginTop: H * 0.015,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <DataElement label="Website" field="website_url" source="Branding" value={website}>
              <div style={{ color: (s as any)['--muted'], fontSize: W * 0.022 }}>{website}</div>
            </DataElement>
            <DataElement label="Hashtags" field="default_hashtags_optional" source="Branding" value={hashtags}>
              <div style={{ color: (s as any)['--muted'], fontSize: W * 0.022 }}>{hashtags}</div>
            </DataElement>
          </div>
        </div>
      </div>
    );
  }

  // Wide / Landscape layout (Facebook post, YouTube thumbnail, X/Twitter)
  return (
    <div style={containerStyle}>
      {/* Left: Image */}
      <div style={{
        position: 'absolute',
        left: 0, top: 0, bottom: 0,
        width: isWide ? '55%' : '50%',
        backgroundColor: showMappingLabels ? '#1A1D23' : 'transparent',
        backgroundImage: showMappingLabels ? 'none' : `url(${propImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: showMappingLabels ? 'flex' : 'block',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {showMappingLabels && <ImageIcon size={isThumbnail ? H * 0.3 : H * 0.15} color="rgba(255,255,255,0.05)" />}
        {showMappingLabels && (
          <div style={{
            position: 'absolute',
            color: 'rgba(255,255,255,0.07)',
            fontSize: isThumbnail ? H * 0.12 : H * 0.05,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.2em'
          }}>IMAGE</div>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(90deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)',
        }} />
        {/* For Sale badge */}
          <DataElement label="Listing Type" field="listing_type" source="Property" value={property.listing_type}>
            <div style={{
              position: 'absolute', top: H * 0.06, left: W * 0.03,
              backgroundColor: (s as any)['--accent'],
              color: isDark ? '#000' : '#fff',
              padding: `${H * 0.022}px ${W * 0.025}px`,
            fontSize: H * 0.042,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            borderRadius: H * 0.025,
          }}>
            {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
          </div>
        </DataElement>
      </div>

      {/* Right: Content */}
      <div style={{
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        width: isWide ? '48%' : '52%',
        backgroundColor: isDark ? (s as any)['--bg'] : (s as any)['--surface'],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `${H * 0.06}px ${W * 0.04}px`,
      }}>
        {/* Company */}
        <DataElement label="Agency Name" field="company_name" source="Branding" value={company}>
          <div style={{
            color: (s as any)['--accent'],
            fontSize: H * 0.038,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: H * 0.02,
          }}>{company}</div>
        </DataElement>

        {/* Location */}
        <DataElement label="Location" field="city" source="Property" value={`${propArea}, ${propCity}`}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: W * 0.008,
            color: (s as any)['--muted'],
            fontSize: H * 0.04,
            marginBottom: H * 0.015,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            <MapPin size={H * 0.038} />
            {propArea}{propArea && propCity ? ', ' : ''}{propCity}
          </div>
        </DataElement>

        {/* Title */}
        <DataElement label="Title" field="title" source="Property" value={propTitle}>
          <div style={{
            color: isDark ? '#fff' : (s as any)['--text'],
            fontSize: H * 0.075,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: H * 0.02,
            letterSpacing: '-0.02em',
          }}>{propTitle}</div>
        </DataElement>

        {/* Price */}
        <DataElement label="Price" field="price" source="Property" value={propPrice}>
          <div style={{
            color: (s as any)['--accent'],
            fontSize: H * 0.085,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: H * 0.025,
          }}>{propPrice}</div>
        </DataElement>

        {/* Stats */}
        <DataElement label="Property Features" field="features" source="Property" value="Multiple Fields">
          <div style={{ display: 'flex', gap: W * 0.02, marginBottom: H * 0.03, flexWrap: 'wrap' }}>
            {[
              { icon: <Bed size={H * 0.035}/>, val: `${propBeds} Beds` },
              { icon: <Bath size={H * 0.035}/>, val: `${propBaths} Baths` },
              { icon: <Maximize size={H * 0.035}/>, val: `${propSize}m²` },
            ].filter(x => x.val.replace(/[^0-9]/g,'') !== '0').map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: W * 0.008,
                color: isDark ? 'rgba(255,255,255,0.8)' : (s as any)['--muted'],
                fontSize: H * 0.04,
                fontWeight: 500,
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                padding: `${H * 0.015}px ${W * 0.02}px`,
                borderRadius: H * 0.02,
              }}>
                {item.icon} {item.val}
              </div>
            ))}
          </div>
        </DataElement>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)', marginBottom: H * 0.025 }} />

        {/* Agent + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <DataElement label="Agent Profile" field="agent" source="Agent" value={`${agentName}, ${agentPhone}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: W * 0.015 }}>
              {agentPhoto && (
                <div style={{
                  width: H * 0.12, height: H * 0.12, borderRadius: '50%',
                  backgroundColor: showMappingLabels ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `${H * 0.008}px solid ${(s as any)['--accent']}`,
                  overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {showMappingLabels ? (
                    <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PIC</span>
                  ) : (
                    <img src={agentPhoto} alt={agentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}
              <div>
                <div style={{ color: isDark ? '#fff' : (s as any)['--text'], fontSize: H * 0.042, fontWeight: 600 }}>{agentName}</div>
                <div style={{ color: (s as any)['--accent'], fontSize: H * 0.035 }}>{agentPhone}</div>
              </div>
            </div>
          </DataElement>
          <DataElement label="Call To Action" field="default_cta_text" source="Branding" value={cta}>
            <div style={{
              backgroundColor: (s as any)['--accent'],
              color: design.style === 'minimal' ? '#fff' : (isDark ? '#000' : '#fff'),
              padding: `${H * 0.025}px ${W * 0.025}px`,
              borderRadius: H * 0.025,
              fontSize: H * 0.04,
              fontWeight: 700,
              textAlign: 'center',
            }}>{cta}</div>
          </DataElement>
        </div>

        {/* Footer */}
        <div style={{ marginTop: H * 0.025, display: 'flex', gap: 12 }}>
          <DataElement label="Website" field="website_url" source="Branding" value={website}>
            <div style={{ color: (s as any)['--muted'], fontSize: H * 0.03 }}>{website}</div>
          </DataElement>
          <span style={{ color: (s as any)['--muted'], fontSize: H * 0.03 }}>·</span>
          <DataElement label="Hashtags" field="default_hashtags_optional" source="Branding" value={hashtags}>
            <div style={{ color: (s as any)['--muted'], fontSize: H * 0.03 }}>{hashtags}</div>
          </DataElement>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SocialMediaTemplates({ property, agent, branding, onCreatePost }: SocialMediaTemplatesProps) {
  const prop = property || SAMPLE_PROPERTY;
  const agt = agent || SAMPLE_AGENT;
  const brand = branding || SAMPLE_BRANDING;

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef>(PLATFORMS[0]);
  const [selectedFormat, setSelectedFormat] = useState<TemplateFormat>(PLATFORMS[0].formats[0]);
  const [selectedDesign, setSelectedDesign] = useState<TemplateDesign>(DESIGNS[0]);
  const [fullscreen, setFullscreen] = useState(false);
  const [showBlueprints, setShowBlueprints] = useState(true);
  const [activeElement, setActiveElement] = useState<{ label: string; field: string; value: any; source: string } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePlatformSelect = (p: PlatformDef) => {
    setSelectedPlatform(p);
    setSelectedFormat(p.formats[0]);
  };

  const { width: previewW, height: previewH, scale } = getScaledDimensions(
    selectedFormat,
    fullscreen ? window.innerWidth * 0.7 : 520,
    fullscreen ? window.innerHeight * 0.85 : 560
  );

  const allFormats = PLATFORMS.flatMap(p => p.formats.map(f => ({ ...f, platformId: p.id, platform: p })));

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0D1117',
      color: '#E6EDF3',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.6; transform: scale(0.98); }
            50% { opacity: 1; transform: scale(1); }
            100% { opacity: 0.6; transform: scale(0.98); }
          }
        `}
      </style>
      {/* Header */}
      <div style={{
        padding: '28px 32px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(13,17,23,0.8)',
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Layers size={22} color="#C9A84C" />
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
                Social Media Templates
              </h1>
            </div>
            <p style={{ margin: 0, color: 'rgba(230,237,243,0.5)', fontSize: 13 }}>
              {allFormats.length} formats across {PLATFORMS.length} platforms · Live preview with your property data
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowBlueprints(!showBlueprints)}
              style={{
                backgroundColor: showBlueprints ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.07)',
                border: showBlueprints ? '1px solid #C9A84C' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: showBlueprints ? '#C9A84C' : '#E6EDF3',
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Layout size={14}/>
              {showBlueprints ? 'Blueprint View: ON' : 'Blueprint View: OFF'}
            </button>
            <button
              onClick={() => onCreatePost?.(selectedPlatform.id, selectedFormat.id, selectedDesign.id)}
              style={{
                backgroundColor: '#C9A84C',
                border: '1px solid #C9A84C',
                borderRadius: 8,
                color: '#000',
                padding: '8px 20px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 4px 15px rgba(201,168,76,0.3)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <PlusSquare size={16}/>
              Create Post
            </button>
            <button
              onClick={() => setFullscreen(!fullscreen)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#E6EDF3',
                padding: '8px 16px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 13,
              }}
            >
              {fullscreen ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}
              {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* LEFT PANEL */}
        <div style={{
          width: fullscreen ? 260 : 280,
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Platforms */}
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(230,237,243,0.4)', marginBottom: 10 }}>
              Platform
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {PLATFORMS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePlatformSelect(p)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: selectedPlatform.id === p.id ? `1px solid ${p.color}40` : '1px solid transparent',
                    backgroundColor: selectedPlatform.id === p.id ? `${p.color}20` : 'transparent',
                    color: selectedPlatform.id === p.id ? '#fff' : 'rgba(230,237,243,0.65)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    fontSize: 13,
                    fontWeight: selectedPlatform.id === p.id ? 600 : 400,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 28, height: 28, borderRadius: 6,
                      backgroundImage: p.gradient,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 14, flexShrink: 0,
                    }}>{p.icon}</span>
                    {p.name}
                  </div>
                  <span style={{
                    fontSize: 11, backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '2px 6px', borderRadius: 4, color: 'rgba(255,255,255,0.5)',
                  }}>{p.formats.length}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(230,237,243,0.4)', marginBottom: 10 }}>
              Format
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {selectedPlatform.formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: selectedFormat.id === f.id ? `1px solid rgba(201,168,76,0.4)` : '1px solid rgba(255,255,255,0.07)',
                    backgroundColor: selectedFormat.id === f.id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)',
                    color: selectedFormat.id === f.id ? '#C9A84C' : 'rgba(230,237,243,0.65)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {f.icon}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(230,237,243,0.4)' }}>{f.width} × {f.height}px</div>
                    </div>
                  </div>
                  {selectedFormat.id === f.id && <Check size={14} color="#C9A84C" />}
                </button>
              ))}
            </div>
          </div>

          {/* Design Styles */}
          <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(230,237,243,0.4)', marginBottom: 10 }}>
              Design Style
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {DESIGNS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDesign(d)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: selectedDesign.id === d.id ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    backgroundColor: selectedDesign.id === d.id ? 'rgba(201,168,76,0.1)' : 'rgba(255,255,255,0.03)',
                    color: selectedDesign.id === d.id ? '#fff' : 'rgba(230,237,243,0.65)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(230,237,243,0.4)', lineHeight: 1.4 }}>{d.description}</div>
                  </div>
                  {selectedDesign.id === d.id && <Check size={14} color="#C9A84C" style={{flexShrink:0, marginTop:2}} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN PREVIEW */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          backgroundImage: 'radial-gradient(ellipse at center, #161B22 0%, #0D1117 100%)',
          overflow: 'auto',
          position: 'relative',
        }}>
          {/* Format info bar */}
          <div style={{
            marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '10px 18px',
          }}>
            <span style={{
              backgroundImage: selectedPlatform.gradient,
              borderRadius: 6,
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, flexShrink: 0,
            }}>{selectedPlatform.icon}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedPlatform.name} · {selectedFormat.name}</span>
              <span style={{ color: 'rgba(230,237,243,0.4)', fontSize: 12, marginLeft: 8 }}>
                {selectedFormat.width} × {selectedFormat.height}px · {selectedDesign.name}
              </span>
            </div>
            {!activeElement && (
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: 6, 
                backgroundColor: 'rgba(201,168,76,0.15)', padding: '4px 10px', 
                borderRadius: 6, color: '#C9A84C', fontSize: 11, fontWeight: 700,
                border: '1px solid rgba(201,168,76,0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <Info size={12} />
                CLICK ELEMENTS TO INSPECT DATA
              </div>
            )}
          </div>

          {/* Template Preview */}
          <motion.div
            key={`${selectedFormat.id}-${selectedDesign.id}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            ref={previewRef}
            style={{
              width: previewW,
              height: previewH,
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}
          >
            <TemplateRenderer
              format={selectedFormat}
              platform={selectedPlatform}
              design={selectedDesign}
              property={prop}
              agent={agt}
              branding={brand}
              scale={scale}
              onElementClick={setActiveElement}
              activeElementField={activeElement?.field}
              showMappingLabels={showBlueprints}
            />
          </motion.div>

          {/* Data Inspector Overlay */}
          <AnimatePresence>
            {activeElement && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#1C2128',
                  border: '1px solid rgba(201,168,76,0.5)',
                  borderRadius: 16,
                  padding: '16px 24px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  zIndex: 200,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  minWidth: 400,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  backgroundColor: 'rgba(201,168,76,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#C9A84C', flexShrink: 0,
                }}>
                  <Database size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#F0F6FC' }}>{activeElement.label}</span>
                    <span style={{ fontSize: 10, color: '#C9A84C', border: '1px solid #C9A84C30', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>{activeElement.source}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(230,237,243,0.5)', marginBottom: 4 }}>
                    Database field: <code style={{ color: '#E6EDF3', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1px 4px', borderRadius: 3 }}>{activeElement.field}</code>
                  </div>
                  <div style={{ fontSize: 13, color: '#7EE787', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Current value: "{String(activeElement.value)}"
                  </div>
                </div>
                <button 
                  onClick={() => setActiveElement(null)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: 8,
                    color: 'rgba(230,237,243,0.5)',
                    padding: 8,
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scale indicator */}
          <div style={{
            marginTop: 16,
            fontSize: 12,
            color: 'rgba(230,237,243,0.35)',
          }}>
            Preview at {Math.round(scale * 100)}% · Actual: {selectedFormat.width} × {selectedFormat.height}px
          </div>
        </div>

        {/* RIGHT PANEL: All format thumbnails */}
        <div style={{
          width: fullscreen ? 200 : 220,
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(230,237,243,0.4)' }}>
              All Formats ({allFormats.length})
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
            {PLATFORMS.map(p => (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'rgba(230,237,243,0.35)',
                  marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    backgroundImage: p.gradient, width: 14, height: 14, borderRadius: 3,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 8,
                  }}>{p.icon}</span>
                  {p.name}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {p.formats.map(f => {
                    const isSelected = selectedFormat.id === f.id && selectedPlatform.id === p.id;
                    const isVert = f.height > f.width;
                    const isWide = f.width > f.height;
                    const thumbW = isWide ? 56 : isVert ? 28 : 42;
                    const thumbH = isVert ? 52 : isWide ? 30 : 42;
                    return (
                      <button
                        key={f.id}
                        onClick={() => { handlePlatformSelect(p); setSelectedFormat(f); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '7px 8px',
                          borderRadius: 7,
                          border: isSelected ? `1px solid ${p.color}60` : '1px solid rgba(255,255,255,0.06)',
                          backgroundColor: isSelected ? `${p.color}18` : 'rgba(255,255,255,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          color: isSelected ? '#fff' : 'rgba(230,237,243,0.55)',
                        }}
                      >
                        {/* Mini aspect ratio indicator */}
                        <div style={{
                          width: thumbW, height: thumbH, flexShrink: 0,
                          borderRadius: 3,
                          backgroundImage: isSelected ? p.gradient : 'none',
                          backgroundColor: isSelected ? 'transparent' : 'rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 9,
                          minWidth: thumbW,
                        }}>
                          {f.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600 }}>{f.name}</div>
                          <div style={{ fontSize: 10, color: 'rgba(230,237,243,0.35)' }}>{f.width}×{f.height}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM: format grid summary */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '16px 32px',
        backgroundColor: 'rgba(13,17,23,0.9)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ fontSize: 12, color: 'rgba(230,237,243,0.4)', marginRight: 4 }}>Quick select:</span>
          {allFormats.map(f => (
            <button
              key={f.id}
              onClick={() => { handlePlatformSelect(f.platform); setSelectedFormat(f); }}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: (selectedFormat.id === f.id && selectedPlatform.id === f.platformId)
                  ? `1px solid ${f.platform.color}80`
                  : '1px solid rgba(255,255,255,0.1)',
                backgroundColor: (selectedFormat.id === f.id && selectedPlatform.id === f.platformId)
                  ? `${f.platform.color}25`
                  : 'rgba(255,255,255,0.04)',
                color: (selectedFormat.id === f.id && selectedPlatform.id === f.platformId)
                  ? '#fff'
                  : 'rgba(230,237,243,0.5)',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 500,
                transition: 'all 0.12s',
                whiteSpace: 'nowrap',
              }}
            >
              {f.platform.name.split('/')[0].trim()} {f.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
