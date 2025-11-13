// js/main.js

// ImportaÃ§Ãµes de MÃ³dulos
// O "./" significa "na mesma pasta que eu (main.js)"
import { atualizarCalendario, mesAnterior, proximoMes } from './calendar.js';
import {
    mostrarEventosDia, abrirModalNovoEvento, salvarEvento, atualizarCamposEvento,
    abrirModalApagar, confirmarExclusao, apagarDadosMes
} from './events.js';
import { gerarRelatorioMensal, gerarRelatorioAnual } from './reports.js';
import {
    carregarConfiguracoesPersonalizadas, abrirModalPersonalizar, salvarPersonalizacao,
    restaurarConfiguracoes, adicionarLogo, adicionarFundo, aplicarTema
} from './customizations.js';
import {
    fecharModalEventosDia, fecharModalNovoEvento, fecharModalPersonalizar
} from './ui.js';
import { diaSelecionado } from './state.js'; // Importa o estado
import { AutomationManager } from './automation.js';

// --- INICIALIZAÃ‡ÃƒO ---

// Esconde a tela de carregamento
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}, 2000);

// Carrega configuraÃ§Ãµes e renderiza o calendÃ¡rio inicial
// Removido pois foi movido para o final do arquivo

// --- PONTE ENTRE MÃ“DULOS (Ouvintes de Eventos) ---

// Ouve o evento 'diaClicado' disparado pelo calendar.js
document.addEventListener('diaClicado', (e) => {
    if (e.detail && e.detail.dia) {
        mostrarEventosDia(e.detail.dia);
    }
});

// Ouve o evento 'eventosUpdated' disparado pelo events.js
document.addEventListener('eventosUpdated', () => {
    atualizarCalendario();
    // Se o modal de eventos do dia estiver aberto, atualiza-o
    if (document.getElementById('modal-eventos').style.display === 'block') {
        mostrarEventosDia(diaSelecionado);
    }
});

// --- EXPÃ•E FUNÃ‡Ã•ES PARA O HTML (onclick) ---
// Para os atributos 'onclick=""' no HTML funcionarem com mÃ³dulos,
// eles precisam de acesso global (no objeto 'window').
window.mesAnterior = mesAnterior;
window.proximoMes = proximoMes;
window.abrirModalPersonalizar = abrirModalPersonalizar;
window.fecharModalPersonalizar = fecharModalPersonalizar;
window.salvarPersonalizacao = salvarPersonalizacao;
window.restaurarConfiguracoes = restaurarConfiguracoes;
window.adicionarLogo = adicionarLogo;
window.adicionarFundo = adicionarFundo;

window.fecharModalEventosDia = fecharModalEventosDia;
window.abrirModalNovoEvento = abrirModalNovoEvento;

window.gerarRelatorioMensal = gerarRelatorioMensal;
window.gerarRelatorioAnual = gerarRelatorioAnual;
window.apagarDadosMes = apagarDadosMes;

window.fecharModal = fecharModalNovoEvento; // 'fecharModal()' no HTML
window.salvarEvento = salvarEvento;
window.atualizarCamposEvento = atualizarCamposEvento;

window.abrirModalApagar = abrirModalApagar;
window.confirmarExclusao = confirmarExclusao;
window.aplicarTema = aplicarTema;

// Função para atualizar campos da automação
window.atualizarCamposAutomacao = () => {
    const type = document.getElementById('automation-type').value;
    const cardFields = document.getElementById('card-fields');
    cardFields.style.display = type === 'cartao' ? 'block' : 'none';
};

// Funções para automação
window.abrirModalFuncionalidades = () => {
    document.getElementById('modal-funcionalidades').style.display = 'flex';
};

window.fecharModalFuncionalidades = () => {
    document.getElementById('modal-funcionalidades').style.display = 'none';
};

window.abrirModalAutomacao = () => {
    document.getElementById('modal-automacao').style.display = 'flex';
    mostrarAba('criar');
    renderizarAutomacoes();
};

window.fecharModalAutomacao = () => {
    document.getElementById('modal-automacao').style.display = 'none';
};

window.mostrarAba = (aba) => {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[onclick="mostrarAba('${aba}')"]`).classList.add('active');
    document.getElementById(aba).classList.add('active');
};

window.createAutomation = () => {
    const formData = coletarDadosFormulario();
    if (!formData) return;

    AutomationManager.createAutomation(formData);
    renderizarAutomacoes();
    mostrarNotificacao('Automação criada com sucesso!', 'success');
};

window.editAutomation = (automationId) => {
    const automation = AutomationManager.getAllAutomations().find(a => a.id === automationId);
    if (!automation) return;

    // Preencher o formulário com os dados da automação
    document.getElementById('automation-title').value = automation.name;
    document.getElementById('automation-value').value = automation.eventData.value;
    document.getElementById('automation-description').value = automation.eventData.description;
    document.getElementById('automation-type').value = automation.type;
    document.getElementById('recurrence-frequency').value = automation.recurrence.frequency;
    document.getElementById('recurrence-start').value = automation.recurrence.startDate;
    document.getElementById('recurrence-end').value = automation.recurrence.endDate || '';

    // Mostrar campos do cartão se necessário
    const cardFields = document.getElementById('card-fields');
    cardFields.style.display = automation.type === 'cartao' ? 'block' : 'none';
    if (automation.type === 'cartao' && automation.cardData) {
        document.getElementById('card-installments').value = automation.cardData.installments;
        document.getElementById('card-due-day').value = automation.cardData.dueDay;
    }

    // Mudar o botão para "Atualizar"
    const submitBtn = document.getElementById('automation-submit-btn');
    submitBtn.innerHTML = '<span class="botao-texto">Atualizar Automação</span>';
    submitBtn.onclick = () => updateAutomation(automationId);

    // Mudar para a aba de criação
    mostrarAba('criar');
};

window.updateAutomation = (automationId) => {
    const formData = coletarDadosFormulario();
    if (!formData) return;

    const automation = AutomationManager.getAllAutomations().find(a => a.id === automationId);
    if (!automation) return;

    // Atualizar a automação com os novos dados
    automation.name = formData.name;
    automation.type = formData.type;
    automation.eventData = formData.eventData;
    automation.recurrence = formData.recurrence;
    automation.cardData = formData.cardData;

    // Atualizar TODOS os eventos existentes desta automação (passados e futuros)
    import('./state.js').then(({ state, salvarEventos }) => {
        for (const date in state.events) {
            state.events[date].forEach(event => {
                if (event.automation && event.automation.ruleId === automationId) {
                    // Atualizar propriedades do evento
                    event.titulo = automation.eventData.title;
                    event.descricao = automation.eventData.description || automation.eventData.title;
                    event.valor = automation.eventData.value;
                    event.tipo = automation.type;

                    // Atualizar informações da automação no evento
                    event.automation.ruleName = automation.name;
                }
            });
        }

        // Salvar os eventos atualizados
        salvarEventos();

        // Disparar evento para atualizar a UI imediatamente
        document.dispatchEvent(new Event('eventosUpdated'));
    });

    // Salvar a automação atualizada
    AutomationManager.updateAutomation(automation);

    // Limpar o formulário
    document.getElementById('automation-form').reset();
    const submitBtn = document.getElementById('automation-submit-btn');
    submitBtn.innerHTML = '<span class="botao-texto">Criar Automação</span>';
    submitBtn.onclick = createAutomation;

    renderizarAutomacoes();
    mostrarNotificacao('Automação atualizada com sucesso!', 'success');
};

function coletarDadosFormulario() {
    const title = document.getElementById('automation-title').value;
    const value = parseFloat(document.getElementById('automation-value').value);
    const description = document.getElementById('automation-description').value;
    const type = document.getElementById('automation-type').value;
    const frequency = document.getElementById('recurrence-frequency').value;
    const startDate = document.getElementById('recurrence-start').value;
    const endDate = document.getElementById('recurrence-end').value;

    if (!title || !value || !startDate) {
        mostrarNotificacao('Preencha os campos obrigatórios!', 'error');
        return null;
    }

    let cardData = null;
    if (type === 'cartao') {
        const installments = parseInt(document.getElementById('card-installments').value);
        const dueDay = parseInt(document.getElementById('card-due-day').value);
        cardData = { installments, dueDay };
    }

    return {
        name: title,
        type,
        eventData: { title, value, description },
        recurrence: {
            frequency,
            startDate,
            endDate: endDate || null // Data de fim opcional
        },
        cardData
    };
}

function renderizarPreview(events) {
    const previewList = document.getElementById('preview-list');
    previewList.innerHTML = events.slice(0, 10).map(event => `
        <div class="preview-list">
            <li>
                <span class="preview-date">${new Date(event.date).toLocaleDateString('pt-BR')}</span>
                <span class="preview-value">R$ ${event.value.toFixed(2)}</span>
            </li>
        </div>
    `).join('');

    if (events.length > 10) {
        previewList.innerHTML += '<div class="preview-more">... e mais eventos</div>';
    }
}

function renderizarAutomacoes() {
    const automationsList = document.getElementById('automations-list');
    const automations = AutomationManager.getAllAutomations();

    automationsList.innerHTML = automations.map(automation => `
        <div class="automation-card">
            <div class="automation-header">
                <h3>${automation.name}</h3>
                <span class="recurring-badge">🔄</span>
            </div>
            <div class="automation-info">
                <p><strong>Tipo:</strong> ${automation.type}</p>
                <p><strong>Valor:</strong> R$ ${automation.eventData.value.toFixed(2)}</p>
                <p><strong>Frequência:</strong> ${automation.recurrence.frequency}</p>
                <p><strong>Eventos gerados:</strong> ${automation.generatedEvents.length}</p>
            </div>
            <div class="automation-actions">
                <button onclick="editAutomation('${automation.id}')" class="edit-btn">
                    <span class="botao-texto">Editar</span>
                </button>
                <button class="danger" onclick="deleteAutomation('${automation.id}')">
                    <span class="botao-texto">Excluir</span>
                </button>
            </div>
        </div>
    `).join('');
}



window.deleteAutomation = (automationId) => {
    if (confirm('Tem certeza que deseja excluir esta automação? Todos os eventos gerados serão removidos.')) {
        AutomationManager.deleteAutomation(automationId);
        renderizarAutomacoes();
        mostrarNotificacao('Automação excluída com sucesso!', 'success');
    }
};

// Event listeners para campos dinâmicos
document.getElementById('automation-type').addEventListener('change', (e) => {
    const cardFields = document.getElementById('card-fields');
    cardFields.style.display = e.target.value === 'cartao' ? 'block' : 'none';
});

// Inicializar campos da automação ao carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoesPersonalizadas();
    atualizarCalendario();
    AutomationManager.init();
    atualizarCamposAutomacao(); // Inicializar campos da automação
});

// Função para mostrar notificações personalizadas
window.mostrarNotificacao = (message, type = 'info') => {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');

    // Definir cores baseadas no tipo
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };

    // Atualizar mensagem e cor
    messageElement.textContent = message;
    notification.style.borderColor = colors[type] || colors.info;

    // Mostrar notificação
    notification.style.display = 'block';

    // Auto-esconder após 5 segundos
    setTimeout(() => {
        fecharNotificacao();
    }, 5000);
};

// Função para fechar notificação
window.fecharNotificacao = () => {
    const notification = document.getElementById('notification');
    notification.style.animation = 'notificationFadeOut 0.5s ease-out forwards';

    setTimeout(() => {
        notification.style.display = 'none';
        notification.style.animation = '';
        // Reset transform to center position
        notification.style.transform = 'translate(-50%, -50%)';
    }, 500);
};

// --- REGISTRO DO SERVICE WORKER ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // O sw.js estÃ¡ na raiz, junto com o index.html
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('ServiceWorker registrado com sucesso'))
            .catch(err => console.log('Erro no registro do ServiceWorker:', err));
    });
}
