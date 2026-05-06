import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { AlertCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'agency' | 'agent';
  cellphone?: string;
  agency_id?: string;
  agency_name?: string;
  office_number?: string;
  city?: string;
  logo_url?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isValidUUID = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Build the agent DB row payload from metadata
function buildAgentRow(userId: string, email: string, agencyId: string | null, meta: any) {
  return {
    id: userId,
    full_name: meta.name || meta.full_name,
    email,
    cellphone:        meta.cellphone        || null,
    cellphone_number: meta.cellphone        || null, // legacy compat
    whatsapp_number:  meta.whatsapp_number  || meta.cellphone || null,
    agency_id:        agencyId,
    join_method:      meta.join_method      || 'independent',
    job_title:        meta.job_title        || null,
    role_optional:    meta.job_title        || null, // legacy compat
    ppra_number:      meta.ppra_number      || null,
    license_number:   meta.ppra_number      || null, // legacy compat
    bio:              meta.bio              || null,
    specialisation:   meta.specialisation   || null,
    areas:            meta.areas            || [],
    instagram_url:    meta.instagram_url    || null,
    status:           meta.status           || 'active',
  };
}

// ─── Profile fetcher (called on login / session restore) ─────────────────────

async function fetchAndSetProfile(
  supabaseUser: User,
  setUser: (u: UserProfile | null) => void
) {
  try {
    // 1. Check agents table first
    const { data: agentData } = await supabase
      .from('agents')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    // 2. If agent row missing but we have pending profile data, create it now
    if (!agentData) {
      const pending =
        supabaseUser.user_metadata?.pending_agent_profile ||
        (supabaseUser.user_metadata?.role === 'agent' ? supabaseUser.user_metadata : null);

      if (pending) {
        const agencyId = pending.agency_id && isValidUUID(pending.agency_id)
          ? pending.agency_id
          : null;

        const row = buildAgentRow(supabaseUser.id, supabaseUser.email!, agencyId, pending);
        const { data: created, error: createErr } = await supabase
          .from('agents')
          .insert(row)
          .select()
          .maybeSingle();

        if (createErr) {
          console.error('Could not create agent profile on login:', createErr.message, createErr.details, createErr.hint);
        } else if (created) {
          setUser({
            id: created.id,
            name: created.full_name,
            email: created.email,
            role: 'agent',
            cellphone: created.cellphone,
            agency_id: created.agency_id,
          });
          return;
        }
      }
    }

    if (agentData) {
      setUser({
        id: agentData.id,
        name: agentData.full_name,
        email: agentData.email,
        role: 'agent',
        cellphone: agentData.cellphone,
        agency_id: agentData.agency_id,
      });
      return;
    }

    // 3. Check agencies table
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', supabaseUser.id)
      .maybeSingle();

    if (agencyData) {
      setUser({
        id: agencyData.id,
        name: agencyData.agency_name,
        email: agencyData.email,
        role: 'agency',
        agency_name: agencyData.agency_name,
        office_number: agencyData.office_number,
        city: agencyData.city,
        logo_url: agencyData.logo_url,
        agency_id: agencyData.id,
      });
      return;
    }

    // 4. Check user_metadata role as final fallback
    const metaRole = supabaseUser.user_metadata?.role;
    if (metaRole === 'agency' || metaRole === 'admin') {
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.agency_name || supabaseUser.email!,
        email: supabaseUser.email!,
        role: 'agency',
        agency_id: supabaseUser.id,
      });
    } else {
      setUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email!,
        email: supabaseUser.email!,
        role: 'agent',
      });
    }
  } catch (err) {
    console.error('fetchAndSetProfile error:', err);
    setUser(null);
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setIsLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchAndSetProfile(session.user, setUser).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await fetchAndSetProfile(session.user, setUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── signIn ────────────────────────────────────────────────────────────────
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // ── signUp ────────────────────────────────────────────────────────────────
  const signUp = async (email: string, password: string, metadata: any) => {
    // KEY FIX: store ALL profile data inside options.data so it goes into
    // raw_user_meta_data at signup time — no active session required.
    // This works even when email confirmation is enabled.

    let resolvedAgencyId: string | null = null;
    if (metadata.role === 'agent') {
      const rawCode = metadata.agency_id || metadata.agency_code;
      if (rawCode) {
        if (isValidUUID(rawCode)) {
          resolvedAgencyId = rawCode;
        } else {
          const { data: found } = await supabase
            .from('agencies')
            .select('id')
            .eq('join_code', rawCode.trim().toUpperCase())
            .maybeSingle();
          resolvedAgencyId = found?.id || null;
        }
      }
    }

    // Build the full metadata payload — stored in raw_user_meta_data by Supabase
    const signupMeta =
      metadata.role === 'agent'
        ? {
            role: 'agent',
            // All fields flattened — fetchAndSetProfile reads these on first login
            name:             metadata.name,
            full_name:        metadata.name,
            cellphone:        metadata.cellphone        || null,
            whatsapp_number:  metadata.whatsapp_number  || metadata.cellphone || null,
            agency_id:        resolvedAgencyId,
            join_method:      metadata.join_method      || 'independent',
            job_title:        metadata.job_title        || null,
            ppra_number:      metadata.ppra_number      || null,
            bio:              metadata.bio              || null,
            specialisation:   metadata.specialisation   || null,
            areas:            metadata.areas            || [],
            instagram_url:    metadata.instagram_url    || null,
            status:           metadata.status           || 'active',
          }
        : {
            role: 'agency',
            name:             metadata.name,
            agency_name:      metadata.agency_name,
            trading_name:     metadata.trading_name     || null,
            agency_email:     metadata.agency_email,
            office_number:    metadata.office_number    || null,
            province:         metadata.province         || null,
            city:             metadata.city             || null,
            address:          metadata.address          || null,
            website:          metadata.website          || null,
            agent_count:      metadata.agent_count      || null,
            plan:             metadata.plan             || 'free',
            plan_agent_limit: metadata.plan_agent_limit ?? 3,
            plan_post_limit:  metadata.plan_post_limit  ?? 5,
            plan_platform_limit: metadata.plan_platform_limit ?? 2,
            trial_ends_at:    metadata.trial_ends_at    || null,
          };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: signupMeta },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed — no user returned.');

    // ── If email confirmation is DISABLED, session is active immediately ──
    // Try to create the DB profile row right now.
    // If it fails (RLS / confirmation required), fetchAndSetProfile handles it on login.
    if (data.session) {
      // Session exists → email confirmation is off → create profile now
      if (metadata.role === 'agent') {
        const row = buildAgentRow(data.user.id, email, resolvedAgencyId, signupMeta);
        const { error: agentErr } = await supabase.from('agents').insert(row);
        if (agentErr) {
          console.error('Agent insert failed:', agentErr);
          throw new Error('Profile setup failed: ' + agentErr.message);
        }
      } else {
        // Agency
        const { data: agency, error: agencyErr } = await supabase
          .from('agencies')
          .insert({
            id:                  data.user.id,
            agency_name:         metadata.agency_name,
            trading_name:        metadata.trading_name     || null,
            email:               metadata.agency_email,
            office_number:       metadata.office_number    || null,
            province:            metadata.province         || null,
            city:                metadata.city             || null,
            office_address:      metadata.address          || null,
            website_url:         metadata.website          || null,
            agent_count_range:   metadata.agent_count      || null,
            logo_url:            null,
            plan:                metadata.plan             || 'free',
            plan_agent_limit:    metadata.plan_agent_limit ?? 3,
            plan_post_limit:     metadata.plan_post_limit  ?? 5,
            plan_platform_limit: metadata.plan_platform_limit ?? 2,
            trial_ends_at:       metadata.trial_ends_at    || null,
          })
          .select()
          .maybeSingle();

        if (agencyErr) console.warn('Agency insert:', agencyErr.message);

        if (agency) {
          await supabase.from('branding').insert({
            agency_id:          agency.id,
            company_name:       metadata.trading_name || metadata.agency_name,
            primary_color:      '#1E97AB',
            primary_color_hex:  '#1E97AB',
            secondary_color:    '#0e1c20',
            secondary_color_hex:'#0e1c20',
            font_family:        'DM Sans',
            default_cta_text:   'Contact us today',
          });
        }
      }
    } else {
      // No session → email confirmation is ON → profile will be created on first login
      // Everything is already stored in raw_user_meta_data via options.data above.
      console.info('Email confirmation required — profile will be created on first login.');
    }
  };

  // ── Other auth methods ────────────────────────────────────────────────────
  const resendVerification = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Configuration Required</h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              Please set up your Supabase environment variables in the{' '}
              <span className="font-bold text-indigo-600">Settings</span> menu to enable authentication.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl text-left font-mono text-xs text-gray-600 space-y-1">
            <p>VITE_SUPABASE_URL=...</p>
            <p>VITE_SUPABASE_ANON_KEY=...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, session,
      token: session?.access_token || null,
      isLoading,
      signIn, signUp, resendVerification, resetPassword, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
