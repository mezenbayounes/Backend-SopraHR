export const createCongeTableQuery = `
  CREATE TABLE IF NOT EXISTS conge (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    cause VARCHAR(255) NOT NULL,
    date_debut DATE NOT NULL,
    sc_debut VARCHAR(50) NOT NULL,
    date_fin DATE NOT NULL,
    sc_fin VARCHAR(50) NOT NULL,
    type_conge VARCHAR(50) NOT NULL,
    etat VARCHAR(50) DEFAULT 'EC' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;
