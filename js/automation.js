// js/automation.js
import { addEvento, deleteEvento, state, eventos, salvarEventos } from './state.js';

export const AutomationManager = {
    // Estado interno
    automations: [],

    // Inicialização
    async init() {
        this.loadAutomations();
        this.setupEventListeners();
        this.ensureEventsGenerated();
    },

    // Carregar automações salvas
    loadAutomations() {
        // Não carregar do localStorage
        this.automations = [];
    },

    // Salvar automações
    saveAutomations() {
        // Não salvar no localStorage
    },

    // Configurar event listeners
    setupEventListeners() {
        // Escutar mudanças no calendário (mudança de mês)
        window.addEventListener('monthChanged', () => {
            setTimeout(() => this.ensureEventsGenerated(), 100);
        });
    },

    // Criar nova automação
    createAutomation(automationData) {
        const automation = {
            id: `automation-${Date.now()}`,
            name: automationData.name,
            type: automationData.type,
            active: true,
            eventData: automationData.eventData,
            recurrence: {
                frequency: automationData.recurrence.frequency,
                startDate: automationData.recurrence.startDate,
                endDate: automationData.recurrence.endDate || null // Data de fim opcional
            },
            cardData: automationData.cardData || null,
            generatedEvents: [],
            createdAt: new Date().toISOString(),
            lastGenerated: new Date().toISOString()
        };

        this.automations.push(automation);
        this.saveAutomations();

        // Gerar eventos iniciais
        this.generateEventsForAutomation(automation);

        // Disparar evento para atualizar a UI imediatamente
        document.dispatchEvent(new Event('eventosUpdated'));

        return automation;
    },

    // Atualizar automação
    updateAutomation(automation) {
        const index = this.automations.findIndex(a => a.id === automation.id);
        if (index !== -1) {
            this.automations[index] = automation;
            this.saveAutomations();
        }
    },

    // Excluir automação
    deleteAutomation(automationId) {
        const automation = this.automations.find(a => a.id === automationId);
        if (automation) {
            // Remover todos os eventos associados a esta automação do calendário e relatórios
            for (const date in state.events) {
                state.events[date] = state.events[date].filter(event =>
                    !(event.automation && event.automation.ruleId === automationId)
                );
                // Se a data não tiver mais eventos, remover a entrada
                if (state.events[date].length === 0) {
                    delete state.events[date];
                }
            }

            // Salvar os eventos atualizados
            salvarEventos();

            // Remover automação
            this.automations = this.automations.filter(a => a.id !== automationId);
            this.saveAutomations();

            // Disparar evento para atualizar a UI imediatamente
            document.dispatchEvent(new Event('eventosUpdated'));
        }
    },



    // Gerar eventos para uma automação
    generateEventsForAutomation(automation, untilDate = null) {
        if (!automation.active) return;

        const endDate = untilDate || new Date();
        endDate.setMonth(endDate.getMonth() + 6); // Próximos 6 meses

        const events = this.generateRecurringEvents(automation, endDate);

        // Adicionar eventos ao estado, evitando duplicatas
        events.forEach(event => {
            // Verificar se já existe um evento nesta data para esta automação
            const existingEvents = state.events[event.date] || [];
            const alreadyExists = existingEvents.some(e =>
                e.automation && e.automation.ruleId === automation.id &&
                e.date === event.date &&
                e.titulo === event.titulo
            );

            if (!alreadyExists) {
                addEvento(event.date, event);
                automation.generatedEvents.push(event.id);
            }
        });

        automation.lastGenerated = new Date().toISOString();
        this.saveAutomations();
    },

    // Algoritmo de geração de eventos recorrentes
    generateRecurringEvents(automation, endDate) {
        const events = [];
        let currentDate = new Date(automation.recurrence.startDate);
        let occurrenceCount = 0;

        // Se não há data de fim, limitar a 2 anos para evitar loop infinito
        const maxEndDate = automation.recurrence.endDate
            ? new Date(automation.recurrence.endDate)
            : new Date(currentDate.getFullYear() + 2, currentDate.getMonth(), currentDate.getDate());

        const actualEndDate = endDate < maxEndDate ? endDate : maxEndDate;

        while (currentDate <= actualEndDate) {
            // Criar evento
            const event = {
                id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                tipo: automation.type,
                titulo: automation.eventData.title,
                valor: automation.eventData.value,
                descricao: automation.eventData.description || automation.eventData.title,
                date: this.formatDate(currentDate),
                automation: {
                    ruleId: automation.id,
                    ruleName: automation.name,
                    isRecurring: true,
                    occurrenceNumber: occurrenceCount + 1
                }
            };

            // Apenas eventos normais, entrada e saída - sem cartão
            events.push(event);
            occurrenceCount++;

            // Próxima ocorrência
            currentDate = this.calculateNextOccurrence(currentDate, automation.recurrence);

            // Prevenção de loop infinito
            if (occurrenceCount > 1000) break;
        }

        return events;
    },

    // Calcular próxima ocorrência
    calculateNextOccurrence(currentDate, recurrence) {
        const next = new Date(currentDate);

        switch (recurrence.frequency) {
            case 'daily':
                next.setDate(next.getDate() + 1); // Sempre +1 dia
                break;

            case 'weekly':
                next.setDate(next.getDate() + 7); // Sempre +7 dias
                break;

            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                // Manter o mesmo dia do mês
                break;

            case 'yearly':
                next.setFullYear(next.getFullYear() + 1);
                break;
        }

        return next;
    },

    // Método removido - não há mais cartão

    // Garantir que eventos estão gerados para os próximos meses
    ensureEventsGenerated() {
        const sixMonthsAhead = new Date();
        sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

        this.automations.forEach(automation => {
            if (!automation.active) return;

            const lastGenerated = new Date(automation.lastGenerated);
            if (sixMonthsAhead > lastGenerated) {
                this.generateEventsForAutomation(automation, sixMonthsAhead);
            }
        });
    },

    // Remover eventos futuros de uma automação
    removeFutureEvents(automation) {
        const today = new Date();
        automation.generatedEvents = automation.generatedEvents.filter(eventId => {
            // Find the event across all dates
            let event = null;
            for (const date in state.events) {
                event = state.events[date].find(e => e.id === eventId);
                if (event) break;
            }

            if (event) {
                const eventDate = new Date(event.date);
                if (eventDate >= today) {
                    deleteEvento(eventId);
                    return false; // Remover da lista
                }
            }
            return true; // Manter na lista
        });
        this.saveAutomations();
    },

    // Editar evento recorrente
    editRecurringEvent(event, editMode, newData) {
        const automation = this.automations.find(a => a.id === event.automation.ruleId);
        if (!automation) return;

        switch (editMode) {
            case 'this-only':
                // Romper vínculo e editar apenas este
                delete event.automation;
                Object.assign(event, newData);
                state.updateEvent(event);
                break;

            case 'this-and-future':
                // Criar nova automação a partir desta data
                const newAutomation = {
                    ...automation,
                    id: `automation-${Date.now()}`,
                    recurrence: {
                        ...automation.recurrence,
                        startDate: event.date
                    },
                    eventData: newData
                };

                // Desativar futuros da automação antiga
                this.deactivateFutureEvents(automation, event.date);

                // Criar nova automação
                this.automations.push(newAutomation);
                this.saveAutomations();
                this.generateEventsForAutomation(newAutomation);
                break;

            case 'all':
                // Editar toda a série
                automation.eventData = newData;
                // Atualizar todos eventos gerados
                automation.generatedEvents.forEach(eventId => {
                    // Find the event across all dates
                    let e = null;
                    for (const date in state.events) {
                        e = state.events[date].find(ev => ev.id === eventId);
                        if (e) break;
                    }

                    if (e) Object.assign(e, newData);
                });
                this.saveAutomations();
                break;
        }
    },

    // Desativar eventos futuros
    deactivateFutureEvents(automation, fromDate) {
        const startDate = new Date(fromDate);
        automation.generatedEvents.forEach(eventId => {
            // Find the event across all dates
            let event = null;
            for (const date in state.events) {
                event = state.events[date].find(e => e.id === eventId);
                if (event) break;
            }

            if (event) {
                const eventDate = new Date(event.date);
                if (eventDate >= startDate) {
                    deleteEvento(eventId);
                }
            }
        });
        automation.generatedEvents = automation.generatedEvents.filter(eventId => {
            // Find the event across all dates
            let event = null;
            for (const date in state.events) {
                event = state.events[date].find(e => e.id === eventId);
                if (event) break;
            }

            return event && new Date(event.date) < startDate;
        });
        this.saveAutomations();
    },

    // Excluir evento recorrente
    deleteRecurringEvent(event, deleteMode) {
        const automation = this.automations.find(a => a.id === event.automation.ruleId);
        if (!automation) return;

        switch (deleteMode) {
            case 'this-only':
                // Apenas este evento - desativar apenas esta ocorrência
                deleteEvento(event.id);
                automation.generatedEvents = automation.generatedEvents.filter(id => id !== event.id);
                this.saveAutomations();
                break;

            case 'this-and-future':
                // Este e futuros
                this.deactivateFutureEvents(automation, event.date);
                break;

            case 'all':
                // Toda a série
                this.deleteAutomation(automation.id);
                break;
        }

        // Disparar evento para atualizar a UI imediatamente
        document.dispatchEvent(new Event('eventosUpdated'));
    },

    // Obter automações ativas
    getActiveAutomations() {
        return this.automations.filter(a => a.active);
    },

    // Obter todas as automações
    getAllAutomations() {
        return this.automations;
    },

    // Pré-visualizar eventos
    previewAutomation(automationData) {
        const previewAutomation = {
            ...automationData,
            id: 'preview',
            active: true,
            generatedEvents: [],
            createdAt: new Date().toISOString(),
            lastGenerated: new Date().toISOString()
        };

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 meses de preview

        return this.generateRecurringEvents(previewAutomation, endDate);
    },

    // Utilitário para formatar data
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
};
