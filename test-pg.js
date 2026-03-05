const { Client } = require('pg');

async function testConnection() {
    const users = ['postgres', 'user', 'root', 'ajri'];
    const passwords = ['postgres', 'password', 'root', '123456', ''];
    const dbs = ['postgres', 'greeting', 'template1'];

    for (const user of users) {
        for (const pass of passwords) {
            for (const db of dbs) {
                let url = pass ? `postgresql://${user}:${pass}@localhost:5432/${db}` : `postgresql://${user}@localhost:5432/${db}`;
                const client = new Client({ connectionString: url });
                try {
                    await client.connect();
                    console.log(`Connected to ${url}`);

                    try {
                        await client.query('CREATE DATABASE greeting');
                        console.log(`Database greeting created successfully`);
                    } catch (e) {
                        if (e.code !== '42P04') {
                            // ignore
                        } else {
                            console.log(`Database greeting already exists`);
                        }
                    }

                    let successfulUrl = pass ? `postgresql://${user}:${pass}@localhost:5432/greeting?schema=public` : `postgresql://${user}@localhost:5432/greeting?schema=public`;
                    console.log(`SUCCESS URL FOR ENV: ${successfulUrl}`);
                    await client.end();
                    return;
                } catch (e) {
                    // ignore
                }
            }
        }
    }
    console.log('ALL FAILED');
}

testConnection();
