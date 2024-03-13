import pkg from 'pg';

import { connectionConfig } from './dbConfig.js'; 

const { Client } = pkg;

///////////Connection
const client = new Client(connectionConfig);
client.connect(err => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL');

    // Execute a query
    client.query('SELECT * FROM test', (err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Query results:', res.rows);
      }
      // Close the client connection after the query
      client.end();
    });
  }
});



///////////////
