// js/reports.js
import { dataAtual, eventos } from './state.js';

// Função auxiliar para formatar valores
function formatarValor(valor) {
    return valor % 1 === 0 ? valor.toString() : valor.toFixed(2);
}

// Função auxiliar para criar canvas para gráficos
function criarCanvas(id, width = 400, height = 300) {
    const canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.width = width;
    canvas.height = height;
    canvas.style.cssText = `
        max-width: 100%;
        height: auto;
        margin: 10px 0;
        border: 1px solid var(--dourado);
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
    `;
    return canvas;
}

// Função auxiliar para destruir gráficos existentes
function destruirGraficos() {
    const canvases = document.querySelectorAll('#relatorio-modal canvas');
    canvases.forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) {
            chart.destroy();
        }
    });
}

// Modificação na função gerarRelatorioMensal
export function gerarRelatorioMensal() {
    let totalEntrada = 0;
    let totalSaida = 0;
    let maiorEntrada = { valor: 0, descricao: '' };
    let maiorSaida = { valor: 0, descricao: '' };
    let qtdEntradas = 0;
    let qtdSaidas = 0;
    let qtdComprasCartao = 0;
    let valorComprasCartao = 0;
    let parcelasPendentes = 0;

    const relatorioDiv = document.createElement('div');
    relatorioDiv.id = 'relatorio-modal';
    relatorioDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--preto);
        border: 2px solid var(--dourado);
        padding: 20px;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 1000;
        color: var(--branco);
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;

    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    const nomeMes = dataAtual.toLocaleDateString('pt-BR', { month: 'long' });

    let relatorioHTML = `
        <h3 style="color: var(--dourado); text-align: center; margin-bottom: 20px;">
            Dashboard Financeiro - ${nomeMes} ${anoAtual}
        </h3>
    `;

    let eventosPorDia = {};
    let temEventos = false;
    let movimentacoesPorDia = {};
    let saldoAcumulado = 0;
    let saldosDiarios = [];

    // Agrupa eventos por dia e calcula totais
    for (const [data, eventosDia] of Object.entries(eventos)) {
        const [ano, mes, dia] = data.split('-');
        if (parseInt(ano) === anoAtual && parseInt(mes) === mesAtual) {
            temEventos = true;
            eventosPorDia[dia] = eventosDia;
            movimentacoesPorDia[dia] = { entradas: 0, saidas: 0 };

            eventosDia.forEach(evento => {
                const valor = parseFloat(evento.valor || 0);
                if (evento.tipo === 'entrada') {
                    totalEntrada += valor;
                    qtdEntradas++;
                    movimentacoesPorDia[dia].entradas += valor;
                    if (valor > maiorEntrada.valor) {
                        maiorEntrada = { valor, descricao: evento.descricao };
                    }
                } else if (evento.tipo === 'saida') {
                    totalSaida += valor;
                    qtdSaidas++;
                    movimentacoesPorDia[dia].saidas += valor;
                    if (valor > maiorSaida.valor) {
                        maiorSaida = { valor, descricao: evento.descricao };
                    }
                } else if (evento.tipo === 'cartao') {
                    qtdComprasCartao++;
                    valorComprasCartao += valor;
                    // Contar parcelas pendentes (simplificado - considerar todas como pendentes)
                    parcelasPendentes += parseInt(evento.parcelas || 1);
                }
            });

            // Calcular saldo diário
            const saldoDia = movimentacoesPorDia[dia].entradas - movimentacoesPorDia[dia].saidas;
            saldoAcumulado += saldoDia;
            saldosDiarios.push({ dia: parseInt(dia), saldo: saldoAcumulado });
        }
    }

    if (!temEventos) {
        relatorioHTML += '<p style="text-align: center; color: var(--dourado);">Nenhum evento registrado neste mês.</p>';
    } else {
        // KPIs Principais
        const saldoFinal = totalEntrada - totalSaida;
        const percentualGasto = totalEntrada > 0 ? (totalSaida / totalEntrada) * 100 : 0;

        relatorioHTML += `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="padding: 15px; background-color: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; border-radius: 8px; text-align: center;">
                    <h4 style="color: #28a745; margin: 0 0 10px 0;">Total Entradas</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #28a745; margin: 0;">R$ ${formatarValor(totalEntrada)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${qtdEntradas} transações</p>
                </div>
                <div style="padding: 15px; background-color: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px; text-align: center;">
                    <h4 style="color: #dc3545; margin: 0 0 10px 0;">Total Saídas</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #dc3545; margin: 0;">R$ ${formatarValor(totalSaida)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${qtdSaidas} transações</p>
                </div>
                <div style="padding: 15px; background-color: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; text-align: center;">
                    <h4 style="color: #ffc107; margin: 0 0 10px 0;">Saldo do Mês</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: ${saldoFinal >= 0 ? '#28a745' : '#dc3545'}; margin: 0;">R$ ${formatarValor(saldoFinal)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${formatarValor(percentualGasto)}% gasto</p>
                </div>
                <div style="padding: 15px; background-color: rgba(255, 140, 0, 0.1); border: 1px solid #ff8c00; border-radius: 8px; text-align: center;">
                    <h4 style="color: #ff8c00; margin: 0 0 10px 0;">Compras no Cartão</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #ff8c00; margin: 0;">${qtdComprasCartao}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">R$ ${formatarValor(valorComprasCartao)}</p>
                </div>
            </div>

            <!-- Gráficos -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
                <!-- Gráfico Pizza: Entradas vs Saídas -->
                <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Distribuição: Entradas vs Saídas</h4>
                    <div id="chart-pizza-container"></div>
                </div>

                <!-- Gráfico Barras: Movimentações por Dia -->
                <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Movimentações por Dia</h4>
                    <div id="chart-barras-container"></div>
                </div>
            </div>

            <!-- Gráfico Linha: Saldo Acumulado -->
            <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Evolução do Saldo</h4>
                <div id="chart-linha-container"></div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--dourado);">Maiores Movimentações</h4>
                ${maiorEntrada.descricao ? `
                    <p>Maior Entrada: ${maiorEntrada.descricao} - R$ ${formatarValor(maiorEntrada.valor)}</p>
                ` : ''}
                ${maiorSaida.descricao ? `
                    <p>Maior Saída: ${maiorSaida.descricao} - R$ ${formatarValor(maiorSaida.valor)}</p>
                ` : ''}
            </div>

            <h4 style="color: var(--dourado);">Detalhamento por Dia</h4>
        `;

        // Detalhamento diário
        Object.entries(eventosPorDia)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([dia, eventosDia]) => {
                let entradaDia = 0;
                let saidaDia = 0;

                relatorioHTML += `
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid var(--dourado); border-radius: 5px;">
                        <strong>Dia ${dia}</strong>
                        <ul style="list-style: none; padding: 0; margin: 10px 0;">
                `;

                eventosDia.forEach(evento => {
                    const valor = parseFloat(evento.valor || 0);
                    if (evento.tipo === 'entrada') entradaDia += valor;
                    if (evento.tipo === 'saida') saidaDia += valor;

                    relatorioHTML += `
                        <li style="margin-bottom: 5px;">
                            <span style="color: ${evento.tipo === 'entrada' ? '#28a745' : evento.tipo === 'saida' ? '#dc3545' : evento.tipo === 'cartao' ? '#ff8c00' : '#ffc107'};">
                                ${evento.descricao} - R$ ${formatarValor(valor)} ${evento.tipo === 'cartao' ? `(Cartão - ${evento.parcelas || 1}x)` : ''}
                            </span>
                        </li>
                    `;
                });

                relatorioHTML += `
                        </ul>
                        <div style="font-size: 0.9em; margin-top: 5px;">
                            <p>Total do dia: R$ ${formatarValor(entradaDia - saidaDia)}</p>
                        </div>
                    </div>
                `;
            });

        // Balanço Final
        relatorioHTML += `
            <div style="margin-top: 20px; border-top: 2px solid var(--dourado); padding-top: 15px;">
                <h4 style="color: var(--dourado);">Balanço Final</h4>
                <p>Total de Entradas: <span style="color: #28a745;">R$ ${formatarValor(totalEntrada)}</span></p>
                <p>Total de Saídas: <span style="color: #dc3545;">R$ ${formatarValor(totalSaida)}</span></p>
                <p>Saldo do Mês: <span style="color: ${saldoFinal >= 0 ? '#28a745' : '#dc3545'}">
                    R$ ${formatarValor(saldoFinal)}</span></p>
                <p>Percentual Gasto: ${formatarValor(percentualGasto)}%</p>
                <p>Status: <strong style="color: ${saldoFinal >= 0 ? '#28a745' : '#dc3545'}">
                    ${saldoFinal >= 0 ? 'Positivo' : 'Negativo'}</strong></p>
            </div>
        `;
    }

    relatorioHTML += `
        <button onclick="this.parentElement.remove()" style="
            display: block;
            margin: 20px auto 0;
            background-color: var(--dourado);
            color: var(--preto);
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Fechar Relatório</button>
    `;

    relatorioDiv.innerHTML = relatorioHTML;
    document.body.appendChild(relatorioDiv);

    // Criar gráficos após adicionar o modal ao DOM
    if (temEventos) {
        setTimeout(() => {
            criarGraficosMensal(totalEntrada, totalSaida, movimentacoesPorDia, saldosDiarios);
        }, 100);
    }
}

// Função para criar gráficos mensais
function criarGraficosMensal(totalEntrada, totalSaida, movimentacoesPorDia, saldosDiarios) {
    // Destruir gráficos existentes
    destruirGraficos();

    // Gráfico Pizza: Entradas vs Saídas
    const ctxPizza = criarCanvas('chart-pizza');
    document.getElementById('chart-pizza-container').appendChild(ctxPizza);

    new Chart(ctxPizza, {
        type: 'pie',
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{
                data: [totalEntrada, totalSaida],
                backgroundColor: ['#28a745', '#dc3545'],
                borderColor: ['#28a745', '#dc3545'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': R$ ' + context.parsed.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // Gráfico Barras: Movimentações por Dia
    const ctxBarras = criarCanvas('chart-barras');
    document.getElementById('chart-barras-container').appendChild(ctxBarras);

    const dias = Object.keys(movimentacoesPorDia).sort((a, b) => parseInt(a) - parseInt(b));
    const entradasPorDia = dias.map(dia => movimentacoesPorDia[dia].entradas);
    const saidasPorDia = dias.map(dia => movimentacoesPorDia[dia].saidas);

    new Chart(ctxBarras, {
        type: 'bar',
        data: {
            labels: dias.map(d => `Dia ${d}`),
            datasets: [{
                label: 'Entradas',
                data: entradasPorDia,
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                borderWidth: 1
            }, {
                label: 'Saídas',
                data: saidasPorDia,
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFD700',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFD700'
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // Gráfico Linha: Saldo Acumulado
    const ctxLinha = criarCanvas('chart-linha');
    document.getElementById('chart-linha-container').appendChild(ctxLinha);

    const diasSaldo = saldosDiarios.map(item => `Dia ${item.dia}`);
    const valoresSaldo = saldosDiarios.map(item => item.saldo);

    new Chart(ctxLinha, {
        type: 'line',
        data: {
            labels: diasSaldo,
            datasets: [{
                label: 'Saldo Acumulado',
                data: valoresSaldo,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFD700',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFD700'
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Saldo: R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Modificação na função gerarRelatorioAnual
export function gerarRelatorioAnual() {
    let totalEntradaAnual = 0;
    let totalSaidaAnual = 0;
    let melhorMes = { saldo: -Infinity, nome: '' };
    let piorMes = { saldo: Infinity, nome: '' };
    let mesesComEventos = {};
    let qtdComprasCartaoAnual = 0;
    let valorComprasCartaoAnual = 0;
    let parcelasPendentesAnual = 0;

    const relatorioDiv = document.createElement('div');
    relatorioDiv.id = 'relatorio-anual-modal';
    relatorioDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--preto);
        border: 2px solid var(--dourado);
        padding: 20px;
        width: 95%;
        max-width: 1200px;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 1000;
        color: var(--branco);
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `;

    const anoAtual = dataAtual.getFullYear();
    let relatorioHTML = `
        <h3 style="color: var(--dourado); text-align: center; margin-bottom: 20px;">
            Dashboard Financeiro Anual - ${anoAtual}
        </h3>
    `;

    let temEventos = false;
    let saldosMensais = [];

    // Processamento inicial dos dados
    for (const [data, eventosDia] of Object.entries(eventos)) {
        const [ano, mes] = data.split('-');
        if (parseInt(ano) === anoAtual) {
            temEventos = true;
            if (!mesesComEventos[mes]) {
                mesesComEventos[mes] = {
                    entradas: 0,
                    saidas: 0,
                    qtdEntradas: 0,
                    qtdSaidas: 0,
                    maiorEntrada: { valor: 0, descricao: '' },
                    maiorSaida: { valor: 0, descricao: '' }
                };
            }

            eventosDia.forEach(evento => {
                const valor = parseFloat(evento.valor || 0);
                if (evento.tipo === 'entrada') {
                    mesesComEventos[mes].entradas += valor;
                    mesesComEventos[mes].qtdEntradas++;
                    if (valor > mesesComEventos[mes].maiorEntrada.valor) {
                        mesesComEventos[mes].maiorEntrada = { valor, descricao: evento.descricao };
                    }
                    totalEntradaAnual += valor;
                } else if (evento.tipo === 'saida') {
                    mesesComEventos[mes].saidas += valor;
                    mesesComEventos[mes].qtdSaidas++;
                    if (valor > mesesComEventos[mes].maiorSaida.valor) {
                        mesesComEventos[mes].maiorSaida = { valor, descricao: evento.descricao };
                    }
                    totalSaidaAnual += valor;
                } else if (evento.tipo === 'cartao') {
                    qtdComprasCartaoAnual++;
                    valorComprasCartaoAnual += valor;
                    parcelasPendentesAnual += parseInt(evento.parcelas || 1);
                }
            });

            // Calcula saldo do mês para determinar melhor e pior mês
            const saldoMes = mesesComEventos[mes].entradas - mesesComEventos[mes].saidas;
            const nomeMes = new Date(anoAtual, parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long' });

            if (saldoMes > melhorMes.saldo) {
                melhorMes = { saldo: saldoMes, nome: nomeMes };
            }
            if (saldoMes < piorMes.saldo) {
                piorMes = { saldo: saldoMes, nome: nomeMes };
            }

            saldosMensais.push({ mes: parseInt(mes), nome: nomeMes, saldo: saldoMes });
        }
    }

    if (!temEventos) {
        relatorioHTML += '<p style="text-align: center; color: var(--dourado);">Nenhum evento registrado neste ano.</p>';
    } else {
        // KPIs Principais Anuais
        const saldoAnual = totalEntradaAnual - totalSaidaAnual;
        const percentualGastoAnual = totalEntradaAnual > 0 ? (totalSaidaAnual / totalEntradaAnual) * 100 : 0;

        relatorioHTML += `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="padding: 15px; background-color: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; border-radius: 8px; text-align: center;">
                    <h4 style="color: #28a745; margin: 0 0 10px 0;">Total Entradas</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #28a745; margin: 0;">R$ ${formatarValor(totalEntradaAnual)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">Ano ${anoAtual}</p>
                </div>
                <div style="padding: 15px; background-color: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 8px; text-align: center;">
                    <h4 style="color: #dc3545; margin: 0 0 10px 0;">Total Saídas</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #dc3545; margin: 0;">R$ ${formatarValor(totalSaidaAnual)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${formatarValor(percentualGastoAnual)}% do total</p>
                </div>
                <div style="padding: 15px; background-color: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; text-align: center;">
                    <h4 style="color: #ffc107; margin: 0 0 10px 0;">Saldo Anual</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: ${saldoAnual >= 0 ? '#28a745' : '#dc3545'}; margin: 0;">R$ ${formatarValor(saldoAnual)}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">${saldoAnual >= 0 ? 'Positivo' : 'Negativo'}</p>
                </div>
                <div style="padding: 15px; background-color: rgba(255, 140, 0, 0.1); border: 1px solid #ff8c00; border-radius: 8px; text-align: center;">
                    <h4 style="color: #ff8c00; margin: 0 0 10px 0;">Compras Cartão</h4>
                    <p style="font-size: 1.5em; font-weight: bold; color: #ff8c00; margin: 0;">${qtdComprasCartaoAnual}</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">R$ ${formatarValor(valorComprasCartaoAnual)}</p>
                </div>
            </div>

            <!-- Gráficos Anuais -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin-bottom: 20px;">
                <!-- Gráfico Barras: Entradas e Saídas por Mês -->
                <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Entradas e Saídas por Mês</h4>
                    <div id="chart-barras-anual-container"></div>
                </div>

                <!-- Gráfico Pizza: Distribuição de Tipos de Eventos -->
                <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px;">
                    <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Distribuição de Tipos de Eventos</h4>
                    <div id="chart-pizza-tipos-container"></div>
                </div>
            </div>

            <!-- Gráfico Linha: Saldo Mensal Acumulado -->
            <div style="padding: 15px; background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: var(--dourado); text-align: center; margin-bottom: 15px;">Evolução do Saldo Mensal</h4>
                <div id="chart-linha-anual-container"></div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="color: var(--dourado);">Análise de Desempenho</h4>
                <p>Melhor Mês: ${melhorMes.nome} (R$ ${formatarValor(melhorMes.saldo)})</p>
                <p>Pior Mês: ${piorMes.nome} (R$ ${formatarValor(piorMes.saldo)})</p>
            </div>

            <h4 style="color: var(--dourado);">Detalhamento Mensal</h4>
        `;

        // Detalhamento por mês
        Object.entries(mesesComEventos)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .forEach(([mes, dados]) => {
                const nomeMes = new Date(anoAtual, parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long' });
                const saldoMes = dados.entradas - dados.saidas;
                const percentualGastoMes = dados.entradas > 0 ? (dados.saidas / dados.entradas) * 100 : 0;

                relatorioHTML += `
                    <div style="margin-bottom: 15px; padding: 10px; border: 1px solid var(--dourado); border-radius: 5px;">
                        <h4 style="color: var(--dourado); margin: 0 0 10px;">${nomeMes}</h4>
                        <div style="margin-bottom: 10px;">
                            <p>Entradas: R$ ${formatarValor(dados.entradas)} (${dados.qtdEntradas} operações)</p>
                            <p>Saídas: R$ ${formatarValor(dados.saidas)} (${dados.qtdSaidas} operações)</p>
                            <p>Saldo: <span style="color: ${saldoMes >= 0 ? '#28a745' : '#dc3545'}">
                                R$ ${formatarValor(saldoMes)}</span></p>
                            <p>Percentual Gasto: ${formatarValor(percentualGastoMes)}%</p>
                        </div>
                        <div style="font-size: 0.9em;">
                            <p>Maior Entrada: ${dados.maiorEntrada.descricao} - R$ ${formatarValor(dados.maiorEntrada.valor)}</p>
                            <p>Maior Saída: ${dados.maiorSaida.descricao} - R$ ${formatarValor(dados.maiorSaida.valor)}</p>
                        </div>
                    </div>
                `;
            });

        // Conclusão e Recomendações
        relatorioHTML += `
            <div style="margin-top: 20px; border-top: 2px solid var(--dourado); padding-top: 15px;">
                <h4 style="color: var(--dourado);">Conclusão</h4>
                <p>Status Anual: <strong style="color: ${saldoAnual >= 0 ? '#28a745' : '#dc3545'}">
                    ${saldoAnual >= 0 ? 'Positivo' : 'Negativo'}</strong></p>
                <p>Média Mensal de Entradas: R$ ${formatarValor(totalEntradaAnual / 12)}</p>
                <p>Média Mensal de Saídas: R$ ${formatarValor(totalSaidaAnual / 12)}</p>
            </div>
        `;
    }

    relatorioHTML += `
        <button onclick="this.parentElement.remove()" style="
            display: block;
            margin: 20px auto 0;
            background-color: var(--dourado);
            color: var(--preto);
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        ">Fechar Relatório</button>
    `;

    relatorioDiv.innerHTML = relatorioHTML;
    document.body.appendChild(relatorioDiv);

    // Criar gráficos após adicionar o modal ao DOM
    if (temEventos) {
        setTimeout(() => {
            criarGraficosAnuais(totalEntradaAnual, totalSaidaAnual, mesesComEventos, saldosMensais, anoAtual);
        }, 100);
    }
}

// Função para criar gráficos anuais
function criarGraficosAnuais(totalEntradaAnual, totalSaidaAnual, mesesComEventos, saldosMensais, anoAtual) {
    // Destruir gráficos existentes
    const canvases = document.querySelectorAll('#relatorio-anual-modal canvas');
    canvases.forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) {
            chart.destroy();
        }
    });

    // Gráfico Barras: Entradas e Saídas por Mês
    const ctxBarrasAnual = criarCanvas('chart-barras-anual');
    document.getElementById('chart-barras-anual-container').appendChild(ctxBarrasAnual);

    const meses = Object.keys(mesesComEventos).sort((a, b) => parseInt(a) - parseInt(b));
    const entradasMensais = meses.map(mes => mesesComEventos[mes].entradas);
    const saidasMensais = meses.map(mes => mesesComEventos[mes].saidas);
    const nomesMeses = meses.map(mes => new Date(anoAtual, parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'short' }));

    new Chart(ctxBarrasAnual, {
        type: 'bar',
        data: {
            labels: nomesMeses,
            datasets: [{
                label: 'Entradas',
                data: entradasMensais,
                backgroundColor: '#28a745',
                borderColor: '#28a745',
                borderWidth: 1
            }, {
                label: 'Saídas',
                data: saidasMensais,
                backgroundColor: '#dc3545',
                borderColor: '#dc3545',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFD700',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFD700'
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // Gráfico Pizza: Distribuição de Tipos de Eventos
    const ctxPizzaTipos = criarCanvas('chart-pizza-tipos');
    document.getElementById('chart-pizza-tipos-container').appendChild(ctxPizzaTipos);

    // Calcular distribuição de tipos
    let qtdEntradas = 0, qtdSaidas = 0, qtdCartao = 0;
    Object.values(mesesComEventos).forEach(mes => {
        qtdEntradas += mes.qtdEntradas;
        qtdSaidas += mes.qtdSaidas;
    });

    // Contar eventos do cartão (aproximado)
    for (const [data, eventosDia] of Object.entries(eventos)) {
        const [ano] = data.split('-');
        if (parseInt(ano) === anoAtual) {
            eventosDia.forEach(evento => {
                if (evento.tipo === 'cartao') qtdCartao++;
            });
        }
    }

    new Chart(ctxPizzaTipos, {
        type: 'pie',
        data: {
            labels: ['Entradas', 'Saídas', 'Cartão'],
            datasets: [{
                data: [qtdEntradas, qtdSaidas, qtdCartao],
                backgroundColor: ['#28a745', '#dc3545', '#ff8c00'],
                borderColor: ['#28a745', '#dc3545', '#ff8c00'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + ' eventos';
                        }
                    }
                }
            }
        }
    });

    // Gráfico Linha: Saldo Mensal Acumulado
    const ctxLinhaAnual = criarCanvas('chart-linha-anual');
    document.getElementById('chart-linha-anual-container').appendChild(ctxLinhaAnual);

    const saldosOrdenados = saldosMensais.sort((a, b) => a.mes - b.mes);
    const nomesMesesSaldo = saldosOrdenados.map(item => item.nome.substring(0, 3));
    const valoresSaldos = saldosOrdenados.map(item => item.saldo);

    new Chart(ctxLinhaAnual, {
        type: 'line',
        data: {
            labels: nomesMesesSaldo,
            datasets: [{
                label: 'Saldo Mensal',
                data: valoresSaldos,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#FFD700',
                        callback: function(value) {
                            return 'R$ ' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                },
                x: {
                    ticks: {
                        color: '#FFD700'
                    },
                    grid: {
                        color: 'rgba(255, 215, 0, 0.2)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#FFD700'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Saldo: R$ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}
