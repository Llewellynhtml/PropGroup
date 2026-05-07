import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { propertyService } from '../services/propertyService';
import { useAuth } from '../contexts/AuthContext';
import { Property } from '../types';
import { toast } from 'sonner';

export function useAddProperty() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addProperty = async (
    formData: any, 
    imageFiles: File[], 
    onSuccess?: () => void
  ) => {
    if (!user) {
      toast.error('You must be logged in to add a property');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get fresh user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session Error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }

      if (!session) {
        console.error('No active session found during property creation.');
        throw new Error('Your session has expired. Please log in again.');
      }

      const currentUserId = session.user.id;
      
      // Validate UUID format
      const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      if (!currentUserId || !isValidUUID(currentUserId)) {
        throw new Error('Invalid User ID. Please log out and log in again.');
      }

      // 2. Determine role and resolve agency_id fresh from DB
      let dbRole: 'agent' | 'agency' | 'admin' = 'agent';
      if (user.role === 'agency') dbRole = 'agency';
      if (user.role === 'admin') dbRole = 'admin';

      let resolvedAgencyId: string | null = null;

      if (dbRole === 'agency') {
        // Agency user — their own ID is the agency_id
        resolvedAgencyId = currentUserId;
      } else {
        // Agent — fetch agency_id fresh from the agents table
        // Never trust the stale user object; agency_id may not have been loaded
        const { data: agentRow } = await supabase
          .from('agents')
          .select('agency_id')
          .eq('id', currentUserId)
          .single();

        resolvedAgencyId = agentRow?.agency_id || null;

        if (!resolvedAgencyId) {
          console.warn('Agent has no agency_id — independent agent, proceeding without agency link.');
        }
      }

      // 3. Upload images
      const imageUrls = await propertyService.uploadImages(imageFiles);

      // 4. Prepare property data
      const propertyData: Omit<Property, 'id' | 'created_at'> = {
        title: formData.title,
        price: parseFloat(formData.price) || 0,
        city: formData.city,
        area: formData.area,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        parking: parseInt(formData.parking) || 0,
        size: parseFloat(formData.size) || 0,
        listing_type: formData.listing_type,
        description: formData.description,
        images: imageUrls,
        status: 'active',
        featured: false,
        created_by_id: currentUserId,
        created_by_role: dbRole,
        agent_id: dbRole === 'agent' ? currentUserId : null,
        agency_id: resolvedAgencyId,
      };

      console.log('Inserting property for user:', currentUserId, 'agency:', resolvedAgencyId);

      // 5. Insert into database
      await propertyService.insertProperty(propertyData);
      
      toast.success('Property added successfully!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(error.message || 'Failed to add property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addProperty,
    isSubmitting
  };
}
