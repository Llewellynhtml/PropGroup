import { supabase } from '../lib/supabaseClient';
import { Property } from '../types';

export const propertyService = {
  async getAgentProperties(agentId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Property[];
  },

  async getAgencyProperties(agencyId: string) {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Property[];
  },

  async insertProperty(propertyData: Omit<Property, 'id' | 'created_at'>) {
    // Validate UUIDs before sending to database to avoid foreign key/type errors
    const isValidUUID = (id: any) => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const cleanData: any = {
      title: propertyData.title,
      price: propertyData.price,
      city: propertyData.city,
      area: propertyData.area,
      beds: propertyData.beds,
      baths: propertyData.baths,
      parking: propertyData.parking,
      size: propertyData.size,
      listing_type: propertyData.listing_type,
      description: propertyData.description,
      image_urls: propertyData.images,   // DB column is image_urls
      created_by_id: propertyData.created_by_id,
      created_by_role: propertyData.created_by_role,
      status: propertyData.status,
      featured: propertyData.featured
    };

    // Only add optional UUIDs if they are valid
    if (isValidUUID(propertyData.agent_id)) {
      cleanData.agent_id = propertyData.agent_id;
    }
    if (isValidUUID(propertyData.agency_id)) {
      cleanData.agency_id = propertyData.agency_id;
    }

    const { data, error } = await supabase
      .from('properties')
      .insert([cleanData])
      .select();
    
    if (error) {
      // If it's an RLS error on .select(), try inserting without returning data
      if (error.message.includes('row-level security policy')) {
        console.warn('RLS error detected on .select(), retrying insert only...');
        const { error: insertOnlyError } = await supabase
          .from('properties')
          .insert([cleanData]);
          
        if (!insertOnlyError) {
          console.log('Insert successful without returning data.');
          return { id: 'inserted-success-no-id' } as any;
        }
        
        console.error('Core Insert Error after retry:', insertOnlyError);
        throw new Error(`Database Error: ${insertOnlyError.message} (${insertOnlyError.hint || 'No hint'})`);
      }

      console.error('Supabase Error Details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sentData: cleanData
      });

      // Try to get auth info for better debugging
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('Auth Context at failure:', {
          userId: authUser?.id,
          email: authUser?.email,
          role: authUser?.role
        });
      } catch (authErr) {
        console.error('Failed to get auth debug info:', authErr);
      }

      throw error;
    }
    
    return (data && data.length > 0) ? data[0] as Property : null as any;
  },

  async updateProperty(id: string, propertyData: Partial<Property>) {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  },

  async deleteProperty(id: string) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  async uploadImages(files: File[]) {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `property-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          throw new Error('Storage bucket "property-images" not found. Please create it in your Supabase Dashboard under Storage.');
        }
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  }
};