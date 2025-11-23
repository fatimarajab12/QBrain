import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Supabase connection
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

async function testSupabase() {
  const { data, error } = await supabase.from('projects').select('*').limit(5);
  if (error) console.error(error);
  else console.log(data);
}

testSupabase();
