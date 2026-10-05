const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const ARQUIVO_AULAS = './aulas.json';
const ARQUIVO_ID = './lastId.json';

// Lê o último id salvo ao iniciar a API
let ultimoId = fs.existsSync(ARQUIVO_ID)
  ? JSON.parse(fs.readFileSync(ARQUIVO_ID)).ultimoId
  : 0;

function salvarUltimoId() {
  fs.writeFileSync(ARQUIVO_ID, JSON.stringify({ ultimoId }));
}

function lerAulas() {
  return fs.existsSync(ARQUIVO_AULAS)
    ? JSON.parse(fs.readFileSync(ARQUIVO_AULAS))
    : [];
}

function salvarAulas(aulas) {
  fs.writeFileSync(ARQUIVO_AULAS, JSON.stringify(aulas, null, 2));
}

// Cadastrar aula
app.post('/aulas', (req, res) => {
  const { componenteCurricular, professor, diaSemana, ordemAula } = req.body;

  ultimoId++;
  const aula = { id: ultimoId, componenteCurricular, professor, diaSemana, ordemAula };

  const aulas = lerAulas();
  aulas.push(aula);
  salvarAulas(aulas);
  salvarUltimoId();

  res.status(201).json(aula);
});

// Consultar horário organizado (por dia e ordem da aula)
app.get('/aulas', (req, res) => {
  const aulas = lerAulas().sort((a, b) =>
    a.diaSemana.localeCompare(b.diaSemana) || a.ordemAula - b.ordemAula
  );
  res.json(aulas);
});

// Excluir aula por id
app.delete('/aulas/:id', (req, res) => {
  const aulas = lerAulas().filter(a => a.id !== Number(req.params.id));
  salvarAulas(aulas);
  res.json({ mensagem: 'Aula excluída com sucesso.' });
});

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));