// js/state.js

// Exporta as variáveis de estado para que outros módulos possam importá-las
export let dataAtual = new Date();
export let diaSelecionado = null;
export let eventos = {};

// Export state object for compatibility
export const state = {
    events: eventos,

    // Método para atualizar evento específico
    updateEvent(updatedEvent) {
        // Encontrar o evento nos dados e atualizar
        for (const dateKey in eventos) {
            const eventIndex = eventos[dateKey].findIndex(e =>
                e.id === updatedEvent.id ||
                (e.descricao === updatedEvent.descricao &&
                 e.data === updatedEvent.data &&
                 e.hora === updatedEvent.hora)
            );
            if (eventIndex !== -1) {
                eventos[dateKey][eventIndex] = updatedEvent;
                salvarEventos();
                return true;
            }
        }
        return false;
    }
};

// Funções que alteram (mutam) o estado
export function setDataAtual(novaData) {
    dataAtual = novaData;
}

export function setDiaSelecionado(novoDia) {
    diaSelecionado = novoDia;
}

export function salvarEventos() {
    // Não salvar no localStorage
}

export function addEvento(dataStr, eventoObj) {
    if (!eventos[dataStr]) {
        eventos[dataStr] = [];
    }
    eventos[dataStr].push(eventoObj);
    salvarEventos();
}

export function deleteEvento(dataStr, index) {
    if (eventos[dataStr] && eventos[dataStr][index]) {
        const evento = eventos[dataStr][index];

        // No more cartao logic here - removed as requested

        // Remover o próprio evento (pai ou parcela individual)
        if (eventos[dataStr] && eventos[dataStr][index]) {
            eventos[dataStr].splice(index, 1);
            if (eventos[dataStr].length === 0) {
                delete eventos[dataStr];
            }
        }

        salvarEventos();
    }
}

// Remove todas as parcelas e o evento de compra vinculados a um parentId
export function deleteByParentId(parentId) {
    if (!parentId) return;
    Object.keys(eventos).forEach(dateKey => {
        // Filtrar eventos que não pertencem ao parentId
        eventos[dateKey] = eventos[dateKey].filter(ev => !(ev.parentId && ev.parentId === parentId));
        // Também remover o evento pai se estiver armazenado naquele dia
        eventos[dateKey] = eventos[dateKey].filter(ev => !(ev.id && ev.id === parentId));
        if (eventos[dateKey].length === 0) {
            delete eventos[dateKey];
        }
    });
    salvarEventos();
}

export function apagarEventosDoMes() {
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    Object.keys(eventos).forEach(data => {
        const [ano, mes] = data.split('-');
        if (parseInt(ano) === anoAtual && parseInt(mes) === mesAtual) {
            delete eventos[data];
        }
    });
    salvarEventos();
}