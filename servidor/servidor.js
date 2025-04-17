// importando modulos
const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// autenticacao pra loggin
app.use((req, res, next) => {
    const data = new Date();
    console.log(`[${data.toISOString()}] ${req.method} ${req.url}`);
    next();
});

const autenticar = (req, res, next) => {
    const token = req.headers['authorization'];
    if (token === 'SEGREDO') {
        next();
    } else {
        res.status(401).send('Acesso negado / Não autorizado');
    }
};

app.use(logger);
app.use(express.json());

// leitura do json
let contatos = [];
try {
    const data = fs.readFileSync('contatos.json', 'utf8');
    contatos = JSON.parse(data);
} catch (error) {
    console.log('Erro ao ler o arquivo', error);
    contatos = [];
}
// rota do home
app.get('/', (req, res) => {
    res.status(200).send('<h1>Bem-vindo à Agenda de Contatos!</h1>');
});

// lista de contatos
app.get('/contatos', (req, res) => {
    res.status(200).json(contatos);
});

// puxar um contato especifico pelo id
app.get('/contatos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contato = contatos.find(c => c.id === id);
    if (contato) {
        res.status(200).json(contato);
    } else {
        res.status(404).send('Contato não encontrado');
    }
});

// criar um contato usando post
app.post('/contatos', (req, res) => {
    const { nome, numero } = req.body;
    const novoContato = {
        id: contatos.length + 1,
        nome,
        numero
    };
    contatos.push(novoContato);
    fs.writeFileSync('contatos.json', JSON.stringify(contatos), 'utf8');
    res.status(201).json(novoContato);
});

// atualizar um contato usando patch
app.patch('/contatos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, numero } = req.body;
    const contatoIndex = contatos.findIndex(c => c.id === id);

    if (contatoIndex !== -1) {
        if (nome) {
            contatos[contatoIndex].nome = nome;
        }
        if (numero) {
            contatos[contatoIndex].numero = numero;
        }
        fs.writeFileSync('contatos.json', JSON.stringify(contatos), 'utf8');
        res.status(200).json(contatos[contatoIndex]);
    } else {
        res.status(404).send('Contato não encontrado');
    }
});

// excluir um contato usando delete
app.delete('/contatos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const contatoIndex = contatos.findIndex(c => c.id === id);

    if (contatoIndex !== -1) {
        contatos.splice(contatoIndex, 1);
        fs.writeFileSync('contatos.json', JSON.stringify(contatos), 'utf8');
        res.status(200).send('Contato removido com sucesso');
    } else {
        res.status(404).send('Contato não encontrado');
    }
});

// rota do adm
app.get('/admin', autenticar, (req, res) => {
    res.status(200).send('<h1>Página de Administração</h1>');
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
