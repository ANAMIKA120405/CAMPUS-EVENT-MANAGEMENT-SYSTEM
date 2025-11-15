// TEST FILE - Run this in browser console to debug
// Open Developer Tools (F12) -> Console tab
// Copy and paste this entire code

import { supabase } from './js/supabase.js?v=3';

console.log('=== TESTING DATABASE QUERY ===');

// Test query to fetch registrations
async function testRegistrationsQuery() {
    try {
        console.log('1. Testing basic registrations query...');
        
        const { data: regs1, error: err1 } = await supabase
            .from('registrations')
            .select('*')
            .limit(5);
        
        console.log('Basic query result:', { data: regs1, error: err1 });
        
        if (err1) {
            console.error('❌ Basic query failed:', err1);
            return;
        }
        
        console.log('2. Testing with profile join...');
        
        const { data: regs2, error: err2 } = await supabase
            .from('registrations')
            .select(`
                *,
                student:profiles!registrations_user_id_fkey(full_name, role)
            `)
            .limit(5);
        
        console.log('Join query result:', { data: regs2, error: err2 });
        
        if (err2) {
            console.error('❌ Join query failed:', err2);
        } else {
            console.log('✅ Query successful!');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRegistrationsQuery();
