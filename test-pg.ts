import { Client } from 'pg';

async function testConnection() {
  const users = ['ajri', 'postgres', 'root'];
  for (const user of users) {
    const dbs = ['postgres', 'ajri', 'template1'];
    for (const db of dbs) {
      const url = `postgresql://${user}@localhost:5432/${db}`;
      const client = new Client({ connectionString: url });
      try {
        await client.connect();
        
        // Try creating our database
        try {
          await client.query('CREATE DATABASE greeting');
          console.log(`Database greeting created successfully with ${url}`);
        } catch (e: any) {
          if (e.code !== '42P04') { // 42P04 is "database already exists"
             console.log(`Error creating database with ${url}: ${e.message}`);
          }
        }
        
        console.log(`SUCCESS: ${url}`);
        await client.end();
        return;
      } catch (e: any) {
        // console.log(`Failed for ${url}: ${e.message}`);
      }
    }
  }
  
  // Try with no user
  const client2 = new Client({ connectionString: 'postgresql://localhost:5432/postgres' });
  try {
     await client2.connect();
     console.log('SUCCESS: postgresql://localhost:5432/postgres');
     await client2.end();
  } catch (e) {
     console.log('All attempts failed');
  }
}

testConnection();
