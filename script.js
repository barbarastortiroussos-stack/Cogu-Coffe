// ==========================================
// 1. ESTADO DO JOGO (VARIÁVEIS PRINCIPAIS)
// ==========================================

let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;
let lojaAberta = false;
let diaTerminado = false;

let nivelCafeteira = 1;
let precoUpgrade = 50;

const CHAVE_SAVE = "coguCoffeeSave";

const CLIENTES_BASE = [
  {
    nome: "Mossling",
    pedidosPossiveis: ["Tea", "Cake"],
    recompensa: 10,
    foto: "customer-2.png"
  },
  {
    nome: "Cherryling",
    pedidosPossiveis: ["Coffee", "Pie", "Cake"],
    recompensa: 15,
    foto: "customer-1.png"
  }
];

const ICONES_PEDIDOS_BASE = {
  "Coffee": "☕",
  "Tea": "🍵",
  "Cake": "🍰",
  "Pie": "🥧"
};

let clientes = [];

const itensLojinha = [
  {
    id: "muffin_cogumelo",
    nome: "Blueberry Muffin",
    tipo: "cardapio",
    preco: 50,
    comprado: false,
    descricao: "A fluffy sweet treat that gets added to the order menu!",
    icone: "🧁",
    diaLiberacao: 1
  },
  {
    id: "cha_estelar",
    nome: "Starlight Chamomile Tea",
    tipo: "cardapio",
    preco: 80,
    comprado: false,
    descricao: "A relaxing drink added to the possible orders.",
    icone: "🍵",
    diaLiberacao: 2
  },
  {
    id: "cha_cogumelos",
    nome: "Mushroom Tea",
    tipo: "cardapio",
    preco: 0,
    comprado: false,
    descricao: "A secret village recipe — only earned by serving customers, not sold in the shop!",
    icone: "🍄",
    ocultoNaLoja: true
  },
  {
    id: "cliente_fada",
    nome: "Luminous Fairy",
    tipo: "personagem",
    preco: 150,
    comprado: false,
    descricao: "A demanding fairy joining the customer line!",
    icone: "🧚‍♀️",
    dadosCliente: {
      nome: "Luminous Fairy",
      pedidosPossiveis: ["Tea", "Starlight Chamomile Tea", "Cake"],
      recompensa: 30,
      foto: "luminous-fairy.png"
    }
  },
  {
    id: "cliente_duende",
    nome: "Elder Gnome",
    tipo: "personagem",
    preco: 250,
    comprado: false,
    descricao: "A noble customer who pays extremely high tips!",
    icone: "🧝",
    dadosCliente: {
      nome: "Elder Gnome",
      pedidosPossiveis: ["Coffee", "Blueberry Muffin", "Pie"],
      recompensa: 50,
      foto: "elder-gnome.png"
    }
  }
];

const FRASES_MOTIVADORAS = [
  "Every cup you serve makes the village a little cozier! ☕",
  "You're brewing more than coffee — you're brewing joy!",
  "Another wonderful day at Cogu Coffee. See you tomorrow!",
  "The village smiles because of you. Great work today!",
  "Small cups, big smiles. Keep it up!",
  "Rain or shine, Cogu Coffee always feels like home."
];

// ==========================================
// 2. REFERÊNCIAS DO HTML (DOM)
// ==========================================

const qtdMoedasElement = document.getElementById('qtd-moedas');
const textoPedidoElement = document.getElementById('texto-pedido');
const btnPause = document.getElementById('btn-pause');
const musica = document.getElementById('musica-fundo');
const barraPacienciaElement = document.getElementById('barra-paciencia');

const btnAbrirLoja = document.getElementById('btn-abrir-loja');
const btnFecharLoja = document.getElementById('btn-fechar-loja');
const lojaOverlayElement = document.getElementById('loja-overlay');
const areaClienteElement = document.getElementById('area-cliente');

const pedidoAtualBalcaoElement = document.getElementById('pedido-atual-balcao');
const setaEsquerdaElement = document.getElementById('seta-esquerda-balcao');
const setaDireitaElement = document.getElementById('seta-direita-balcao');
let indiceBalcaoAtual = 0;

const textoDiaElement = document.getElementById('texto-dia');
const barraDiaElement = document.getElementById('barra-dia');

const fimdiaOverlayElement = document.getElementById('fimdia-overlay');
const fimdiaTituloElement = document.getElementById('fimdia-titulo');
const fimdiaLucrosElement = document.getElementById('fimdia-lucros');
const fimdiaGastosElement = document.getElementById('fimdia-gastos');
const fimdiaSaldoElement = document.getElementById('fimdia-saldo');
const fimdiaReceitaElement = document.getElementById('fimdia-receita');
const fimdiaFraseElement = document.getElementById('fimdia-frase');
const btnProximoDia = document.getElementById('btn-proximo-dia');

const TEMPO_PACIENCIA_MS = 9000;
const INTERVALO_TICK_PACIENCIA_MS = 100;
let tempoRestantePaciencia = 0;
let intervaloPaciencia = null;

const TEMPO_DIA_MS = 120000;
const INTERVALO_TICK_DIA_MS = 200;
let contadorDias = 1;
let lucrosDia = 0;
let gastosDia = 0;
let tempoRestanteDia = 0;
let intervaloDia = null;

let contadorClientesAtendidos = 0;
let marcosResgatados = [];

const MARCOS_RECOMPENSA = [
  { quantidade: 5, tipo: 'item', itemId: 'cha_cogumelos', mensagem: "Secret recipe unlocked: Mushroom Tea! 🍄" },
  { quantidade: 15, tipo: 'moedas', valor: 40, mensagem: "Loyalty bonus: +40 coins! 🪙" },
  { quantidade: 30, tipo: 'moedas', valor: 90, mensagem: "Loyalty bonus: +90 coins! 🪙" }
];

const progressoMarcoElement = document.getElementById('progresso-marco');

// ==========================================
// 3. SALVAMENTO E CARREGAMENTO (localStorage)
// ==========================================

function salvarJogo() {
  const dadosSalvos = {
    moedas,
    nivelCafeteira,
    precoUpgrade,
    itensComprados: itensLojinha.filter(i => i.comprado).map(i => i.id),
    contadorClientesAtendidos,
    marcosResgatados,
    contadorDias,
    lucrosDia,
    gastosDia
  };

  try {
    localStorage.setItem(CHAVE_SAVE, JSON.stringify(dadosSalvos));
  } catch (erro) {
    console.log("Não foi possível salvar o progresso:", erro);
  }
}

function carregarJogo() {
  let dadosSalvos = null;
  try {
    const bruto = localStorage.getItem(CHAVE_SAVE);
    if (bruto) dadosSalvos = JSON.parse(bruto);
  } catch (erro) {
    console.log("Não foi possível carregar o progresso salvo:", erro);
  }

  clientes = CLIENTES_BASE.map(c => ({ ...c, pedidosPossiveis: [...c.pedidosPossiveis] }));

  if (!dadosSalvos) return;

  moedas = dadosSalvos.moedas ?? 0;
  nivelCafeteira = dadosSalvos.nivelCafeteira ?? 1;
  precoUpgrade = dadosSalvos.precoUpgrade ?? 50;
  contadorClientesAtendidos = dadosSalvos.contadorClientesAtendidos ?? 0;
  marcosResgatados = dadosSalvos.marcosResgatados ?? [];
  contadorDias = dadosSalvos.contadorDias ?? 1;
  lucrosDia = dadosSalvos.lucrosDia ?? 0;
  gastosDia = dadosSalvos.gastosDia ?? 0;

  const idsComprados = new Set(dadosSalvos.itensComprados || []);

  itensLojinha.forEach(item => {
    if (idsComprados.has(item.id)) {
      item.comprado = true;
      desbloquearConteudoJogo(item);
    }
  });
}

// ==========================================
// 4. SISTEMA DE NOTIFICAÇÕES (TOASTS)
// ==========================================

let containerToasts = null;

function garantirContainerToasts() {
  if (containerToasts) return containerToasts;
  containerToasts = document.createElement('div');
  containerToasts.id = 'container-toasts';
  document.body.appendChild(containerToasts);
  return containerToasts;
}

function mostrarToast(mensagem, tipo = 'info') {
  const container = garantirContainerToasts();
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerText = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-saindo');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// ==========================================
// 5. FUNÇÕES DO JOGO
// ==========================================

function verificarMarcos() {
  MARCOS_RECOMPENSA.forEach(marco => {
    if (contadorClientesAtendidos >= marco.quantidade && !marcosResgatados.includes(marco.quantidade)) {
      concederRecompensa(marco);
      marcosResgatados.push(marco.quantidade);
    }
  });
}

function concederRecompensa(marco) {
  if (marco.tipo === 'moedas') {
    moedas += marco.valor;
    lucrosDia += marco.valor;
    atualizarEconomia();
  } else if (marco.tipo === 'item') {
    const item = itensLojinha.find(i => i.id === marco.itemId);
    if (item && !item.comprado) {
      item.comprado = true;
      desbloquearConteudoJogo(item);
      renderizarLojinha();
      renderizarBalcao();
    }
  }

  mostrarToast(marco.mensagem, 'conquista');
  explodirParticulas();
}

function atualizarProgressoMarco() {
  if (!progressoMarcoElement) return;

  const proximoMarco = MARCOS_RECOMPENSA.find(m => !marcosResgatados.includes(m.quantidade));

  if (!proximoMarco) {
    progressoMarcoElement.innerText = `Customers served: ${contadorClientesAtendidos} — all rewards collected! 🏆`;
    return;
  }

  const faltam = Math.max(0, proximoMarco.quantidade - contadorClientesAtendidos);
  progressoMarcoElement.innerText = `Customers served: ${contadorClientesAtendidos} — ${faltam} more until the next reward`;
}

function mostrarTextoFlutuante(texto) {
  if (!areaClienteElement) return;
  const span = document.createElement('span');
  span.className = 'texto-flutuante';
  span.innerText = texto;
  areaClienteElement.appendChild(span);
  setTimeout(() => span.remove(), 1000);
}

function reiniciarAnimacao(elemento, classeAnimacao) {
  if (!elemento) return;
  elemento.classList.remove(classeAnimacao);
  void elemento.offsetWidth;
  elemento.classList.add(classeAnimacao);
}

function tremerBalao() {
  reiniciarAnimacao(document.getElementById('balao-pedido'), 'tremendo');
}

function explodirParticulas() {
  const emojis = ['🎉', '✨', '🪙', '🍄'];
  for (let i = 0; i < 14; i++) {
    const particula = document.createElement('span');
    particula.className = 'particula-conquista';
    particula.innerText = emojis[Math.floor(Math.random() * emojis.length)];

    const angulo = Math.random() * Math.PI * 2;
    const distancia = 70 + Math.random() * 90;
    particula.style.setProperty('--dx', `${Math.cos(angulo) * distancia}px`);
    particula.style.setProperty('--dy', `${Math.sin(angulo) * distancia}px`);

    document.body.appendChild(particula);
    setTimeout(() => particula.remove(), 900);
  }
}

function atualizarEconomia() {
  if (qtdMoedasElement) {
    qtdMoedasElement.innerText = moedas;
    reiniciarAnimacao(qtdMoedasElement, 'pulso');
  }
}

function obterPedidosDesbloqueados() {
  const conjunto = new Set();
  clientes.forEach(cliente => {
    cliente.pedidosPossiveis.forEach(pedido => conjunto.add(pedido));
  });
  return [...conjunto];
}

function obterIconePedido(nomePedido) {
  if (ICONES_PEDIDOS_BASE[nomePedido]) return ICONES_PEDIDOS_BASE[nomePedido];
  const itemCorrespondente = itensLojinha.find(i => i.nome === nomePedido);
  if (itemCorrespondente) return itemCorrespondente.icone;
  return "🍽️";
}

function renderizarBalcao() {
  if (!pedidoAtualBalcaoElement) return;
  const pedidos = obterPedidosDesbloqueados();
  pedidoAtualBalcaoElement.innerHTML = "";

  if (pedidos.length === 0) return;
  if (indiceBalcaoAtual >= pedidos.length) indiceBalcaoAtual = 0;

  const pedido = pedidos[indiceBalcaoAtual];
  const botao = document.createElement('button');
  botao.className = 'btn-item';
  botao.innerText = `${obterIconePedido(pedido)} ${pedido}`;
  botao.addEventListener('click', () => entregarPedido(pedido));
  pedidoAtualBalcaoElement.appendChild(botao);
}

function avancarBalcao(direcao) {
  const pedidos = obterPedidosDesbloqueados();
  if (pedidos.length === 0) return;
  indiceBalcaoAtual = (indiceBalcaoAtual + direcao + pedidos.length) % pedidos.length;
  renderizarBalcao();
}

if (setaEsquerdaElement) {
  setaEsquerdaElement.addEventListener('click', () => avancarBalcao(-1));
}
if (setaDireitaElement) {
  setaDireitaElement.addEventListener('click', () => avancarBalcao(1));
}

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'ArrowLeft') avancarBalcao(-1);
  if (evento.key === 'ArrowRight') avancarBalcao(1);
});

function novoCliente() {
  if (jogoPausado || diaTerminado) return;

  const indiceCliente = Math.floor(Math.random() * clientes.length);
  clienteAtual = clientes[indiceCliente];

  const spriteCliente = document.getElementById('sprite-cliente');
  if (spriteCliente && clienteAtual.foto) {
    spriteCliente.src = clienteAtual.foto;
  }

  const opcoes = clienteAtual.pedidosPossiveis;
  const pedidoSorteado = opcoes[Math.floor(Math.random() * opcoes.length)];

  clienteAtual.pedido = pedidoSorteado;
  if (textoPedidoElement) {
    textoPedidoElement.innerText = `${clienteAtual.nome}: I'd like a ${clienteAtual.pedido}, please!`;
  }

  iniciarPaciencia();
}

function iniciarPaciencia() {
  pararPaciencia();
  tempoRestantePaciencia = TEMPO_PACIENCIA_MS;
  atualizarBarraPaciencia();

  intervaloPaciencia = setInterval(() => {
    if (jogoPausado || lojaAberta || diaTerminado) return;

    tempoRestantePaciencia -= INTERVALO_TICK_PACIENCIA_MS;
    atualizarBarraPaciencia();

    if (tempoRestantePaciencia <= 0) {
      clientePerdeuPaciencia();
    }
  }, INTERVALO_TICK_PACIENCIA_MS);
}

function pararPaciencia() {
  if (intervaloPaciencia) {
    clearInterval(intervaloPaciencia);
    intervaloPaciencia = null;
  }
}

function atualizarBarraPaciencia() {
  if (!barraPacienciaElement) return;

  const porcentagem = Math.max(0, (tempoRestantePaciencia / TEMPO_PACIENCIA_MS) * 100);
  barraPacienciaElement.style.width = `${porcentagem}%`;

  barraPacienciaElement.classList.remove('paciencia-media', 'paciencia-baixa');
  if (porcentagem <= 25) {
    barraPacienciaElement.classList.add('paciencia-baixa');
  } else if (porcentagem <= 55) {
    barraPacienciaElement.classList.add('paciencia-media');
  }
}

function clientePerdeuPaciencia() {
  pararPaciencia();
  if (!clienteAtual) return;

  if (textoPedidoElement) {
    textoPedidoElement.innerText = `${clienteAtual.nome} lost their patience and left... 😤`;
  }
  mostrarToast("The customer left before being served in time!", 'erro');

  clienteAtual = null;
  setTimeout(novoCliente, 1200);
}

function comprarUpgrade() {
  if (moedas >= precoUpgrade) {
    const custo = precoUpgrade;
    moedas -= custo;
    gastosDia += custo;
    nivelCafeteira++;
    precoUpgrade *= 2;

    atualizarEconomia();
    salvarJogo();
    mostrarToast(`Café upgraded to Level ${nivelCafeteira}! Customers will arrive faster.`, 'sucesso');
  } else {
    mostrarToast("Not enough coins!", 'erro');
  }
}

function entregarPedido(item) {
  if (jogoPausado || lojaAberta || diaTerminado || !clienteAtual) return;

  if (item === clienteAtual.pedido) {
    pararPaciencia();
    moedas += clienteAtual.recompensa;
    lucrosDia += clienteAtual.recompensa;
    contadorClientesAtendidos++;
    atualizarEconomia();
    mostrarTextoFlutuante(`+${clienteAtual.recompensa} 🪙`);
    verificarMarcos();
    atualizarProgressoMarco();
    salvarJogo();

    if (textoPedidoElement) {
      textoPedidoElement.innerText = "Thank you so much! ❤️";
    }

    const tempoEspera = Math.max(400, 1800 - (nivelCafeteira * 300));
    clienteAtual = null;
    setTimeout(novoCliente, tempoEspera);
  } else {
    tremerBalao();
    if (textoPedidoElement) {
      textoPedidoElement.innerText = "Oops! That's not what I ordered...";
    }
  }
}

// ==========================================
// 6. SISTEMA DA LOJINHA E DESBLOQUEIOS
// ==========================================

function comprarItem(idItem) {
  const item = itensLojinha.find(i => i.id === idItem);
  if (!item) return;

  if (item.comprado) {
    mostrarToast("You already own this item!", 'info');
    return;
  }

  if (moedas >= item.preco) {
    moedas -= item.preco;
    gastosDia += item.preco;
    item.comprado = true;

    atualizarEconomia();
    desbloquearConteudoJogo(item);
    renderizarLojinha();
    renderizarBalcao();
    salvarJogo();

    mostrarToast(`Success! You got: ${item.nome}! 🎉`, 'sucesso');
  } else {
    mostrarToast("Not enough coins! Serve more customers at the café to earn coins.", 'erro');
  }
}

function desbloquearConteudoJogo(item) {
  if (item.tipo === "cardapio") {
    clientes.forEach(cliente => {
      if (!cliente.pedidosPossiveis.includes(item.nome)) {
        cliente.pedidosPossiveis.push(item.nome);
      }
    });
  } else if (item.tipo === "personagem" && item.dadosCliente) {
    const jaExiste = clientes.some(c => c.nome === item.dadosCliente.nome);
    if (!jaExiste) {
      clientes.push({ ...item.dadosCliente, pedidosPossiveis: [...item.dadosCliente.pedidosPossiveis] });
    }
  }
}

function itemDisponivelHoje(item) {
  return item.diaLiberacao === undefined || item.diaLiberacao <= contadorDias;
}

function renderizarLojinha() {
  const container = document.getElementById("container-itens-loja");
  if (!container) return;

  container.innerHTML = "";

  itensLojinha
    .filter(item => (!item.ocultoNaLoja || item.comprado) && itemDisponivelHoje(item))
    .forEach(item => {
      const card = document.createElement("div");
      card.className = `card-item ${item.comprado ? 'item-comprado' : ''}`;

      card.innerHTML = `
        <div class="icone-item">${item.icone}</div>
        <h3>${item.nome}</h3>
        <p>${item.descricao}</p>
        <button onclick="comprarItem('${item.id}')" ${item.comprado ? 'disabled' : ''}>
          ${item.comprado ? 'Owned ✓' : `Buy (🪙 ${item.preco})`}
        </button>
      `;
      container.appendChild(card);
    });
}

// ==========================================
// 7. SISTEMA DE ABRIR/FECHAR A LOJA (MODAL)
// ==========================================

function abrirLoja() {
  if (diaTerminado) return;
  lojaAberta = true;
  if (lojaOverlayElement) lojaOverlayElement.classList.add('ativo');
}

function fecharLoja() {
  lojaAberta = false;
  if (lojaOverlayElement) lojaOverlayElement.classList.remove('ativo');
}

if (btnAbrirLoja) btnAbrirLoja.addEventListener('click', abrirLoja);
if (btnFecharLoja) btnFecharLoja.addEventListener('click', fecharLoja);

if (lojaOverlayElement) {
  lojaOverlayElement.addEventListener('click', (evento) => {
    if (evento.target === lojaOverlayElement) fecharLoja();
  });
}

// ==========================================
// 8. SISTEMA DE DIA (TIMER + TELA FIM DE DIA)
// ==========================================

function iniciarDia() {
  pararDia();
  tempoRestanteDia = TEMPO_DIA_MS;
  atualizarBarraDia();

  if (textoDiaElement) textoDiaElement.innerText = `Day ${contadorDias}`;

  intervaloDia = setInterval(() => {
    if (jogoPausado || lojaAberta || diaTerminado) return;

    tempoRestanteDia -= INTERVALO_TICK_DIA_MS;
    atualizarBarraDia();

    if (tempoRestanteDia <= 0) {
      finalizarDia();
    }
  }, INTERVALO_TICK_DIA_MS);
}

function pararDia() {
  if (intervaloDia) {
    clearInterval(intervaloDia);
    intervaloDia = null;
  }
}

function atualizarBarraDia() {
  if (!barraDiaElement) return;
  const porcentagem = Math.max(0, (tempoRestanteDia / TEMPO_DIA_MS) * 100);
  barraDiaElement.style.width = `${porcentagem}%`;
}

function finalizarDia() {
  pararDia();
  pararPaciencia();
  diaTerminado = true;

  const receitaDoDia = itensLojinha.find(
    item => item.tipo === 'cardapio' && !item.ocultoNaLoja && item.diaLiberacao === contadorDias
  );

  if (fimdiaTituloElement) fimdiaTituloElement.innerText = `Day ${contadorDias} Complete!`;
  if (fimdiaLucrosElement) fimdiaLucrosElement.innerText = `🪙 ${lucrosDia}`;
  if (fimdiaGastosElement) fimdiaGastosElement.innerText = `🪙 ${gastosDia}`;
  if (fimdiaSaldoElement) fimdiaSaldoElement.innerText = `🪙 ${lucrosDia - gastosDia}`;

  if (fimdiaReceitaElement) {
    fimdiaReceitaElement.innerText = receitaDoDia
      ? `🍽️ New recipe available in the shop: ${receitaDoDia.nome}!`
      : "No new recipe today — check back tomorrow!";
  }

  if (fimdiaFraseElement) {
    fimdiaFraseElement.innerText = FRASES_MOTIVADORAS[Math.floor(Math.random() * FRASES_MOTIVADORAS.length)];
  }

  if (fimdiaOverlayElement) fimdiaOverlayElement.classList.add('ativo');

  salvarJogo();
}

// ==========================================
// INTEGRAÇÃO COM SDK Y8
// ==========================================

let y8Sdk = null;

window.addEventListener("y8sdk.ready", function () {
  if (typeof y8 !== 'undefined' && y8.sdk) {
    y8Sdk = y8.sdk();
    let appConfig = { appId: "SEU_APP_ID", autoLogin: true };
    let adConfig = { 
      gameId: "SEU_APP_ID", 
      test: false,
      preloadAdBreaks: "auto", 
      sound: "on", 
      onReady: () => console.log("Anúncios Y8 prontos para exibição") 
    };
    y8Sdk.init(appConfig, adConfig);
  }
});

function chamarAnuncioY8(callbackAoFechar) {
  if (y8Sdk && typeof y8Sdk.showAd === 'function') {
    definirPausa(true, true);
    if (window.audioManager) window.audioManager.pause();

    y8Sdk.showAd({
      type: "start",
      name: "end-of-day",
      beforeAd: () => console.log("Anúncio da Y8 vai começar"),
      afterAd: () => console.log("Anúncio da Y8 finalizado"),
      adBreakDone: (info) => {
        retomarAposAnuncio(callbackAoFechar);
      }
    }).catch((erro) => {
      console.log("Erro ao exibir anúncio da Y8 ou indisponível:", erro);
      retomarAposAnuncio(callbackAoFechar);
    });
  } else {
    console.log("SDK da Y8 não inicializado no momento da chamada");
    callbackAoFechar();
  }
}

function retomarAposAnuncio(callback) {
  definirPausa(false, true);
  if (window.audioManager) window.audioManager.resume();
  if (callback) callback();
}

function avancarProximoDia() {
  chamarAnuncioY8(() => {
    contadorDias++;
    lucrosDia = 0;
    gastosDia = 0;
    diaTerminado = false;

    if (fimdiaOverlayElement) fimdiaOverlayElement.classList.remove('ativo');

    renderizarLojinha();
    salvarJogo();
    iniciarDia();

    clienteAtual = null;
    novoCliente();
  });
}

if (btnProximoDia) {
  btnProximoDia.addEventListener('click', avancarProximoDia);
}

// ==========================================
// 9. EVENTOS E INICIALIZAÇÃO
// ==========================================

let pausadoManualmente = false;

function definirPausa(pausar, porTrocaDeAba = false) {
  if (!porTrocaDeAba) pausadoManualmente = pausar;

  jogoPausado = pausar;
  if (btnPause) {
    btnPause.innerText = jogoPausado ? "Continue" : "Pause";
  }
  if (musica) {
    if (jogoPausado) musica.pause();
    else musica.play().catch(() => {});
  }
}

if (btnPause) {
  btnPause.addEventListener('click', () => {
    definirPausa(!jogoPausado);
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    definirPausa(true, true);
  } else if (!pausadoManualmente) {
    definirPausa(false, true);
  }
});

window.addEventListener('beforeunload', salvarJogo);

function iniciarMusica() {
  if (musica) {
    musica.volume = 0.25;
    musica.onended = () => {
      musica.currentTime = 0;
      musica.play();
    };
    musica.play().catch(erro => {
      console.log("Aguardando interação para tocar o som:", erro);
    });
  }
}

document.addEventListener('click', iniciarMusica, { once: true });

window.audioManager = {
  pause: function() {
    if (musica) musica.pause();
  },
  resume: function() {
    if (musica && !jogoPausado) musica.play().catch(() => {});
  }
};

carregarJogo();
renderizarLojinha();
renderizarBalcao();
atualizarEconomia();
atualizarProgressoMarco();
iniciarDia();
novoCliente();
