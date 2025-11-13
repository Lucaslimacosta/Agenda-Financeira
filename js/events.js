// js/events.js
import { dataAtual, diaSelecionado, eventos, setDiaSelecionado, addEvento, deleteEvento, apagarEventosDoMes, setDataAtual } from './state.js';
import { mostrarToast, fecharModalNovoEvento, abrirModal, fecharModalEditar, abrirModalCentralizado } from './ui.js';

export function mostrarEventosDia(dia) {
    setDiaSelecionado(dia);
    const dataStr = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    const modalData = document.getElementById('modal-data');
    const listaEventos = document.getElementById('lista-eventos-dia');

    modalData.textContent = `${dia} de ${dataAtual.toLocaleDateString('pt-BR', { month: 'long' })} de ${dataAtual.getFullYear()}`;
    listaEventos.innerHTML = '';

    // Coletar todos os eventos para esta data
    let eventosDoDia = [];

    // Eventos armazenados diretamente nesta data
    if (eventos[dataStr]) {
        eventosDoDia = eventosDoDia.concat(eventos[dataStr]);
    }

    // Eventos 'normal' que podem estar armazenados em outras datas mas agendados para esta data
    Object.keys(eventos).forEach(dateKey => {
        if (eventos[dateKey]) {
            eventos[dateKey].forEach(evento => {
                if (evento.tipo === 'normal' && evento.data === dataStr) {
                    eventosDoDia.push(evento);
                }
            });
        }
    });

    if (eventosDoDia.length > 0) {
        eventosDoDia.forEach((evento, index) => {
            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'evento-detalhes';

            switch (evento.tipo) {
                case 'entrada': eventoDiv.style.borderLeftColor = '#28a745'; break;
                case 'saida': eventoDiv.style.borderLeftColor = '#dc3545'; break;
                case 'normal': eventoDiv.style.borderLeftColor = '#007bff'; break;
            }

            // Indicação se for parcela vinculada
            let vinculoInfo = '';
            if (evento.parentId) {
                // tentar buscar a descrição do evento pai
                let parentDesc = '';
                Object.keys(eventos).some(dateKey => {
                    const found = (eventos[dateKey] || []).find(ev => ev.id && ev.id === evento.parentId);
                    if (found) {
                        parentDesc = found.descricao || '';
                        return true;
                    }
                    return false;
                });
                vinculoInfo = `<p style="font-size:13px;color:var(--dourado);">Parcela ${evento.parcelaIndex || ''} — vinculada a: ${parentDesc}</p>`;
            }

            let conteudo = `<h4>${evento.descricao}</h4>`;
            if (evento.valor) conteudo += `<p>Valor: R$ ${evento.valor}</p>`;
            if (evento.tipo === 'normal') conteudo += `<p>Horário: ${evento.hora}</p>`;
            conteudo += vinculoInfo;
            // Adicionar botão de editar para eventos elegíveis
            if (evento.tipo === 'normal' || evento.tipo === 'entrada' || evento.tipo === 'saida' || evento.tipo === 'cartao') {
                // Para eventos 'normal' que podem estar em outras datas, precisamos encontrar o dateKey correto
                let dateKeyParaEditar = dataStr;
                if (evento.tipo === 'normal' && evento.data !== dataStr) {
                    dateKeyParaEditar = evento.data;
                }
                const indexReal = eventos[dateKeyParaEditar].indexOf(evento);
                conteudo += `<button onclick="abrirModalEditar('${dateKeyParaEditar}', ${indexReal})" style="margin-right: 5px;">Editar</button>`;
            }
            // Para exclusão, usar a data onde o evento está armazenado
            let dateKeyParaExcluir = dataStr;
            if (evento.tipo === 'normal' && evento.data !== dataStr) {
                dateKeyParaExcluir = evento.data;
            }
            const indexRealExcluir = eventos[dateKeyParaExcluir].indexOf(evento);
            conteudo += `<button onclick="abrirModalApagar('${dateKeyParaExcluir}', ${indexRealExcluir})">Excluir</button>`;

            eventoDiv.innerHTML = conteudo;
            listaEventos.appendChild(eventoDiv);
        });
    } else {
        listaEventos.innerHTML = '<p>Nenhum evento para este dia.</p>';
    }

    abrirModal('modal-eventos');
}

export function abrirModalNovoEvento() {
    const dataModal = document.getElementById('modal-data').textContent;
    const [dia, , mes, , ano] = dataModal.split(' '); // "1 de janeiro de 2025"
    
    setDiaSelecionado(parseInt(dia));
    
    const mesesNomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesNumero = mesesNomes.indexOf(mes.toLowerCase()) + 1;
    
    const dataFormatada = `${ano}-${mesNumero.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
    
    document.getElementById('evento-data').value = dataFormatada;
    document.getElementById('evento-tipo').selectedIndex = 0;
    document.getElementById('data-selecionada').textContent = `Data Selecionada: ${dia} de ${mes} de ${ano}`;
    abrirModal('modal');
    atualizarCamposEvento();
}

export function atualizarCamposEvento() {
    const tipo = document.getElementById('evento-tipo').value;
    document.getElementById('campos-evento-normal').style.display = (tipo === 'normal') ? 'block' : 'none';
    document.getElementById('campos-evento-cartao').style.display = (tipo === 'cartao') ? 'block' : 'none';
    // Mostrar campo valor para entrada/saida/cartao
    document.getElementById('evento-valor').style.display = (tipo === 'entrada' || tipo === 'saida' || tipo === 'cartao') ? 'block' : 'none';
}

export function atualizarCamposEventoEditar() {
    const tipo = document.getElementById('evento-tipo-editar').value;
    document.getElementById('campos-evento-normal-editar').style.display = (tipo === 'normal') ? 'block' : 'none';
    document.getElementById('campos-evento-cartao-editar').style.display = (tipo === 'cartao') ? 'block' : 'none';
    // Mostrar campo valor para entrada/saida/cartao
    document.getElementById('evento-valor-editar').style.display = (tipo === 'entrada' || tipo === 'saida' || tipo === 'cartao') ? 'block' : 'none';
}

export function salvarEvento() {
    const descricao = document.getElementById('evento-descricao').value;
    const tipo = document.getElementById('evento-tipo').value;
    const dataStr = `${dataAtual.getFullYear()}-${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}-${diaSelecionado.toString().padStart(2, '0')}`;

    if (!descricao) {
        mostrarToast('Por favor, preencha a descrição do evento', 'erro');
        return;
    }

    let eventoObj = { descricao, tipo };

    if (tipo === 'entrada' || tipo === 'saida') {
        let valor = document.getElementById('evento-valor').value;
        if (!valor) {
            mostrarToast('Por favor, preencha o valor', 'erro');
            return;
        }
        valor = parseFloat(valor.replace(',', '.'));
        if (isNaN(valor)) {
            mostrarToast('Valor inválido.', 'erro');
            return;
        }
        eventoObj.valor = valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
    } else if (tipo === 'cartao') {
        let valor = document.getElementById('evento-valor').value;
        if (!valor) {
            mostrarToast('Por favor, preencha o valor', 'erro');
            return;
        }
        valor = parseFloat(valor.replace(',', '.'));
        if (isNaN(valor)) {
            mostrarToast('Valor inválido.', 'erro');
            return;
        }
        eventoObj.valor = valor % 1 === 0 ? valor.toString() : valor.toFixed(2);

        const parcelas = parseInt(document.getElementById('evento-parcelas').value) || 1;
        const vencimento = parseInt(document.getElementById('evento-vencimento').value) || 10;

        if (parcelas < 1) {
            mostrarToast('Número de parcelas deve ser pelo menos 1.', 'erro');
            return;
        }

        // Gerar ID único para o evento pai
        const parentId = Date.now().toString() + Math.random().toString(36).slice(2, 6);
        eventoObj.id = parentId;
        eventoObj.parcelas = parcelas;
        eventoObj.vencimento = vencimento;

        // Adicionar o evento pai (compra)
        addEvento(dataStr, eventoObj);

        // Gerar parcelas
        const valorParcela = valor / parcelas;
        const dataCompra = new Date(dataStr);
        for (let i = 1; i <= parcelas; i++) {
            const dataParcela = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, vencimento);
            const dataParcelaStr = `${dataParcela.getFullYear()}-${(dataParcela.getMonth() + 1).toString().padStart(2, '0')}-${dataParcela.getDate().toString().padStart(2, '0')}`;

            const parcelaObj = {
                descricao: `${descricao} - Parcela ${i}/${parcelas}`,
                tipo: 'saida',
                valor: (valorParcela % 1 === 0 ? valorParcela.toString() : valorParcela.toFixed(2)),
                parentId: parentId,
                parcelaIndex: i
            };

            addEvento(dataParcelaStr, parcelaObj);
        }

        // Dispara um evento para o 'main.js' atualizar o calendário
        document.dispatchEvent(new Event('eventosUpdated'));

        mostrarToast('Compra parcelada registrada com sucesso', 'sucesso');
        fecharModalNovoEvento();
        return;
    } else if (tipo === 'normal') {
        const hora = document.getElementById('evento-hora').value;
        const dataSelecionada = document.getElementById('evento-data').value;
        if (!hora) {
            mostrarToast('Por favor, preencha o horário do evento', 'erro');
            return;
        }
        if (!dataSelecionada) {
            mostrarToast('Por favor, selecione a data do evento', 'erro');
            return;
        }
        eventoObj.data = dataSelecionada;
        eventoObj.hora = hora;
    }

    // Para eventos normais, usar a data selecionada no formulário
    if (tipo === 'normal') {
        addEvento(eventoObj.data, eventoObj);
    } else {
        addEvento(dataStr, eventoObj);
    }

    // Dispara um evento para o 'main.js' atualizar o calendário
    document.dispatchEvent(new Event('eventosUpdated'));

    mostrarToast('Evento registrado com sucesso', 'sucesso');
    fecharModalNovoEvento();
}

export function abrirModalApagar(dataStr, index) {
    const evento = eventos[dataStr][index];
    const modalConfirmacao = document.createElement('div');
    const modalId = `modal-confirmacao-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    modalConfirmacao.id = modalId;
    modalConfirmacao.className = 'modal-confirmacao';

    // Se for parcela, oferecer opção de apagar só ela ou todas as parcelas vinculadas
    if (evento && evento.parentId) {
        // contar quantidade de parcelas vinculadas ao mesmo parentId
        const parentId = evento.parentId;
        const linkedCount = Object.keys(eventos).reduce((acc, dateKey) => {
            const list = eventos[dateKey] || [];
            return acc + list.filter(ev => ev.parentId && ev.parentId === parentId).length;
        }, 0);

        modalConfirmacao.innerHTML = `
            <h3 style="color: var(--dourado);">Confirmar Exclusão</h3>
            <p>Deseja apagar a parcela: <strong>${evento.descricao}</strong>?</p>
            ${evento.valor ? `<p>Valor: R$ ${evento.valor}</p>` : ''}
            <p style="color: var(--aviso);">Esta parcela pertence a uma compra com <strong>${linkedCount}</strong> parcela(s) no total.</p>
            <div>
                <button onclick="confirmarExclusao('${dataStr}', ${index}, '${modalId}', 'only')" style="background-color: #ff4444; margin-right:8px;">Apagar só esta parcela</button>
                <button onclick="confirmarExclusao('${dataStr}', ${index}, '${modalId}', 'all')" style="background-color: #ff4444;">Apagar todas as parcelas e a compra</button>
                <button onclick="document.getElementById('${modalId}').remove()" style="margin-left:8px;">Cancelar</button>
            </div>
        `;
        document.body.appendChild(modalConfirmacao);
        return;
    }

    // Caso padrão (evento não é parcela): comportamento anterior
    // No more cartao logic here - removed as requested
    let avisoParcela = '';

    modalConfirmacao.innerHTML = `
        <h3 style="color: var(--dourado);">Confirmar Exclusão</h3>
        <p>Deseja apagar: <strong>${evento.descricao}</strong></p>
        ${evento.valor ? `<p>Valor: R$ ${evento.valor}</p>` : ''}
        ${avisoParcela}
        <div>
            <button onclick="confirmarExclusao('${dataStr}', ${index}, '${modalId}')" style="background-color: #ff4444;">Confirmar</button>
            <button onclick="document.getElementById('${modalId}').remove()">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modalConfirmacao);
}

export function confirmarExclusao(dataStr, index, modalId, mode) {
    // mode: undefined => comportamento padrão (apagar o evento indicado)
    // mode === 'only' => apagar somente a parcela indicada
    // mode === 'all' => apagar todas as parcelas vinculadas e o evento de compra

    const evento = eventos[dataStr] && eventos[dataStr][index];

    if (mode === 'all' && evento && evento.parentId) {
        // Apagar todas as parcelas e o evento pai
        import('./state.js').then(({ deleteByParentId }) => {
            deleteByParentId(evento.parentId);
            document.dispatchEvent(new Event('eventosUpdated'));
            if (modalId) {
                const m = document.getElementById(modalId);
                if (m) m.remove();
            }
            mostrarToast('Compra e todas as parcelas excluídas com sucesso', 'sucesso');
        });
        return;
    }

    // Caso de apagar somente a parcela ou apagar o evento indicado
    deleteEvento(dataStr, index);
    document.dispatchEvent(new Event('eventosUpdated'));
    // Remover o modal específico, se informado
    if (modalId) {
        const m = document.getElementById(modalId);
        if (m) m.remove();
    }
    mostrarToast('Evento excluído com sucesso', 'sucesso');
}

let eventoEditando = null; // Variável para armazenar o evento sendo editado

export function abrirModalEditar(dataStr, index) {
    const evento = eventos[dataStr] && eventos[dataStr][index];
    if (!evento) return;

    // Verificar se é evento de automação
    if (evento.automation && evento.automation.ruleId) {
        abrirModalCentralizado('Aviso', '<p>Eventos de automação não podem ser editados diretamente no calendário. Use o painel de automações para editar.</p>');
        return;
    }

    // Verificar se é parcela vinculada - não permitir edição direta
    if (evento.parentId) {
        abrirModalCentralizado('Aviso', '<p>Parcelas não podem ser editadas diretamente. Edite a compra original.</p>');
        return;
    }

    // Verificar se é evento de cartão - não permitir edição direta
    if (evento.tipo === 'cartao') {
        abrirModalCentralizado('Aviso', '<p>Eventos de cartão não podem ser editados diretamente. Só é possível editar eventos de agendamento, entrada ou saída.</p>');
        return;
    }

    // Armazenar referência do evento sendo editado
    eventoEditando = { dataStr, index, evento };

    // Preencher o modal de edição com dados do evento
    document.getElementById('evento-descricao-editar').value = evento.descricao || '';
    document.getElementById('evento-tipo-editar').value = evento.tipo;
    document.getElementById('evento-valor-editar').value = evento.valor || '';

    if (evento.tipo === 'normal') {
        document.getElementById('evento-data-editar').value = evento.data || dataStr;
        document.getElementById('evento-hora-editar').value = evento.hora || '';
    } else if (evento.tipo === 'cartao') {
        document.getElementById('evento-parcelas-editar').value = evento.parcelas || 1;
        document.getElementById('evento-vencimento-editar').value = evento.vencimento || 10;
    }

    // Atualizar campos visíveis no modal de edição
    atualizarCamposEventoEditar();

    // Mostrar data selecionada no modal de edição
    const [ano, mes, dia] = dataStr.split('-');
    const dataFormatada = `${dia} de ${new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { month: 'long' })} de ${ano}`;
    document.getElementById('data-selecionada-editar').textContent = `Data Selecionada: ${dataFormatada}`;

    // Mostrar modal de edição
    abrirModal('modal-editar');
}

export function atualizarEvento() {
    if (!eventoEditando) {
        mostrarToast('Erro: Nenhum evento selecionado para edição', 'erro');
        return;
    }

    const { dataStr, index, evento } = eventoEditando;

    // Obter dados do modal de edição
    const descricao = document.getElementById('evento-descricao-editar').value;
    const tipo = document.getElementById('evento-tipo-editar').value;

    if (!descricao) {
        mostrarToast('Por favor, preencha a descrição do evento', 'erro');
        return;
    }

    // Se o tipo mudou para cartao, não permitir edição direta - seria complexo demais
    if (tipo === 'cartao' && evento.tipo !== 'cartao') {
        mostrarToast('Não é possível alterar o tipo para compra parcelada. Crie um novo evento.', 'erro');
        return;
    }

    // Se era cartao e mudou para outro tipo, deletar parcelas e criar novo evento
    if (evento.tipo === 'cartao' && tipo !== 'cartao') {
        // Deletar todas as parcelas e o evento pai
        import('./state.js').then(({ deleteByParentId }) => {
            deleteByParentId(evento.id);
            // Criar novo evento simples
            const novoEvento = { descricao, tipo };
            if (tipo === 'entrada' || tipo === 'saida') {
                let valor = document.getElementById('evento-valor-editar').value;
                if (!valor) {
                    mostrarToast('Por favor, preencha o valor', 'erro');
                    return;
                }
                valor = parseFloat(valor.replace(',', '.'));
                if (isNaN(valor)) {
                    mostrarToast('Valor inválido.', 'erro');
                    return;
                }
                novoEvento.valor = valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
            } else if (tipo === 'normal') {
                const hora = document.getElementById('evento-hora-editar').value;
                if (!hora) {
                    mostrarToast('Por favor, preencha o horário do evento', 'erro');
                    return;
                }
                novoEvento.hora = hora;
                novoEvento.data = document.getElementById('evento-data-editar').value;
            }
            // Adicionar novo evento na data original
            import('./state.js').then(({ addEvento }) => {
                addEvento(dataStr, novoEvento);
                document.dispatchEvent(new Event('eventosUpdated'));
                mostrarToast('Evento atualizado com sucesso', 'sucesso');
                fecharModalEditar();
                eventoEditando = null;
            });
        });
        return;
    }

    // Atualizar propriedades do evento
    evento.descricao = descricao;
    evento.tipo = tipo;

    if (tipo === 'entrada' || tipo === 'saida') {
        let valor = document.getElementById('evento-valor-editar').value;
        if (!valor) {
            mostrarToast('Por favor, preencha o valor', 'erro');
            return;
        }
        valor = parseFloat(valor.replace(',', '.'));
        if (isNaN(valor)) {
            mostrarToast('Valor inválido.', 'erro');
            return;
        }
        evento.valor = valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
    } else if (tipo === 'cartao') {
        // Para edição de compra parcelada, precisamos recriar as parcelas
        let valor = document.getElementById('evento-valor-editar').value;
        if (!valor) {
            mostrarToast('Por favor, preencha o valor', 'erro');
            return;
        }
        valor = parseFloat(valor.replace(',', '.'));
        if (isNaN(valor)) {
            mostrarToast('Valor inválido.', 'erro');
            return;
        }
        evento.valor = valor % 1 === 0 ? valor.toString() : valor.toFixed(2);

        const parcelas = parseInt(document.getElementById('evento-parcelas-editar').value) || 1;
        const vencimento = parseInt(document.getElementById('evento-vencimento-editar').value) || 10;

        if (parcelas < 1) {
            mostrarToast('Número de parcelas deve ser pelo menos 1.', 'erro');
            return;
        }

        evento.parcelas = parcelas;
        evento.vencimento = vencimento;

        // Deletar parcelas antigas
        import('./state.js').then(({ deleteByParentId }) => {
            deleteByParentId(evento.id);
            // Recriar parcelas
            const valorParcela = valor / parcelas;
            const dataCompra = new Date(dataStr);
            for (let i = 1; i <= parcelas; i++) {
                const dataParcela = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + i, vencimento);
                const dataParcelaStr = `${dataParcela.getFullYear()}-${(dataParcela.getMonth() + 1).toString().padStart(2, '0')}-${dataParcela.getDate().toString().padStart(2, '0')}`;

                const parcelaObj = {
                    descricao: `${descricao} - Parcela ${i}/${parcelas}`,
                    tipo: 'saida',
                    valor: (valorParcela % 1 === 0 ? valorParcela.toString() : valorParcela.toFixed(2)),
                    parentId: evento.id,
                    parcelaIndex: i
                };

                import('./state.js').then(({ addEvento }) => {
                    addEvento(dataParcelaStr, parcelaObj);
                });
            }
        });
    } else if (tipo === 'normal') {
        const hora = document.getElementById('evento-hora-editar').value;
        const dataSelecionada = document.getElementById('evento-data-editar').value;
        if (!hora) {
            mostrarToast('Por favor, preencha o horário do evento', 'erro');
            return;
        }
        if (!dataSelecionada) {
            mostrarToast('Por favor, selecione a data do evento', 'erro');
            return;
        }
        evento.hora = hora;
        evento.data = dataSelecionada;
    }

    // Salvar mudanças
    import('./state.js').then(({ salvarEventos, addEvento, deleteEvento }) => {
        // Para eventos normais, se a data mudou, precisamos mover o evento
        if (tipo === 'normal' && evento.data !== dataStr) {
            // Remover da data antiga
            deleteEvento(dataStr, index);
            // Adicionar na nova data
            addEvento(evento.data, evento);
        }
        salvarEventos();
        document.dispatchEvent(new Event('eventosUpdated'));
        mostrarToast('Evento atualizado com sucesso', 'sucesso');
        fecharModalEditar();
        eventoEditando = null; // Limpar referência
    });
}

export function cancelarEdicao() {
    // Resetar o botão de salvar
    const salvarBtn = document.querySelector('#modal button[onclick*="atualizarEvento"]');
    if (salvarBtn) {
        salvarBtn.textContent = 'SALVAR';
        salvarBtn.onclick = salvarEvento;
    }

    // Resetar o botão de cancelar
    const cancelarBtn = document.querySelector('#modal button[onclick="cancelarEdicao()"]');
    if (cancelarBtn) {
        cancelarBtn.onclick = () => fecharModal();
    }

    // Limpar formulário
    document.getElementById('evento-descricao').value = '';
    document.getElementById('evento-valor').value = '';
    document.getElementById('evento-data').value = '';
    document.getElementById('evento-hora').value = '';

    fecharModal();
}

// Abre o modal do dia da compra pai a partir do parentId
export function abrirEventoPai(parentId) {
    if (!parentId) return;
    // encontrar o evento pai na coleção
    let foundDate = null;
    let foundDay = null;
    Object.keys(eventos).some(dateKey => {
        const list = eventos[dateKey] || [];
        const found = list.find(ev => ev.id && ev.id === parentId);
        if (found) {
            foundDate = dateKey; // formato YYYY-MM-DD
            const parts = dateKey.split('-');
            foundDay = parseInt(parts[2], 10);
            // ajustar dataAtual para o mês/ano do evento pai
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10);
            setDataAtual(new Date(year, month - 1, 1));
            return true;
        }
        return false;
    });

    if (foundDay !== null) {
        // disparar evento de clique no dia para abrir o modal de eventos desse dia
        document.dispatchEvent(new CustomEvent('diaClicado', { detail: { dia: foundDay } }));
    } else {
        mostrarToast('Compra pai não encontrada.', 'aviso');
    }
}

// Tornar acessível globalmente para usos em atributos onclick gerados dinamicamente
window.abrirEventoPai = abrirEventoPai;
window.abrirModalApagar = abrirModalApagar;
window.confirmarExclusao = confirmarExclusao;
window.abrirModalEditar = abrirModalEditar;
window.cancelarEdicao = cancelarEdicao;
window.atualizarCamposEventoEditar = atualizarCamposEventoEditar;
window.atualizarEvento = atualizarEvento;
window.fecharModalEditar = fecharModalEditar;

export function apagarDadosMes() {
    const modalId = `modal-confirmacao-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const modalConfirmacao = document.createElement('div');
    modalConfirmacao.id = modalId;
    modalConfirmacao.className = 'modal-confirmacao';
    modalConfirmacao.innerHTML = `
        <h3 style="color: var(--dourado);">Confirmação</h3>
        <p>Deseja realmente apagar todos os dados do mês atual?</p>
        <div>
            <button id="btn-confirmar-reset-${modalId}" style="background-color: #dc3545;">Confirmar</button>
            <button id="btn-cancelar-reset-${modalId}">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modalConfirmacao);

    document.getElementById(`btn-confirmar-reset-${modalId}`).onclick = () => {
        apagarEventosDoMes();
        document.dispatchEvent(new Event('eventosUpdated')); // Dispara evento
        modalConfirmacao.remove();
        mostrarToast('Dados do mês apagados com sucesso!', 'sucesso');
    };

    document.getElementById(`btn-cancelar-reset-${modalId}`).onclick = () => {
        modalConfirmacao.remove();
    };
}