import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.user.findFirst();
    console.log('✅ Query test successful!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Connection string used:', process.env.DATABASE_URL);
  }
}

testConnection().catch(console.error);
