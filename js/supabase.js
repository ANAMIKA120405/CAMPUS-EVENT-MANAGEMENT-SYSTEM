/**
 * SUPABASE CLIENT INITIALIZATION
 * 
 * This module initializes the Supabase client with your project credentials.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to your Supabase project dashboard (https://app.supabase.com)
 * 2. Navigate to Settings > API
 * 3. Copy your Project URL and anon/public key
 * 4. Replace the values below with your actual credentials
 * 
 * NOTE: The anon key is safe to use in the browser as it's protected by RLS policies
 */

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';


const SUPABASE_URL = 'https://klrfbrydsfjcvrdzyeyd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscmZicnlkc2ZqY3ZyZHp5ZXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxODk1MzksImV4cCI6MjA3ODc2NTUzOX0.tT3dTv5uMtObZDS7WnE5t-V2bJ46sXT8dJuN4Jul9IY';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name for event posters
export const STORAGE_BUCKET = 'event-images';

/**
 * Helper function to get the public URL for an uploaded file
 * @param {string} filePath - The path to the file in storage
 * @returns {string} - Public URL of the file
 */
export function getPublicUrl(filePath) {
    const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
    return data.publicUrl;
}

/**
 * Helper function to upload a file to Supabase Storage
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder name (default: 'posters')
 * @returns {Promise<string>} - The file path in storage
 */
export async function uploadFile(file, folder = 'posters') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

    if (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }

    return filePath;
}

/**
 * Helper function to delete a file from Supabase Storage
 * @param {string} filePath - The path to the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
    const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

    if (error) {
        throw new Error(`Delete failed: ${error.message}`);
    }
}

// Log initialization status (for debugging)
console.log('Supabase client initialized');
