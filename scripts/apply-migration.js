import { PrismaClient } from '@prisma/client';

async function applyMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Applying migration: Add multilingual fields to categories...');
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Check if columns already exist
    const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND table_schema = 'public'
      AND column_name IN ('nameEn', 'nameAr', 'descriptionEn', 'descriptionAr')
    `;
    
    if (columns.length > 0) {
      console.log('ℹ️  Multilingual columns already exist:', columns.map(c => c.column_name));
      return;
    }
    
    // Add the new columns
    await prisma.$executeRaw`ALTER TABLE "public"."categories" ADD COLUMN "nameEn" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "public"."categories" ADD COLUMN "nameAr" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "public"."categories" ADD COLUMN "descriptionEn" TEXT`;
    await prisma.$executeRaw`ALTER TABLE "public"."categories" ADD COLUMN "descriptionAr" TEXT`;
    
    console.log('✅ Successfully added multilingual columns to categories table');
    
    // Verify the columns were added
    const newColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND table_schema = 'public'
      AND column_name IN ('nameEn', 'nameAr', 'descriptionEn', 'descriptionAr')
    `;
    
    console.log('📋 New columns added:', newColumns.map(c => c.column_name));
    
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the migration
applyMigration()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
