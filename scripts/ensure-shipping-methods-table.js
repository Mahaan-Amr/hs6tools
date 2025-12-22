/**
 * Emergency script to ensure shipping_methods table exists
 * Run this on the server if migrations fail: node scripts/ensure-shipping-methods-table.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ensureTable() {
  try {
    console.log('🔍 Checking if shipping_methods table exists...');
    
    // Try to query the table
    const count = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'shipping_methods'
    `;
    
    const tableExists = count[0].count > 0;
    
    if (tableExists) {
      console.log('✅ shipping_methods table already exists');
      
      // Verify structure
      const methods = await prisma.shippingMethodConfig.findMany({
        take: 1
      });
      console.log('✅ Table structure is correct');
      console.log(`✅ Current records: ${await prisma.shippingMethodConfig.count()}`);
      return;
    }
    
    console.log('❌ Table does not exist. Creating...');
    
    // Create table using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "shipping_methods" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "price" DECIMAL(10,2) NOT NULL,
        "estimatedDays" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
      );
    `);
    
    // Create index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "shipping_methods_isActive_sortOrder_idx" 
      ON "shipping_methods"("isActive", "sortOrder");
    `);
    
    console.log('✅ shipping_methods table created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

ensureTable()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

