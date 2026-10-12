const linkWhatsApp = 'https://wa.me/message/DGO24NEAZGTFE1';
const hospedagemEstatica = window.location.hostname.endsWith('.github.io');
const apiAgendamentos = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api/agendamentos'
    : '/api/agendamentos';

if (hospedagemEstatica) {
    document.querySelector('.aviso-whatsapp').textContent =
        'Seu pedido será enviado pelo WhatsApp. Os agendamentos não ficam salvos no site.';
}

function abrirWhatsApp() {
    window.open(linkWhatsApp, '_blank', 'noopener,noreferrer');
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
        abrirWhatsApp();
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

    } catch (erro) {
        alert(erro.message);
        return;
    }

    abrirWhatsApp();

    // Limpar formulário
    document.getElementById('form-agendamento').reset();
});

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

function responderIA(mensagem) {
    const texto = mensagem.toLowerCase();

    if (texto.includes('agendar') || texto.includes('horario') || texto.includes('horário')) {
        abrirWhatsApp();
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
    abrirWhatsApp();
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