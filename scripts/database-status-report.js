const { PrismaClient } = require('@prisma/client');

async function generateDatabaseStatusReport() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 HS6Tools Database Status Report');
    console.log('==================================');
    console.log(`Generated: ${new Date().toLocaleString()}`);
    console.log('');
    
    // Database Connection Info
    console.log('🔌 Database Connection');
    console.log('----------------------');
    await prisma.$connect();
    console.log('✅ Status: Connected');
    
    const dbInfo = await prisma.$queryRaw`SELECT current_database() as db_name, current_user as user_name, version() as pg_version`;
    console.log(`📁 Database: ${dbInfo[0].db_name}`);
    console.log(`👤 User: ${dbInfo[0].user_name}`);
    console.log(`🐘 Version: ${dbInfo[0].pg_version.split(' ')[1]}`);
    console.log('');
    
    // Migration Status
    console.log('📋 Migration Status');
    console.log('-------------------');
    try {
      const migrations = await prisma.$queryRaw`
        SELECT DISTINCT ON (migration_name)
          migration_name,
          started_at,
          finished_at,
          rolled_back_at,
          checksum
        FROM _prisma_migrations
        ORDER BY migration_name, COALESCE(finished_at, rolled_back_at, started_at) DESC
      `;

      migrations.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
      
      if (migrations.length === 0) {
        console.log('❌ No migrations found');
      } else {
        migrations.forEach((migration, index) => {
          const status = migration.finished_at
            ? '✅ Applied'
            : migration.rolled_back_at
              ? '↩️ Rolled Back'
              : '❌ Failed or Interrupted';
          const date = new Date(migration.started_at).toLocaleDateString();
          console.log(`${index + 1}. ${migration.migration_name} (${date}) - ${status}`);
        });
      }
    } catch {
      console.log('❌ Migration table not accessible');
    }
    console.log('');
    
    // Table Status
    console.log('🗃️ Table Status');
    console.log('---------------');
    const tables = await prisma.$queryRaw`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name NOT LIKE 'pg_%'
      AND table_name NOT LIKE '_prisma_%'
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('❌ No tables found');
    } else {
      tables.forEach(table => {
        console.log(`✅ ${table.table_name} (${table.column_count} columns)`);
      });
    }
    console.log('');
    
    // Data Counts
    console.log('📊 Data Counts');
    console.log('---------------');
    const counts = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
      prisma.article.count(),
      prisma.review.count()
    ]);
    
    console.log(`👥 Users: ${counts[0]}`);
    console.log(`📦 Products: ${counts[1]}`);
    console.log(`🏷️ Categories: ${counts[2]}`);
    console.log(`📋 Orders: ${counts[3]}`);
    console.log(`📰 Articles: ${counts[4]}`);
    console.log(`⭐ Reviews: ${counts[5]}`);
    console.log('');
    
    // Performance Metrics
    console.log('⚡ Performance Metrics');
    console.log('----------------------');
    const startTime = Date.now();
    await prisma.user.count();
    const simpleQueryTime = Date.now() - startTime;
    
    const complexStart = Date.now();
    await prisma.product.findMany({
      include: { category: true },
      take: 5
    });
    const complexQueryTime = Date.now() - complexStart;
    
    console.log(`🔍 Simple Query: ${simpleQueryTime}ms`);
    console.log(`🔗 Complex Query: ${complexQueryTime}ms`);
    console.log(`📊 Total Time: ${simpleQueryTime + complexQueryTime}ms`);
    console.log('');
    
    // Database Health Assessment
    console.log('🏥 Database Health Assessment');
    console.log('-----------------------------');
    
    let healthScore = 100;
    const issues = [];
    
    // Check connection
    if (simpleQueryTime > 100) {
      healthScore -= 20;
      issues.push('Slow query performance');
    }
    
    // Check tables
    if (tables.length < 12) {
      healthScore -= 30;
      issues.push('Missing tables');
    }
    
    // Check migrations
    try {
      const migrationCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM _prisma_migrations`;
      if (migrationCount[0].count === 0) {
        healthScore -= 25;
        issues.push('No migrations applied');
      }
    } catch {
      healthScore -= 25;
      issues.push('Migration table inaccessible');
    }
    
    // Health status
    if (healthScore >= 90) {
      console.log('🟢 Status: Excellent');
    } else if (healthScore >= 70) {
      console.log('🟡 Status: Good');
    } else if (healthScore >= 50) {
      console.log('🟠 Status: Fair');
    } else {
      console.log('🔴 Status: Poor');
    }
    
    console.log(`📊 Health Score: ${healthScore}/100`);
    
    if (issues.length > 0) {
      console.log('⚠️ Issues Found:');
      issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log('✅ No issues found');
    }
    console.log('');
    
    // Recommendations
    console.log('💡 Recommendations');
    console.log('------------------');
    if (healthScore >= 90) {
      console.log('🎉 Database is in excellent condition!');
      console.log('   • Ready for production use');
      console.log('   • Consider adding performance monitoring');
    } else if (healthScore >= 70) {
      console.log('✅ Database is in good condition');
      console.log('   • Address minor issues before production');
      console.log('   • Monitor performance metrics');
    } else {
      console.log('⚠️ Database needs attention');
      console.log('   • Fix critical issues before proceeding');
      console.log('   • Review migration status');
      console.log('   • Check table structure');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   • Run: npm run db:test:crud (test CRUD operations)');
    console.log('   • Run: npm run db:test:performance (test performance)');
    console.log('   • Run: npm run db:studio (open Prisma Studio)');
    
  } catch (error) {
    console.error('❌ Error generating status report:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  }
}

generateDatabaseStatusReport();
