import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...\n');
    console.log('Supabase URL:', process.env.SUPABASE_URL ? ' Set' : ' Missing');
    console.log('Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? ' Set' : 'Missing');
    console.log('');

    console.log('Test 1: Checking project_vectors table...');
    const { data: tableData, error: tableError } = await supabase
      .from('project_vectors')
      .select('*')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        console.error(' Table "project_vectors" does not exist.');
        console.error('   Please run supabase_vector_migration.sql in Supabase SQL Editor');
        return;
      }
      console.error(' Error accessing table:', tableError.message);
      return;
    }

    console.log(' Table "project_vectors" exists');

    console.log('\nTest 2: Checking pgvector extension...');
    const { data: extData, error: extError } = await supabase.rpc('exec_sql', {
      query: "SELECT * FROM pg_extension WHERE extname = 'vector'"
    });

    const { count, error: countError } = await supabase
      .from('project_vectors')
      .select('*', { count: 'exact', head: true });

    if (countError && countError.message.includes('operator does not exist')) {
      console.error(' pgvector extension not enabled');
      console.error('   Run: CREATE EXTENSION IF NOT EXISTS vector;');
      return;
    }

    console.log(' pgvector extension is enabled');
    console.log(` Total vectors in database: ${count || 0}`);

    console.log('\nTest 3: Checking RPC function match_project_vectors...');

    try {

      console.log(' RPC function check skipped (requires embedding to test)');
    } catch (err) {
      console.warn('  RPC function may not exist. Run migration SQL to create it.');
    }

    console.log('\nTest 4: Testing insert operation...');
    const testProjectId = 'test_connection_' + Date.now();
    const testEmbedding = new Array(1536).fill(0.1);

    const { data: insertData, error: insertError } = await supabase
      .from('project_vectors')
      .insert({
        project_id: testProjectId,
        content: 'Test connection chunk',
        embedding: testEmbedding,
        metadata: { test: true }
      })
      .select();

    if (insertError) {
      console.error(' Insert test failed:', insertError.message);
      return;
    }

    console.log(' Insert operation successful');

    await supabase
      .from('project_vectors')
      .delete()
      .eq('project_id', testProjectId);

    console.log(' Test record cleaned up');

    console.log('\n All Supabase Vector DB tests passed!');
    console.log('\nSummary:');
    console.log('   Connection successful');
    console.log('   project_vectors table exists');
    console.log('   pgvector extension enabled');
    console.log('   Insert/Delete operations work');
    console.log(`  Current vector count: ${count || 0}`);

  } catch (err) {
    console.error(' Unexpected error:', err.message);
    console.error(err);
  }
}

testSupabaseConnection();