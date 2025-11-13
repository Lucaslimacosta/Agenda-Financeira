// js/customization.js
import { abrirModal, fecharModalPersonalizar } from './ui.js';

// Função para carregar configurações personalizadas
export function carregarConfiguracoesPersonalizadas() {
    try {
        console.log('=== CARREGANDO CONFIGURAÇÕES PERSONALIZADAS ===');

        let configuracoesSalvas = {};
        console.log('Nenhuma configuração salva encontrada, usando padrões');
        configuracoesSalvas = {};

        // Aplicar tema se existir
        if (configuracoesSalvas.tema && configuracoesSalvas.tema !== 'default') {
            console.log('Aplicando tema:', configuracoesSalvas.tema);
            aplicarTema(configuracoesSalvas.tema, false); // false para não salvar novamente
        } else {
            console.log('Aplicando configurações personalizadas manuais (sem tema) - FORÇANDO APLICAÇÃO MANUAL');

            // Título do app
            const appTitle = document.getElementById('app-title');
            if (appTitle) {
                if (configuracoesSalvas.titulo) {
                    appTitle.textContent = configuracoesSalvas.titulo;
                    console.log('Título aplicado:', configuracoesSalvas.titulo);
                }
                if (configuracoesSalvas.cor) {
                    appTitle.style.color = configuracoesSalvas.cor;
                    console.log('Cor do título aplicada:', configuracoesSalvas.cor);
                }
            } else {
                console.error('Elemento app-title não encontrado!');
            }

            // Aplicar cores personalizadas
            if (configuracoesSalvas.corFundo) {
                document.body.style.backgroundColor = `rgba(${hexToRgb(configuracoesSalvas.corFundo)}, ${configuracoesSalvas.opacidadeFundo || 0.8})`;
                console.log('Fundo aplicado:', `rgba(${hexToRgb(configuracoesSalvas.corFundo)}, ${configuracoesSalvas.opacidadeFundo || 0.8})`);
            } else if (configuracoesSalvas.opacidadeFundo) {
                document.body.style.backgroundColor = `rgba(30, 30, 30, ${configuracoesSalvas.opacidadeFundo})`;
                console.log('Fundo padrão aplicado com opacidade:', configuracoesSalvas.opacidadeFundo);
            }

            if (configuracoesSalvas.corTexto) {
                document.body.style.color = configuracoesSalvas.corTexto;
                console.log('Cor do texto aplicada:', configuracoesSalvas.corTexto);
            }

            // Botões
            const botoes = document.querySelectorAll('button');
            if (configuracoesSalvas.corBotao && botoes.length > 0) {
                botoes.forEach(button => {
                    button.style.backgroundColor = configuracoesSalvas.corBotao;
                    button.style.color = '#FFFFFF';
                });
                // Atualizar variável CSS para botões
                document.documentElement.style.setProperty('--corBotao', configuracoesSalvas.corBotao);
                console.log('Cor dos botões aplicada:', configuracoesSalvas.corBotao);
            }

            // Atualizar variáveis CSS globais
            if (configuracoesSalvas.cor) {
                document.documentElement.style.setProperty('--dourado', configuracoesSalvas.cor);
            }
            if (configuracoesSalvas.corFundo) {
                document.documentElement.style.setProperty('--preto', configuracoesSalvas.corFundo);
            }
            if (configuracoesSalvas.corTexto) {
                document.documentElement.style.setProperty('--branco', configuracoesSalvas.corTexto);
            }
            console.log('Variáveis CSS globais atualizadas');
        }

        // Fundo personalizado (imagem)
        if (configuracoesSalvas.fundo) {
            document.body.style.backgroundImage = `url('${configuracoesSalvas.fundo}')`;
            console.log('Imagem de fundo aplicada');
        }

        // Logo
        const logoImg = document.getElementById('logo-img');
        if (logoImg && configuracoesSalvas.logo) {
            logoImg.src = configuracoesSalvas.logo;
            console.log('Logo aplicada');
        }

        console.log('=== CONFIGURAÇÕES CARREGADAS COM SUCESSO ===');

    } catch (error) {
        console.error("Erro ao carregar configurações personalizadas:", error);
    }
}

export function salvarPersonalizacao() {
    try {
        console.log('=== SALVANDO TEMA SELECIONADO ===');

        // Verificar se há um tema selecionado
        let temaSelecionado = null;
        const themeCards = document.querySelectorAll('.theme-card');
        themeCards.forEach(card => {
            if (card.classList.contains('selected')) {
                temaSelecionado = card.getAttribute('data-theme');
            }
        });

        console.log('Tema selecionado:', temaSelecionado);

        // Carregar configurações existentes
        let configuracoesSalvas = {};
        console.log('Configurações existentes:', configuracoesSalvas);

        // Se há tema selecionado, salvar o tema
        if (temaSelecionado) {
            console.log('Salvando tema:', temaSelecionado);
            aplicarTema(temaSelecionado, true); // true para salvar
        } else {
            // Se não há tema selecionado, salvar apenas título e logo/fundo personalizados
            console.log('Nenhum tema selecionado, salvando apenas personalizações básicas');

            const tituloApp = document.getElementById('titulo-app');
            const titulo = tituloApp ? tituloApp.value : 'AGENDA FINANCEIRA';

            const novasConfiguracoes = {
                titulo: titulo,
                logo: configuracoesSalvas.logo,
                fundo: configuracoesSalvas.fundo,
                tema: 'default'
            };

            // Aplicar apenas o título
            const appTitle = document.getElementById('app-title');
            if (appTitle) {
                appTitle.textContent = titulo;
                console.log('Título aplicado:', titulo);
            }

            // Não salvar no localStorage
            console.log('Personalizações básicas não salvas (localStorage desabilitado):', novasConfiguracoes);
        }

        console.log('=== SALVAMENTO CONCLUÍDO ===');
        fecharModalPersonalizar();
    } catch (error) {
        console.error("Erro ao salvar personalização:", error);
        alert("Erro ao salvar personalização: " + error.message);
    }
}

// Função auxiliar para converter hex para rgb
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '30, 30, 30';
}

export function abrirModalPersonalizar() {
    try {
        abrirModal('modal-personalizar'); // Chama a função de UI

        // Carrega configurações salvas
        let configuracoesSalvas = {};
        console.log('Nenhuma configuração salva encontrada (localStorage desabilitado)');

        // Preenche o campo de título
        const tituloApp = document.getElementById('titulo-app');
        if (tituloApp) {
            tituloApp.value = configuracoesSalvas.titulo || 'AGENDA FINANCEIRA';
            console.log('Título preenchido:', tituloApp.value);
        }

        // Se há um tema salvo, marcar o card correspondente como selecionado
        if (configuracoesSalvas.tema && configuracoesSalvas.tema !== 'default') {
            const themeCard = document.querySelector(`[data-theme="${configuracoesSalvas.tema}"]`);
            if (themeCard) {
                themeCard.classList.add('selected');
                console.log('Tema marcado como selecionado:', configuracoesSalvas.tema);
            }
        }

        console.log('Modal de personalização aberto com sucesso');

    } catch (error) {
        console.error("Erro ao abrir modal:", error);
        alert("Erro ao abrir o modal: " + error.message);
    }
}

export function restaurarConfiguracoes() {
    try {
        console.log('=== RESTAURANDO CONFIGURAÇÕES PARA PADRÃO ===');

        const configuracoesPadrao = {
            titulo: 'AGENDA FINANCEIRA',
            cor: '#FFD700',
            opacidadeFundo: 0.8,
            corBotao: '#000000',
            corFundo: '#1a1a1a',
            corTexto: '#ffffff',
            logo: 'Imagem do WhatsApp de 2024-11-14 à(s) 21.42.02_a263ffdf.jpg', // Caminho da logo padrão
            background_color: '#000'
        };

        console.log('Aplicando configurações padrão:', configuracoesPadrao);

        // Aplica as configurações padrão na interface
        const appTitle = document.getElementById('app-title');
        if (appTitle) {
            appTitle.textContent = configuracoesPadrao.titulo;
            appTitle.style.color = configuracoesPadrao.cor;
            console.log('Título restaurado para:', configuracoesPadrao.titulo);
        }

        // Restaura logo padrão
        const logoImg = document.getElementById('logo-img');
        if (logoImg) {
            logoImg.src = configuracoesPadrao.logo;
            console.log('Logo restaurada');
        }

        document.body.style.backgroundColor = `rgba(${hexToRgb(configuracoesPadrao.corFundo)}, ${configuracoesPadrao.opacidadeFundo})`;
        document.body.style.color = configuracoesPadrao.corTexto;
        document.body.style.backgroundImage = 'none';
        console.log('Fundo e texto restaurados');

        // Atualiza a cor dos botões
        const botoes = document.querySelectorAll('button');
        if (botoes.length > 0) {
            botoes.forEach(button => {
                button.style.backgroundColor = configuracoesPadrao.corBotao;
                button.style.color = '#FFFFFF';
            });
            // Restaurar variável CSS para botões
            document.documentElement.style.setProperty('--corBotao', configuracoesPadrao.corBotao);
            console.log('Botões restaurados');
        }

        // Atualizar variáveis CSS globais
        document.documentElement.style.setProperty('--dourado', configuracoesPadrao.cor);
        document.documentElement.style.setProperty('--preto', configuracoesPadrao.corFundo);
        document.documentElement.style.setProperty('--branco', configuracoesPadrao.corTexto);
        console.log('Variáveis CSS restauradas');

        // Não há configurações para limpar (localStorage desabilitado)
        console.log('Configurações não removidas (localStorage desabilitado)');

        // Atualiza os campos do modal para os valores padrão
        const elementos = {
            'titulo-app': configuracoesPadrao.titulo,
            'cor-titulo': configuracoesPadrao.cor,
            'cor-botao': configuracoesPadrao.corBotao,
            'cor-fundo': configuracoesPadrao.corFundo,
            'cor-texto': configuracoesPadrao.corTexto,
            'opacidade-fundo': configuracoesPadrao.opacidadeFundo
        };

        for (let id in elementos) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = elementos[id];
            }
        }
        console.log('Campos do modal atualizados para padrão');

        fecharModalPersonalizar();
        console.log('=== RESTAURAÇÃO CONCLUÍDA ===');
    } catch (error) {
        console.error("Erro ao restaurar configurações:", error);
        alert("Erro ao restaurar configurações: " + error.message);
    }
}

// Função para adicionar logo
export function adicionarLogo(files) {
    if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('logo-img').src = e.target.result;
            // Não salvar no localStorage
        };
        reader.readAsDataURL(files[0]);
    }
}

// Função para adicionar fundo
export function adicionarFundo(files) {
    if (files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.body.style.backgroundImage = `url('${e.target.result}')`;
            // Não salvar no localStorage
        };
        reader.readAsDataURL(files[0]);
    }
}

// Função para sincronizar campos hex com color pickers
function sincronizarCamposHex() {
    const camposCor = ['cor-titulo', 'cor-botao', 'cor-fundo', 'cor-texto'];

    camposCor.forEach(campo => {
        const colorInput = document.getElementById(campo);
        const hexInput = document.getElementById(campo + '-hex');

        if (colorInput && hexInput) {
            // Atualizar hex quando color picker muda
            colorInput.addEventListener('input', function() {
                hexInput.value = this.value.toUpperCase();
            });

            // Atualizar color picker quando hex muda
            hexInput.addEventListener('input', function() {
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    colorInput.value = this.value;
                }
            });
        }
    });

    // Atualizar valor da opacidade
    const opacidadeInput = document.getElementById('opacidade-fundo');
    const opacidadeValue = document.getElementById('opacidade-value');

    if (opacidadeInput && opacidadeValue) {
        opacidadeInput.addEventListener('input', function() {
            opacidadeValue.textContent = Math.round(parseFloat(this.value) * 100) + '%';
        });
    }
}

// Inicializar sincronização quando modal abre
document.addEventListener('DOMContentLoaded', function() {
    sincronizarCamposHex();
});

// Função para aplicar temas pré-definidos
export function aplicarTema(temaNome, salvar = true) {
    console.log('=== APLICANDO TEMA:', temaNome, 'SALVAR:', salvar, '===');

    // Remover seleção anterior
    const themeCards = document.querySelectorAll('.theme-card');
    themeCards.forEach(card => card.classList.remove('selected'));

    // Adicionar seleção ao tema clicado
    const selectedCard = document.querySelector(`[data-theme="${temaNome}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
        console.log('Tema selecionado visualmente:', temaNome);
    }

    const temas = {
        cyberpunk: {
            titulo: 'AGENDA CYBERPUNK',
            cor: '#00f6ff',
            corBotao: '#ff00c8',
            corFundo: '#030303',
            corTexto: '#e2ffff',
            opacidadeFundo: 0.97
        },
        dark: {
            titulo: 'AGENDA DARK',
            cor: '#ff4d24',
            corBotao: '#101010',
            corFundo: '#050505',
            corTexto: '#f0f0f0',
            opacidadeFundo: 0.98
        },
        clean: {
            titulo: 'AGENDA CLEAN',
            cor: '#0094ffff',
            corBotao: '#0a5b95d5',
            corFundo: '#f2f2f2ff',
            corTexto: '#2b2b2bff',
            opacidadeFundo: 1.0
        },
        neon: {
            titulo: 'AGENDA NEON',
            cor: '#3aff1d',
            corBotao: '#000000',
            corFundo: '#000000',
            corTexto: '#1c7b0dff',
            opacidadeFundo: 1.0
        },
        sunset: {
            titulo: 'AGENDA SUNSET',
            cor: '#ff3d02ff',
            corBotao: '#8c341aff',
            corFundo: '#020100ff',
            corTexto: '#ffffff',
            opacidadeFundo: 0.93
        },
        ocean: {
            titulo: 'AGENDA OCEAN',
            cor: '#6d9eff',
            corBotao: '#6f4bdb',
            corFundo: '#0b1117',
            corTexto: '#e8f0ff',
            opacidadeFundo: 0.94
        },
        forest: {
            titulo: 'AGENDA FOREST',
            cor: '#04992bff',
            corBotao: '#135e50',
            corFundo: '#025321ff',
            corTexto: '#eaffea',
            opacidadeFundo: 0.94
        },
        royal: {
            titulo: 'AGENDA ROYAL',
            cor: '#ffd300',
            corBotao: '#7a3f0f',
            corFundo: '#150800',
            corTexto: '#fff8e1',
            opacidadeFundo: 0.93
        },

        pastel: {
            titulo: 'AGENDA PASTEL',
            cor: '#ffb7c5',
            corBotao: '#3b8ec9ff',
            corFundo: '#e1ceb7ff',
            corTexto: '#000000ff',
            opacidadeFundo: 1.0
        },
        inferno: {
            titulo: 'AGENDA INFERNO',
            cor: '#ff1a00',
            corBotao: '#7a0000',
            corFundo: '#140000',
            corTexto: '#ffd1cc',
            opacidadeFundo: 0.9
        },
        metal: {
            titulo: 'AGENDA METAL',
            cor: '#d0d0d0',
            corBotao: '#3c3c3c',
            corFundo: '#1a1a1a',
            corTexto: '#f4f4f4',
            opacidadeFundo: 0.97
        },
        galaxy: {
            titulo: 'AGENDA GALAXY',
            cor: '#b17dff',
            corBotao: '#442b8a',
            corFundo: '#050018',
            corTexto: '#ede6ff',
            opacidadeFundo: 0.96
        },
        magma: {
            titulo: 'AGENDA MAGMA',
            cor: '#ff5a00',
            corBotao: '#7a0e0081',
            corFundo: '#1a0d0d',
            corTexto: '#ffeadd',
            opacidadeFundo: 0.93
        },
        ice: {
            titulo: 'AGENDA ICE',
            cor: '#357b89ff',
            corBotao: '#02647fff',
            corFundo: '#c2ccceff',
            corTexto: '#00303a',
            opacidadeFundo: 1.0
        },

        // NOVOS TEMAS
        midnight: {
            titulo: 'AGENDA MIDNIGHT',
            cor: '#4a6eff',
            corBotao: '#111933',
            corFundo: '#05070c',
            corTexto: '#d9e3ff',
            opacidadeFundo: 0.95
        },
        goldblack: {
            titulo: 'AGENDA GOLD BLACK',
            cor: '#ffcc33',
            corBotao: '#000000',
            corFundo: '#0a0a0a',
            corTexto: '#ffe9a8',
            opacidadeFundo: 0.95
        },
        sakura: {
            titulo: 'AGENDA SAKURA',
            cor: '#ab2f4cff',
            corBotao: '#d5496cff',
            corFundo: '#ffe8ef',
            corTexto: '#000000ff',
            opacidadeFundo: 1.0
        },
        emerald: {
            titulo: 'AGENDA EMERALD',
            cor: '#00c07a',
            corBotao: '#006647',
            corFundo: '#002e1f',
            corTexto: '#d8fff2',
            opacidadeFundo: 0.95
        },
        storm: {
            titulo: 'AGENDA STORM',
            cor: '#8eb5ff',
            corBotao: '#2f3f66',
            corFundo: '#0e121a',
            corTexto: '#e8eeff',
            opacidadeFundo: 0.95
        },
        berserk: {
            titulo: 'AGENDA BERSERK',
            cor: '#FF0000',
            corBotao: '#000000',
            corFundo: '#333333',
            corTexto: '#ffffff',
            opacidadeFundo: 0.95
        }
    };


    const tema = temas[temaNome];
    if (!tema) {
        console.error('Tema não encontrado:', temaNome);
        return;
    }

    console.log('Aplicando configurações do tema:', tema);

    // Remover classes de tema anteriores
    document.body.classList.remove('tema-cyberpunk', 'tema-neon');

    // Aplicar tema na interface
    const appTitle = document.getElementById('app-title');
    if (appTitle) {
        appTitle.textContent = tema.titulo;
        appTitle.style.color = tema.cor;
        console.log('Título aplicado:', tema.titulo);
    }

    document.body.style.backgroundColor = `rgba(${hexToRgb(tema.corFundo)}, ${tema.opacidadeFundo})`;
    document.body.style.color = tema.corTexto;
    document.body.style.backgroundImage = 'none'; // Remove imagem de fundo ao aplicar tema
    console.log('Fundo e texto aplicados');

    // Adicionar classe específica do tema para efeitos especiais
    if (temaNome === 'cyberpunk' || temaNome === 'neon') {
        document.body.classList.add(`tema-${temaNome}`);
        console.log('Classe de tema aplicada:', `tema-${temaNome}`);
    }

    const botoes = document.querySelectorAll('button');
    if (botoes.length > 0) {
        botoes.forEach(button => {
            button.style.backgroundColor = tema.corBotao;
            button.style.color = '#FFFFFF';
        });
        // Atualizar variável CSS para botões
        document.documentElement.style.setProperty('--corBotao', tema.corBotao);
        console.log('Botões aplicados');
    }

    // Atualizar variáveis CSS globais
    document.documentElement.style.setProperty('--dourado', tema.cor);
    document.documentElement.style.setProperty('--preto', tema.corFundo);
    document.documentElement.style.setProperty('--branco', tema.corTexto);
    console.log('Variáveis CSS aplicadas');

    // Salvar configurações se solicitado
    if (salvar) {
        console.log('Tema não salvo (localStorage desabilitado):', temaNome);
    }

    console.log('=== TEMA APLICADO ===');
}
