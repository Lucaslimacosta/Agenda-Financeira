// js/ui.js

export function abrirModalCentralizado(titulo, conteudoHtml) {
    // Remove qualquer modal centralizado existente para evitar duplicatas
    const modalExistente = document.getElementById('modal-centralizado');
    if (modalExistente) {
        modalExistente.remove();
    }

    const modalId = 'modal-centralizado';
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-confirmacao'; // Reutilizando o estilo do modal de confirmação que já é centralizado

    modal.innerHTML = `
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <h3 style="color: var(--dourado); margin: 0;">${titulo}</h3>
            <button onclick="document.getElementById('${modalId}').remove()" class="fechar-btn" style="background: none; border: none; color: var(--dourado); font-size: 24px; cursor: pointer;">×</button>
        </div>
        <div class="modal-body" style="margin-top: 15px; width: 100%;">
            ${conteudoHtml}
        </div>
    `;

    document.body.appendChild(modal);
}

export function mostrarToast(mensagem, tipo = 'info') {
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }

    const toast = document.createElement('div');
    toast.classList.add('toast');
    
    switch(tipo) {
        case 'sucesso': toast.style.borderColor = '#28A745'; break;
        case 'erro': toast.style.borderColor = '#DC3545'; break;
        case 'aviso': toast.style.borderColor = '#FFC107'; break;
        default: toast.style.borderColor = 'var(--dourado)';
    }

    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.remove();
        }
    }, 3000);
}

// Funções genéricas de modal
export function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        // Modais diferentes têm 'display' diferentes
        if (modalId === 'modal-personalizar' || modalId === 'modal' || modalId === 'modal-eventos') {
             modal.style.display = 'flex';
        } else {
             modal.style.display = 'block';
        }
    }
}

export function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funções específicas de fechar modal (para limpar campos, etc.)
export function fecharModalEventosDia() {
    fecharModal('modal-eventos');
}

export function fecharModalNovoEvento() {
    fecharModal('modal');
    document.getElementById('evento-descricao').value = '';
    document.getElementById('evento-valor').value = '';
    // Limpar campos do cartão, se existirem
    const parcelas = document.getElementById('evento-parcelas');
    if (parcelas) parcelas.value = '1';
    const vencimento = document.getElementById('evento-vencimento');
    if (vencimento) vencimento.value = '10';
}

export function fecharModalPersonalizar() {
    fecharModal('modal-personalizar');
}

export function fecharModalEditar() {
    fecharModal('modal-editar');
    // Limpar campos do modal de edição
    document.getElementById('evento-descricao-editar').value = '';
    document.getElementById('evento-valor-editar').value = '';
    document.getElementById('evento-data-editar').value = '';
    document.getElementById('evento-hora-editar').value = '';
    // Limpar campos do cartão, se existirem
    const parcelas = document.getElementById('evento-parcelas-editar');
    if (parcelas) parcelas.value = '1';
    const vencimento = document.getElementById('evento-vencimento-editar');
    if (vencimento) vencimento.value = '10';
    // Limpar referência do evento sendo editado
    // Nota: eventoEditando é uma variável local em events.js, não podemos acessá-la diretamente aqui
    // Mas como estamos fechando o modal, ela será limpa na função atualizarEvento
}
