// script.js - Traduzido para Português e Atualizado com Limpeza
// Referências aos elementos importantes no DOM
const divResposta = document.getElementById('response');
const btnGerarLista = document.getElementById('generate-list-btn');

const inputMateria = document.getElementById('materia');
const inputTema = document.getElementById('tema');
const inputQuantidade = document.getElementById('quantidade');
const selectDificuldade = document.getElementById('dificuldade');

/**
 * @function limparFormulario
 * @description Limpa os campos do formulário para seus valores padrão ou vazios.
 */
function limparFormulario() {
    if (inputMateria) inputMateria.value = '';
    if (inputTema) inputTema.value = '';
    if (inputQuantidade) inputQuantidade.value = '';
    if (selectDificuldade) selectDificuldade.value = 'facil';
    console.log('[limparFormulario] Campos do formulário foram limpos.');
}
/**

/**
 * @function renderizarLista
 * @description Constrói dinamicamente o HTML da lista a partir de um objeto JSON
 * retornado pela API e o exibe na área de resposta designada.
 * @param {object} dadosLista - O objeto JSON contendo os dados da lista.
 */
function renderizarLista(dadosLista) {
    // Garante que as classes de layout da área de resposta estejam corretas inicialmente.
    divResposta.className = 'response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto';
    divResposta.classList.remove('text-red-600'); // Remove cor de erro anterior

    // Validação básica do objeto recebido
    if (!dadosLista || typeof dadosLista !== 'object') {
        console.error("Erro ao renderizar: dadosLista é inválido ou nulo.", dadosLista);
        divResposta.innerHTML = '<p class="text-red-600 font-semibold">Erro: Não foi possível processar os dados recebidos.</p>';
        divResposta.classList.add('text-red-600');
        return;
    }
    
    // Trata o caso de "alerta" (conteúdo impróprio)
    if (dadosLista.titulo && dadosLista.titulo.toLowerCase() === "alerta") {
        let mensagemAlerta = "Por favor, reveja as informações fornecidas e utilize a plataforma com respeito e responsabilidade.";
        // Tenta pegar uma mensagem mais específica do backend, se fornecida
        if (typeof dadosLista.materia === 'string' && dadosLista.materia.length > 5 && dadosLista.materia.toLowerCase() !== "alerta") {
             mensagemAlerta = dadosLista.materia;
        } else if (Array.isArray(dadosLista.exercicios) && dadosLista.exercicios.length > 0 && dadosLista.exercicios[0] && typeof dadosLista.exercicios[0].enunciado === 'string') {
             mensagemAlerta = dadosLista.exercicios[0].enunciado;
        }

        divResposta.innerHTML = `
            <h2 class="text-2xl font-bold mb-4 text-orange-600">${dadosLista.titulo.toUpperCase()}</h2>
            <p class="text-orange-700">${mensagemAlerta}</p>
        `;
        return;
    }

    // Validação da estrutura esperada para uma lista de exercícios válida
    if (!dadosLista.titulo ||
        !Array.isArray(dadosLista.exercicios) ||
        !(typeof dadosLista.gabarito === 'object' && dadosLista.gabarito !== null && !Array.isArray(dadosLista.gabarito)) || // gabarito DEVE ser um objeto não-nulo e não-array
        !dadosLista.materia ||
        !dadosLista.tema ||
        typeof dadosLista.quantidade === 'undefined' // Verifica se quantidade existe. Poderia ser typeof !== 'number' se sempre for número.
       ) {
        console.error("Erro ao renderizar: Dados da lista no formato inesperado.", dadosLista);
        divResposta.innerHTML = '<p class="text-red-600 font-semibold">Erro ao renderizar a Lista: formato de dados inválido.</p>';
        divResposta.classList.add('text-red-600');
        return;
    }


    // Começa a construir o HTML usando template literals (strings que permitem multilinha e interpolação ${}).
    let htmlLista = `
        <h2 class="text-2xl font-bold mb-4 text-gray-800">${dadosLista.titulo}</h2>
    `;

    // Adiciona informações de porcionamento e tempo de preparo, com ícones.
    // Verifica se as propriedades existem antes de adicioná-las ao HTML.
    if (dadosLista.materia || dadosLista.tema) {
        htmlLista += `
            <div class="flex items-center text-gray-700 mb-4 space-x-4">
                ${dadosLista.materia ? `<p class="flex items-center"><span class="mr-1">📚</span> <strong>Matéria:</strong> ${dadosLista.materia}</p>` : ''}
                ${dadosLista.tema ? `<p class="flex items-center"><span class="mr-1">🎯</span> <strong>Tema:</strong> ${dadosLista.tema}</p>` : ''}
            </div>
            <p class="text-gray-700 mb-4"><strong>Quantidade de exercícios:</strong> ${dadosLista.quantidade}</p>
        `;
    }

     if (dadosLista.exercicios && dadosLista.exercicios.length > 0) {
        htmlLista += `
            <h3 class="text-xl font-semibold mb-2 text-gray-700">Exercícios:</h3>
            <ul class="list-none text-gray-700 mb-4 space-y-6"> 
        `; // Usando list-none e space-y para mais controle
        const letrasAlternativas = ['a', 'b', 'c', 'd'];
        dadosLista.exercicios.forEach(exercicio => {
            if (typeof exercicio === 'object' && exercicio !== null && exercicio.enunciado && Array.isArray(exercicio.alternativas)) {
                htmlLista += `
                    <li class="mb-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                        <p class="font-medium mb-2">${exercicio.numero ? `${exercicio.numero}. ` : ''}${exercicio.enunciado}</p>
                        <ul class="list-none ml-4 space-y-1">
                `;
                exercicio.alternativas.forEach((alt, index) => {
                    htmlLista += `<li><strong>${letrasAlternativas[index]})</strong> ${alt}</li>`;
                });
                htmlLista += `</ul>`;
                htmlLista += `</li>`;
            } else {
                // Fallback se um exercício não estiver no formato esperado
                htmlLista += `<li class="mb-1 text-red-500">Exercício mal formatado: ${JSON.stringify(exercicio)}</li>`;
            }
        });
        htmlLista += `</ul>`;
    }

    if (dadosLista.gabarito && Object.keys(dadosLista.gabarito).length > 0) {
        htmlLista += `
            <h3 class="text-xl font-semibold mb-2 mt-6 text-gray-700">Gabarito:</h3>
            <ol class="list-none text-gray-700 space-y-1 bg-gray-100 p-3 rounded">
        `;
        Object.keys(dadosLista.gabarito).sort((a, b) => parseInt(a) - parseInt(b)).forEach(numeroQuestao => {
            // Assumindo que dadosLista.gabarito[numeroQuestao] é o texto da alternativa correta
            htmlLista += `<li class="py-1"><strong>${numeroQuestao}.</strong> ${dadosLista.gabarito[numeroQuestao]}</li>`;
        });
        htmlLista += `</ol>`;
    }

    divResposta.innerHTML = htmlLista;
}

/**
 * @function enviarFormulario
 * @description Coleta os ingredientes dos campos de input, valida se há pelo menos 3,
 * envia os dados para a API do back-end Flask usando Fetch API,
 * processa a resposta (receita em JSON ou erro) e exibe o resultado na tela.
 * É uma função assíncrona (`async`) pois contém operações que esperam (`await`),
 * como a requisição de rede.
 */
async function enviarFormulario() {
    console.log('[enviarFormulario] Processando e enviando formulário...');

    // Desabilita o botão "Gerar Receita" para evitar múltiplos cliques enquanto a requisição está em andamento.
    btnGerarLista.disabled = true;
    // Altera o texto do botão para dar feedback visual ao usuário.
    btnGerarLista.innerHTML = 'Gerando lista...';

    // Limpa qualquer conteúdo anterior na área de resposta e mostra um indicador de carregamento.
    divResposta.innerHTML = 'Carregando...';
    // Garante que a área de resposta esteja visível removendo a classe 'hidden' do Tailwind.
    divResposta.classList.remove('hidden');
    // Opcional: Ajusta classes Tailwind para centralizar o texto de carregamento, se desejado.
    // divResposta.className = 'response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center max-w-xl mx-auto';
    divResposta.className = 'response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center max-w-xl mx-auto'; // Centraliza carregando


    let materia = document.getElementById('materia').value.trim()
    let tema = document.getElementById('tema').value.trim()
    let quantidade = document.getElementById('quantidade').value
    let dificuldade = document.getElementById('dificuldade').value

    // Validação simples no frontend antes de enviar
    if (!materia || !tema || !quantidade || !dificuldade) {
        divResposta.innerHTML = '<p class="text-red-600 font-semibold">Por favor, preencha todos os campos.</p>';
        divResposta.classList.add('text-red-600');
        btnGerarLista.disabled = false;
        btnGerarLista.innerHTML = 'Gerar Lista';
        return;
    }

    // Valida quantidade mínima de texto em matéria e tema
    if (materia.length < 3 || tema.length < 3) {
        divResposta.innerHTML = '<p class="text-red-600 font-semibold">Por favor, informe pelo menos 3 caracteres para matéria e tema.</p>';
        divResposta.classList.add('text-red-600');
        btnGerarLista.disabled = false;
        btnGerarLista.innerHTML = 'Gerar Lista';
        return;
    }

    // Validar quantidade como número
    const numQuantidade = parseInt(quantidade);
    if (isNaN(numQuantidade) || numQuantidade <= 0 || numQuantidade > 20) { 
        divResposta.innerHTML = '<p class="text-red-600 font-semibold">Por favor, informe uma quantidade válida (ex: 1 a 20).</p>';
        divResposta.classList.add('text-red-600');
        btnGerarLista.disabled = false;
        btnGerarLista.innerHTML = 'Gerar Lista';
        return;
    }

    console.log('[enviarFormulario] Informações coletadas:', materia, tema, quantidade, dificuldade);


    // Prepara os dados no formato de objeto JSON esperado pelo backend.
    const dados = {
        materia: materia,
        tema: tema,
        quantidade: quantidade,
        dificuldade: dificuldade
    };
    console.log('[enviarFormulario] Dados preparados para API:', dados);

    // Inicia um bloco `try...catch...finally` para gerenciar erros durante a requisição e processamento.
    try {
        console.log('[enviarFormulario] Enviando requisição para API...');
        // Usa a Fetch API para enviar a requisição assíncrona.
        // `await` pausa a execução da função `enviarFormulario` até que a Promise retornada por `fetch` seja resolvida.
        const resposta = await fetch('http://backendestudai.vercel.app/estudar', { // URL do endpoint da sua API Flask.
            method: 'POST', // Define o método HTTP como POST.
            headers: {
                // Define o cabeçalho Content-Type para informar ao servidor que o corpo da requisição é JSON.
                'Content-Type': 'application/json'
            },
            // Converte o objeto JavaScript `dados` em uma string JSON para enviar no corpo da requisição.
            body: JSON.stringify(dados)
        });

        console.log('[enviarFormulario] Resposta da API recebida (Status: ' + resposta.status + ').');

        // `await resposta.json()` tenta ler o corpo da resposta e parseá-lo como JSON.
        // Esta operação também é assíncrona e pode falhar se a resposta não for JSON válido.
        const resultado = await resposta.json();
        console.log('[enviarFormulario] Resposta JSON parseada:', resultado); // Loga o objeto/array resultante do parsing.

         if (resposta.ok) { // Status 200-299
            renderizarLista(resultado);
            limparFormulario()
        } else { // Erros da API (4xx, 5xx)
            console.error('[enviarFormulario] API retornou erro:', resultado.error || resultado);
            let errorMsg = "Erro desconhecido da API.";
            if (resultado && resultado.error) {
                errorMsg = `Erro da API: ${resultado.error}`;
                if(resultado.details) errorMsg += ` Detalhes: ${resultado.details}`;
            } else if (typeof resultado === 'string') {
                errorMsg = resultado;
            }
            divResposta.innerHTML = `<p class="text-red-600 font-semibold">${errorMsg}</p>`;
            divResposta.classList.add('text-red-600');
        }
        // Garante que a divResposta volte ao alinhamento à esquerda após o carregamento ou erro
        divResposta.className = 'response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto';


    } catch (error) {
        // Este bloco `catch` é executado se ocorrer qualquer erro durante o bloco `try` que não foi tratado internamente,
        // como erros de rede (servidor offline, CORS bloqueado) ou falha ao parsear a resposta como JSON.
        console.error('[enviarFormulario] Erro no Fetch ou parsing JSON:', error);
        // Exibe uma mensagem de erro genérica na área de resposta com os detalhes do erro capturado.
        divResposta.innerHTML = `<p class="text-red-600 font-semibold">Ocorreu um erro ao tentar comunicar com o servidor: ${error.message}</p>`;
        divResposta.classList.add('text-red-600');
         // Adiciona classe para cor vermelha.
        // Garante que as classes da área de resposta estejam corretas.
        divResposta.className = 'response bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-left max-w-xl mx-auto';


    } finally {
        // O bloco `finally` é executado SEMPRE, independentemente de ter ocorrido um erro ou não no bloco `try`.
        // É ideal para código de limpeza, como reabilitar botões ou esconder indicadores de carregamento.
        // Reabilita o botão "Gerar Receita".
        btnGerarLista.disabled = false;
        // Restaura o texto original do botão.
        btnGerarLista.innerHTML = 'Gerar Lista';
        divResposta.classList.remove('hidden');
        console.log('[enviarFormulario] Finalizado.');
    }
}

/**
 * @description Este é o ponto de entrada principal do script. Ele espera o DOM carregar,
 * obtém referências aos botões e anexa os event listeners apropriados.
 */
// Adiciona um listener ao evento 'DOMContentLoaded'. Este evento é disparado quando o
// documento HTML foi completamente carregado e parseado (o DOM está pronto).
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado.');
    // Anexa um event listener de 'click' ao botão "Gerar Receita".
    // Quando clicado, a função assíncrona `enviarFormulario` será executada.
    btnGerarLista.addEventListener('click', enviarFormulario); // btnGerarLista já foi obtido globalmente
    console.log('Event listener adicionado ao botão "Gerar Receita".');
});