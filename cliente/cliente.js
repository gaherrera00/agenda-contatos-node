
import chalk from "chalk";
import axios from "axios";
import inquirer from "inquirer";

const API_URL = 'http://localhost:3000';

//funcao de mostrar contatos        
async function listarContatos() {
    try {
        const response = await axios.get(`${API_URL}/contatos`);
        return response.data;
    } catch (error) {
        console.error(chalk.red.inverse('Erro ao listar contatos: '), error.message);
    }
}

// funcao de de mostrar detalhes
async function exibirDetalhesContato(id) {
    try {
        const response = await axios.get(`${API_URL}/contatos/${id}`);
        if (response.data) {
            console.log(chalk.green('Detalhes do Contato:'));
            console.log(`ID: ${chalk.cyan(response.data.id)}`);
            console.log(`Nome: ${chalk.green(response.data.nome)}`);
            console.log(`Número: ${chalk.yellow(response.data.numero)}`);
            return response.data;
        }
    } catch (error) {
        console.error(chalk.red.inverse(`Erro ao exibir detalhes do contato com ID: ${id}`), error.message);
    }
}

//funcao de criar contato
async function criarContato() {
    try {
        const resposta = await inquirer.prompt([
            {
                type: 'input',
                name: 'nome',
                message: 'Digite o nome do contato: ',
            },
            {
                type: 'input',
                name: 'numero',
                message: 'Digite o número de telefone do contato: ',
            }
        ]);

        const novoContato = {
            nome: resposta.nome,
            numero: resposta.numero
        };

        const response = await axios.post(`${API_URL}/contatos`, novoContato);
        console.log(chalk.green('Contato criado com sucesso!'));
        return response.data;
    } catch (error) {
        console.error(chalk.red.inverse('Erro ao criar contato: '), error.message);
    }
}


// funcao de atualizar contato
async function atualizarContato(id) {
    try {
        const response = await axios.put(`${API_URL}/contatos/${id}`);

        const contatoAtual = response.data;

        if (!contatoAtual) {
            console.log(chalk.yellow('Contato não encontrado, não será possível atualizar.'));
            return;
        }

        const resposta = await inquirer.prompt([
            {
                type: 'input',
                name: 'nome',
                message: `Atualize o nome do contato (atual: ${contatoAtual.nome}): `,
                default: contatoAtual.nome
            },
            {
                type: 'input',
                name: 'numero',
                message: `Atualize o número de telefone (atual: ${contatoAtual.numero}): `,
                default: contatoAtual.numero
            }
        ]);

        const contatoAtualizado = {
            nome: resposta.nome,
            numero: resposta.numero
        };

        const atualizacao = await axios.patch(`${API_URL}/contatos/${id}`, contatoAtualizado)

        console.log(chalk.green('Contato atualizado com sucesso!'));
        console.log(chalk.green(`Novo nome: ${response.data.nome}, Novo número: ${response.data.numero}`));
    } catch (error) {
        console.error(chalk.red.inverse('Erro ao atualizar contato: '), error.message);
    }
}

//funcao de apagar contato
async function removerContato(id) {
    try {
        await axios.delete(`${API_URL}/contatos/${id}`);
        console.log(chalk.green('Contato removido com sucesso!'));
    } catch (error) {
        console.error(chalk.red.inverse('Erro ao remover contato: '), error.message);
    }
}

// mostrar o menu de opcoes
async function exibirMenu() {
    const perguntas = [
        {
            type: 'list',
            name: 'opcao',
            message: chalk.yellow.inverse('Escolha uma opção: '),
            choices: [
                { name: chalk.blue.inverse('Listar contatos'), value: 'listar' },
                { name: chalk.green.inverse('Exibir detalhes do contato'), value: 'exibir' },
                { name: chalk.cyan.inverse('Criar novo contato'), value: 'criar' },
                { name: chalk.magenta.inverse('Atualizar contato'), value: 'atualizar' },
                { name: chalk.red.inverse('Remover contato'), value: 'remover' },
                { name: chalk.red.inverse('Sair'), value: 'sair' }
            ]
        }
    ];

    try {
        const resposta = await inquirer.prompt(perguntas);

        switch (resposta.opcao) {
            case 'listar':
                const contatos = await listarContatos();
                if (contatos && contatos.length > 0) {
                    console.log(chalk.green('Lista de Contatos: '));
                    contatos.forEach(contato => {
                        console.log(`- ${chalk.cyan(contato.id)}: ${chalk.green(contato.nome)} - ${chalk.yellow(contato.numero)}`);
                    });
                } else {
                    console.log(chalk.yellow('Nenhum contato encontrado.'));
                }
                break;

            case 'exibir':
                const { idExibir } = await inquirer.prompt([{
                    type: 'input',
                    name: 'idExibir',
                    message: 'Digite o ID do contato para exibir os detalhes: '
                }]);
                await exibirDetalhesContato(idExibir);
                break;

            case 'criar':
                await criarContato();
                break;

            case 'atualizar':
                const { idAtualizar } = await inquirer.prompt([{
                    type: 'input',
                    name: 'idAtualizar',
                    message: 'Digite o ID do contato para atualizar: '
                }]);
                await atualizarContato(idAtualizar);
                break;

            case 'remover':
                const { idRemover } = await inquirer.prompt([{
                    type: 'input',
                    name: 'idRemover',
                    message: 'Digite o ID do contato para remover: '
                }]);
                await removerContato(idRemover);
                break;

            case 'sair':
                console.log(chalk.green('Saindo...'));
                return;

            default:
                console.log(chalk.red('Opcao invalida'));
        }
        exibirMenu();

    } catch (error) {
        console.error(chalk.red.inverse('Ocorreu um erro'), error);
    }
}

exibirMenu();
