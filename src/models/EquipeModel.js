export const createEquipeTableQuery = `
CREATE TABLE IF NOT EXISTS equipe (
  id SERIAL PRIMARY KEY,
  id_manager INTEGER NOT NULL,
  id_ligne_manager INTEGER NOT NULL,
  id_plateau INTEGER,
  partie INTEGER,
  employees INTEGER[],
  FOREIGN KEY (id_manager) REFERENCES users (id),
  FOREIGN KEY (id_ligne_manager) REFERENCES users (id),
  FOREIGN KEY (id_plateau) REFERENCES plateau (id)
);
`;