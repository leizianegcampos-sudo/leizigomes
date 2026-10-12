const numeroWhatsApp = '5521977801823';
const hospedagemEstatica = window.location.hostname.endsWith('.github.io');
const apiAgendamentos = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/agendamentos'
    : '/api/agendamentos';

if (hospedagemEstatica) {
    document.getElementById('clientes').hidden = true;
    const linkClientes = document.querySelector('nav a[href="#clientes"]');
    if (linkClientes) linkClientes.closest('li').hidden = true;
    document.querySelector('.aviso-whatsapp').textContent =
        'Seu pedido será enviado pelo WhatsApp. Os agendamentos não ficam salvos no site.';
}

function abrirWhatsAppComMensagem(mensagem) {
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
    return urlWhatsApp;
}

function criarMensagemAgendamento({ nome, telefone, servico, data, horario }) {
    const dataFormatada = data.split('-').reverse().join('/');
    return `Olá! 👋\n\nGostaria de agendar um serviço de estética:\n\n📋 *Dados do Agendamento:*\n👤 Nome: ${nome}\n📱 Telefone: ${telefone}\n💆 Serviço: ${servico}\n📅 Data: ${dataFormatada}\n⏰ Horário: ${horario}\n\nPor favor, confirme a disponibilidade.`;
}

function adicionarAgendamentoNaTabela(agendamento) {
    const tabela = document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0];
    const novaLinha = tabela.insertRow();
    const dataFormatada = agendamento.data.split('-').reverse().join('/');

    [agendamento.nome, agendamento.telefone, agendamento.servico, dataFormatada, agendamento.horario]
        .forEach(function(valor) {
            novaLinha.insertCell().textContent = valor;
        });
}

function atualizarTabela(agendamentos) {
    const tabela = document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0];
    tabela.innerHTML = '';
    agendamentos.forEach(adicionarAgendamentoNaTabela);
    document.getElementById('total-clientes').textContent = agendamentos.length;
}

async function carregarAgendamentos() {
    const resposta = await fetch(apiAgendamentos);
    if (!resposta.ok) throw new Error('Não foi possível carregar os agendamentos.');
    atualizarTabela(await resposta.json());
}

document.getElementById('form-agendamento').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const servicoSelect = document.getElementById('servico');
    const servico = servicoSelect.options[servicoSelect.selectedIndex].text;
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;

    const dados = { nome, telefone, servico, data, horario };

    if (hospedagemEstatica) {
        abrirWhatsAppComMensagem(criarMensagemAgendamento(dados));
        document.getElementById('form-agendamento').reset();
        return;
    }

    try {
        const resposta = await fetch(apiAgendamentos, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            const erro = await resposta.json();
            throw new Error(erro.erro || 'Não foi possível salvar o agendamento.');
        }

        adicionarAgendamentoNaTabela(await resposta.json());
        document.getElementById('total-clientes').textContent =
            document.getElementById('tabela-clientes').getElementsByTagName('tbody')[0].rows.length;
    } catch (erro) {
        alert(erro.message);
        return;
    }

    abrirWhatsAppComMensagem(criarMensagemAgendamento(dados));

    // Limpar formulário
    document.getElementById('form-agendamento').reset();
});

if (!hospedagemEstatica) {
    carregarAgendamentos().catch(function(erro) {
        console.error(erro);
    });
}

const chatToggle = document.getElementById('chat-toggle');
const chatWidget = document.getElementById('chat-widget');
const chatClose = document.getElementById('chat-close');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatBody = document.getElementById('chat-body');

function appendMessage(message, type) {
    const div = document.createElement('div');
    div.className = `message ${type}-message`;
    div.textContent = message;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function extrairDadosDoTexto(texto) {
    const resultado = {
        servico: '',
        data: '',
        horario: ''
    };
    const textoNormalizado = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (textoNormalizado.includes('drenagem')) resultado.servico = 'Drenagem Linfática';
    else if (textoNormalizado.includes('redux')) resultado.servico = 'Massagem Redux';
    else if (textoNormalizado.includes('auriculo')) resultado.servico = 'Auriculoterapia';
    else if (textoNormalizado.includes('clareamento')) resultado.servico = 'Clareamento Personalizado';
    else if (textoNormalizado.includes('detox') || textoNormalizado.includes('tratamento facial')) {
        resultado.servico = 'Tratamentos & Detox Facial';
    } else if (textoNormalizado.includes('depilacao')) resultado.servico = 'Depilação a Cera';
    else if (textoNormalizado.includes('limpeza')) resultado.servico = 'Limpeza de Pele';
    else if (textoNormalizado.includes('massagem')) resultado.servico = 'Massagem Relaxante & Terapêutica';

    const matchData = texto.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})/);
    if (matchData) {
        resultado.data = matchData[0].replace('/', '/');
    }

    const matchHorario = texto.match(/(\d{1,2}:\d{2})/);
    if (matchHorario) {
        resultado.horario = matchHorario[1];
    }

    return resultado;
}

function responderIA(mensagem) {
    const texto = mensagem.toLowerCase();

    if (texto.includes('agendar') || texto.includes('horario') || texto.includes('horário')) {
        const dados = extrairDadosDoTexto(mensagem);
        let mensagemAgendamento = 'Olá! Gostaria de agendar um serviço de estética.\n\n📋 Dados do cliente:\n';

        if (dados.servico) {
            mensagemAgendamento += `💆 Serviço: ${dados.servico}\n`;
        }

        if (dados.data) {
            mensagemAgendamento += `📅 Data: ${dados.data}\n`;
        }

        if (dados.horario) {
            mensagemAgendamento += `⏰ Horário: ${dados.horario}\n`;
        }

        mensagemAgendamento += `\nMensagem do cliente: ${mensagem}`;
        abrirWhatsAppComMensagem(mensagemAgendamento);
        return 'Perfeito! Vou encaminhar seu agendamento para o WhatsApp da profissional.';
    }

    if (texto.includes('serviço') || texto.includes('servico') || texto.includes('tratamento')) {
        return 'Ofereço cuidados faciais (limpeza de pele, detox e clareamento), corporais (drenagem, Massagem Redux, massagem relaxante e terapêutica, e auriculoterapia) e depilação a cera. Qual gostaria de conhecer melhor?';
    }

    if (texto.includes('preço') || texto.includes('valor') || texto.includes('quanto')) {
        return 'Os valores podem variar conforme o tratamento escolhido. Para saber o valor exato, fale com a equipe pelo WhatsApp.';
    }

    if (texto.includes('local') || texto.includes('endereço') || texto.includes('onde')) {
        return 'Estamos localizados em Inhaúma - RJ. Posso te ajudar com mais detalhes.';
    }

    if (texto.includes('massagem')) {
        return 'A massagem relaxante e terapêutica combina técnicas, ventosaterapia ou pedras quentes para promover descanso e aliviar tensões da rotina.';
    }

    if (texto.includes('drenagem')) {
        return 'A drenagem linfática é uma técnica suave e ritmada voltada a estimular o sistema linfático e aliviar a sensação de inchaço e peso nas pernas.';
    }

    if (texto.includes('redux')) {
        return 'A Massagem Redux usa manobras vigorosas e ritmadas, planejadas de acordo com suas necessidades e seu bem-estar.';
    }

    if (texto.includes('auriculo')) {
        return 'A auriculoterapia estimula pontos específicos da orelha. O atendimento é individualizado conforme suas necessidades.';
    }

    if (texto.includes('clareamento')) {
        return 'O clareamento personalizado é definido após avaliação individualizada, considerando as necessidades de cada pele e região.';
    }

    if (texto.includes('detox') || texto.includes('tratamento facial')) {
        return 'Os tratamentos e o detox facial usam ativos selecionados sob medida para as necessidades que sua pele apresenta no dia.';
    }

    if (texto.includes('pele') || texto.includes('limpeza')) {
        return 'Os cuidados faciais são definidos após avaliar as necessidades da sua pele e podem incluir limpeza, detox ou clareamento personalizado.';
    }

    if (texto.includes('depilação') || texto.includes('depilacao')) {
        return 'A depilação a cera é realizada com atenção ao conforto e à sensibilidade da pele em cada região.';
    }

    if (texto.includes('oi') || texto.includes('olá') || texto.includes('ola')) {
        return 'Olá! Como posso ajudar você hoje?';
    }

    if (texto.includes('obrigado') || texto.includes('valeu')) {
        return 'Foi um prazer ajudar! Se quiser, posso orientar sobre serviços ou agendamento.';
    }

    return 'Posso te ajudar com agendamento, serviços, horários e localização. Me diga o que você precisa.';
}

chatToggle.addEventListener('click', function() {
    chatWidget.classList.toggle('open');
    if (chatWidget.classList.contains('open')) {
        chatInput.focus();
    }
});

chatClose.addEventListener('click', function() {
    chatWidget.classList.remove('open');
});

chatForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const mensagem = chatInput.value.trim();
    if (!mensagem) return;

    appendMessage(mensagem, 'user');
    chatInput.value = '';

    setTimeout(function() {
        const resposta = responderIA(mensagem);
        appendMessage(resposta, 'bot');
    }, 500);
});