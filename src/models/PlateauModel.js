export const createPlateauTableQuery = `
CREATE TABLE IF NOT EXISTS plateau (
  id SERIAL PRIMARY KEY,
  id_manager INTEGER NOT NULL,
  nmbr_de_partie INTEGER,
  FOREIGN KEY (id_manager) REFERENCES users (id)
);
`;