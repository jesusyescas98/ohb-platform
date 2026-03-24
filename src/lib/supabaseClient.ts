import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hcdjwrgisurjskzmypkh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZGp3cmdpc3VyanNrem15cGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNzY4ODksImV4cCI6MjA4OTk1Mjg4OX0.43qjAhVh1e9A0fu08eeHmPO0OpwfWlOFY08jvqtUuz0';

export const supabase = createClient(supabaseUrl, supabaseKey);
