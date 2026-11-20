import { pool, testDatabaseConnection, getDatabaseTargetInfo } from '../config/db.js';

async function main() {
  console.log('================================================================');
  console.log('       CampusConnect Database Connectivity & RDS Verifier       ');
  console.log('================================================================\n');

  const target = getDatabaseTargetInfo();
  console.log(`[Configured Target]`);
  console.log(`  Engine Type   : ${target.isRDS ? 'Amazon RDS MySQL (Cloud)' : 'Local MySQL'}`);
  console.log(`  Host Endpoint : ${target.host}`);
  console.log(`  Port          : ${target.port}`);
  console.log(`  Database Name : ${target.database}`);
  console.log(`  Database User : ${target.user}`);
  console.log(`  SSL Enabled   : ${target.sslEnabled ? 'Yes (Encrypted in transit)' : 'No'}\n`);

  console.log('[Connecting] Attempting handshake with database...');
  const startTime = Date.now();
  const isConnected = await testDatabaseConnection();
  const latency = Date.now() - startTime;

  if (!isConnected) {
    console.error('\n❌ Connection verification FAILED.');
    process.exit(1);
  }

  console.log(`\n✅ Connection SUCCESSFUL (Latency: ${latency}ms)`);

  try {
    const connection = await pool.getConnection();

    // Query server details
    const [versionRows] = await connection.query('SELECT VERSION() as version, @@version_comment as comment');
    console.log(`\n[Database Server Info]`);
    console.log(`  Version String : ${versionRows[0]?.version}`);
    console.log(`  Version Comment: ${versionRows[0]?.comment || 'N/A'}`);

    // Query tables
    const [tables] = await connection.query(`
      SELECT table_name, table_rows 
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [target.database]);

    console.log(`\n[Schema Tables in "${target.database}"]:`);
    if (tables.length === 0) {
      console.log('  (No tables found. Run "npm run db:migrate" to initialize schema.)');
    } else {
      tables.forEach(t => {
        console.log(`  - ${t.TABLE_NAME || t.table_name} (approx ${t.TABLE_ROWS || t.table_rows || 0} rows)`);
      });
    }

    connection.release();
    await pool.end();
    console.log('\n================================================================');
    console.log('       Database Handshake & Schema Verification Complete        ');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('\nQuery Error:', err.message);
    await pool.end();
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
