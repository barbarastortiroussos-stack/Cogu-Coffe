// ==========================================
// 1. ESTADO DO JOGO (VARIÁVEIS PRINCIPAIS)
// ==========================================
let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;

let nivelCafeteira = 1;
let precoUpgrade = 50;

const CHAVE_SAVE = "coguCoffeeSave";

// Lista Inicial de Clientes da Vila Cogumelo (fonte da verdade — nunca é alterada)
const CLIENTES_BASE = [
  {
    nome: "Musguinho",
    pedidosPossiveis: ["Chá", "Bolo"],
    recompensa: 10,
    foto: "customer-2.png"
  },
  {
    nome: "Cerejinha",
    pedidosPossiveis: ["Café", "Torta", "Bolo"],
    recompensa: 15,
    foto: "customer-1.png"
  }
];

// Ícones dos pedidos "de base" (os que já vinham fixos no balcão)
const ICONES_PEDIDOS_BASE = {
  "Café": "☕",
  "Chá": "🍵",
  "Bolo": "🍰",
  "Torta": "🥧"
};

// Lista de clientes atualmente ativos no jogo (recalculada a partir de CLIENTES_BASE + compras)
let clientes = [];

// Lista de Itens/Upgrades da Lojinha
const itensLojinha = [
  // --- CARDÁPIO ---
  {
    id: "muffin_cogumelo",
    nome: "Muffin de Mirtilo",
    tipo: "cardapio",
    preco: 50,
    comprado: false,
    descricao: "Um doce fofinho que entra no cardápio de pedidos!",
    icone: "🧁"
  },
  {
    id: "cha_estelar",
    nome: "Chá de Camomila Estelar",
    tipo: "cardapio",
    preco: 80,
    comprado: false,
    descricao: "Bebida relaxante adicionada aos pedidos possíveis.",
    icone: "🍵"
  },
  {
    id: "cha_cogumelos",
    nome: "Chá de Cogumelos",
    tipo: "cardapio",
    preco: 0,
    comprado: false,
    descricao: "Receita secreta da vila — só é conquistada atendendo clientes, não é vendida na loja!",
    icone: "🍄",
    ocultoNaLoja: true // não aparece como comprável; só some da lista de "oculto" quando desbloqueado por marco
  },

  // --- PERSONAGENS / CLIENTES ---
  {
    id: "cliente_fada",
    nome: "Fada Luminosa",
    tipo: "personagem",
    preco: 150,
    comprado: false,
    descricao: "Uma fada exigente que entra para a fila de clientes!",
    icone: "🧚‍♀️",
    dadosCliente: {
      nome: "Fada Luminosa",
      pedidosPossiveis: ["Chá", "Chá de Camomila Estelar", "Bolo"],
      recompensa: 30,
      foto: "Gemini_Generated_Image_35y1fw35y1fw35y1.jpg" // Troque pelo caminho do sprite dela
    }
  },
  {
    id: "cliente_duende",
    nome: "Duende Ancião",
    tipo: "personagem",
    preco: 250,
    comprado: false,
    descricao: "Um cliente nobre que paga gorjetas altíssimas!",
    icone: "🧝",
    dadosCliente: {
      nome: "Duende Ancião",
      pedidosPossiveis: ["Café", "Muffin de Mirtilo", "Torta"],
      recompensa: 50,
      foto: "customer-2.png" // Troque pelo caminho do sprite dele
    }
  }
];

// ==========================================
// 2. REFERÊNCIAS DO HTML (DOM)
// ==========================================
const qtdMoedasElement = document.getElementById('qtd-moedas');
const textoPedidoElement = document.getElementById('texto-pedido');
const btnPause = document.getElementById('btn-pause');
const musica = document.getElementById('musica-fundo');
const balcaoElement = document.getElementById('balcao');
const barraPacienciaElement = document.getElementById('barra-paciencia');

// Tempo que cada cliente espera antes de ir embora, e intervalo de atualização da barra
const TEMPO_PACIENCIA_MS = 9000;
const INTERVALO_TICK_PACIENCIA_MS = 100;

let tempoRestantePaciencia = 0;
let intervaloPaciencia = null;

// ==========================================
// SISTEMA DE MARCOS DE RECOMPENSA (ENGAJAMENTO)
// ==========================================
let contadorClientesAtendidos = 0;
let marcosResgatados = []; // guarda as "quantidade" já premiadas, pra não repetir

const MARCOS_RECOMPENSA = [
  { quantidade: 5, tipo: 'item', itemId: 'cha_cogumelos', mensagem: "Receita secreta desbloqueada: Chá de Cogumelos! 🍄" },
  { quantidade: 15, tipo: 'moedas', valor: 40, mensagem: "Bônus de fidelidade: +40 moedas! 🪙" },
  { quantidade: 30, tipo: 'moedas', valor: 90, mensagem: "Bônus de fidelidade: +90 moedas! 🪙" }
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
    marcosResgatados
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

  // Reconstrói a lista de clientes sempre a partir da base (evita duplicar em saves antigos)
  clientes = CLIENTES_BASE.map(c => ({ ...c, pedidosPossiveis: [...c.pedidosPossiveis] }));

  if (!dadosSalvos) return;

  moedas = dadosSalvos.moedas ?? 0;
  nivelCafeteira = dadosSalvos.nivelCafeteira ?? 1;
  precoUpgrade = dadosSalvos.precoUpgrade ?? 50;
  contadorClientesAtendidos = dadosSalvos.contadorClientesAtendidos ?? 0;
  marcosResgatados = dadosSalvos.marcosResgatados ?? [];

  const idsComprados = new Set(dadosSalvos.itensComprados || []);

  itensLojinha.forEach(item => {
    if (idsComprados.has(item.id)) {
      item.comprado = true;
      desbloquearConteudoJogo(item); // reaplica o efeito da compra (cardápio ou novo cliente)
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

// tipo: 'sucesso' | 'erro' | 'info'
function mostrarToast(mensagem, tipo = 'info') {
  const container = garantirContainerToasts();

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerText = mensagem;

  container.appendChild(toast);

  // Remove sozinho depois de alguns segundos
  setTimeout(() => {
    toast.classList.add('toast-saindo');
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// ==========================================
// 5. FUNÇÕES DO JOGO
// ==========================================

// Confere se algum marco foi alcançado depois de atender mais um cliente
function verificarMarcos() {
  MARCOS_RECOMPENSA.forEach(marco => {
    if (contadorClientesAtendidos >= marco.quantidade && !marcosResgatados.includes(marco.quantidade)) {
      concederRecompensa(marco);
      marcosResgatados.push(marco.quantidade);
    }
  });
}

// Aplica a recompensa de um marco (moedas ou item liberado de graça)
function concederRecompensa(marco) {
  if (marco.tipo === 'moedas') {
    moedas += marco.valor;
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
}

// Atualiza o textinho de progresso no placar ("faltam X clientes para a próxima recompensa")
function atualizarProgressoMarco() {
  if (!progressoMarcoElement) return;

  const proximoMarco = MARCOS_RECOMPENSA.find(m => !marcosResgatados.includes(m.quantidade));

  if (!proximoMarco) {
    progressoMarcoElement.innerText = `Clientes atendidos: ${contadorClientesAtendidos} — todas as recompensas coletadas! 🏆`;
    return;
  }

  const faltam = Math.max(0, proximoMarco.quantidade - contadorClientesAtendidos);
  progressoMarcoElement.innerText = `Clientes atendidos: ${contadorClientesAtendidos} — faltam ${faltam} para a próxima recompensa`;
}

// Atualiza o contador de moedas na tela do jogo e na loja
function atualizarEconomia() {
  if (qtdMoedasElement) {
    qtdMoedasElement.innerText = moedas;
  }
}

// Descobre todos os tipos de pedido atualmente desbloqueados (união dos pedidos de todos os clientes)
function obterPedidosDesbloqueados() {
  const conjunto = new Set();
  clientes.forEach(cliente => {
    cliente.pedidosPossiveis.forEach(pedido => conjunto.add(pedido));
  });
  return [...conjunto];
}

// Descobre o ícone de um pedido: usa o ícone de base, ou o ícone cadastrado na lojinha, ou uma xícara genérica
function obterIconePedido(nomePedido) {
  if (ICONES_PEDIDOS_BASE[nomePedido]) return ICONES_PEDIDOS_BASE[nomePedido];

  const itemCorrespondente = itensLojinha.find(i => i.nome === nomePedido);
  if (itemCorrespondente) return itemCorrespondente.icone;

  return "🍽️";
}

// Redesenha os botões do balcão com base nos pedidos desbloqueados no momento
function renderizarBalcao() {
  if (!balcaoElement) return;

  balcaoElement.innerHTML = "";

  obterPedidosDesbloqueados().forEach(pedido => {
    const botao = document.createElement('button');
    botao.className = 'btn-item';
    botao.innerText = `${obterIconePedido(pedido)} ${pedido}`;
    botao.addEventListener('click', () => entregarPedido(pedido));
    balcaoElement.appendChild(botao);
  });
}

// Função para Gerar um Novo Cliente
function novoCliente() {
  if (jogoPausado) return;

  const indiceCliente = Math.floor(Math.random() * clientes.length);
  clienteAtual = clientes[indiceCliente];

  // Atualiza a imagem do cliente na tela
  const spriteCliente = document.getElementById('sprite-cliente');
  if (spriteCliente && clienteAtual.foto) {
    spriteCliente.src = clienteAtual.foto;
  }

  const opcoes = clienteAtual.pedidosPossiveis;
  const pedidoSorteado = opcoes[Math.floor(Math.random() * opcoes.length)];

  clienteAtual.pedido = pedidoSorteado;
  if (textoPedidoElement) {
    textoPedidoElement.innerText = `${clienteAtual.nome}: Quero um(a) ${clienteAtual.pedido}!`;
  }

  iniciarPaciencia();
}

// Inicia (ou reinicia) o cronômetro de paciência do cliente atual
function iniciarPaciencia() {
  pararPaciencia(); // por segurança, garante que não haja dois timers rodando ao mesmo tempo

  tempoRestantePaciencia = TEMPO_PACIENCIA_MS;
  atualizarBarraPaciencia();

  intervaloPaciencia = setInterval(() => {
    if (jogoPausado) return; // não desconta paciência enquanto o jogo está pausado

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

// Atualiza a largura e a cor da barra de acordo com o tempo restante
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

// Chamado quando o tempo do cliente atual chega a zero
function clientePerdeuPaciencia() {
  pararPaciencia();
  if (!clienteAtual) return;

  if (textoPedidoElement) {
    textoPedidoElement.innerText = `${clienteAtual.nome} perdeu a paciência e foi embora... 😤`;
  }
  mostrarToast("O cliente foi embora sem ser atendido a tempo!", 'erro');

  clienteAtual = null;
  setTimeout(novoCliente, 1200);
}

// Função para Comprar Melhoria na Cafeteira
function comprarUpgrade() {
  if (moedas >= precoUpgrade) {
    moedas -= precoUpgrade;
    nivelCafeteira++;
    precoUpgrade *= 2; // O próximo upgrade fica mais caro

    atualizarEconomia();
    salvarJogo();
    mostrarToast(`Cafeteira melhorada para o Nível ${nivelCafeteira}! Os clientes vão chegar mais rápido.`, 'sucesso');
  } else {
    mostrarToast("Moedas insuficientes!", 'erro');
  }
}

// Função para Processar a Entrega do Pedido
function entregarPedido(item) {
  if (jogoPausado || !clienteAtual) return;

  if (item === clienteAtual.pedido) {
    // Acertou o pedido!
    pararPaciencia();
    moedas += clienteAtual.recompensa;
    contadorClientesAtendidos++;
    atualizarEconomia();
    verificarMarcos();
    atualizarProgressoMarco();
    salvarJogo();

    if (textoPedidoElement) {
      textoPedidoElement.innerText = "Muito obrigado! ❤️";
    }

    // Quanto maior o nível da cafeteira, menor o tempo de espera (mínimo de 400ms)
    const tempoEspera = Math.max(400, 1800 - (nivelCafeteira * 300));

    clienteAtual = null;
    setTimeout(novoCliente, tempoEspera);
  } else {
    // Errou o pedido
    if (textoPedidoElement) {
      textoPedidoElement.innerText = "Ops! Não foi isso que eu pedi...";
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
    mostrarToast("Você já possui este item!", 'info');
    return;
  }

  if (moedas >= item.preco) {
    moedas -= item.preco;
    item.comprado = true;

    atualizarEconomia();
    desbloquearConteudoJogo(item);
    renderizarLojinha();
    renderizarBalcao();
    salvarJogo();

    mostrarToast(`Sucesso! Você comprou: ${item.nome}! 🎉`, 'sucesso');
  } else {
    mostrarToast("Moedas insuficientes! Atenda mais clientes na cafeteria para juntar moedas.", 'erro');
  }
}

// Conecta as compras diretamente com a mecânica do jogo!
function desbloquearConteudoJogo(item) {
  if (item.tipo === "cardapio") {
    // Adiciona o novo item comprado à lista de pedidos de TODOS os clientes existentes
    clientes.forEach(cliente => {
      if (!cliente.pedidosPossiveis.includes(item.nome)) {
        cliente.pedidosPossiveis.push(item.nome);
      }
    });
  } else if (item.tipo === "personagem" && item.dadosCliente) {
    // Adiciona o novo cliente comprado na lista de visitantes possíveis (evita duplicar)
    const jaExiste = clientes.some(c => c.nome === item.dadosCliente.nome);
    if (!jaExiste) {
      clientes.push({ ...item.dadosCliente, pedidosPossiveis: [...item.dadosCliente.pedidosPossiveis] });
    }
  }
}

function renderizarLojinha() {
  const container = document.getElementById("container-itens-loja");
  if (!container) return;

  container.innerHTML = ""; // Limpa a lista antes de redesenhar

  itensLojinha
    .filter(item => !item.ocultoNaLoja || item.comprado)
    .forEach(item => {
    const card = document.createElement("div");
    card.className = `card-item ${item.comprado ? 'item-comprado' : ''}`;

    card.innerHTML = `
      <div class="icone-item">${item.icone}</div>
      <h3>${item.nome}</h3>
      <p>${item.descricao}</p>
      <button 
        onclick="comprarItem('${item.id}')" 
        ${item.comprado ? 'disabled' : ''}>
        ${item.comprado ? 'Adquirido ✓' : `Comprar (🪙 ${item.preco})`}
      </button>
    `;

    container.appendChild(card);
  });
}

// ==========================================
// 7. EVENTOS E INICIALIZAÇÃO
// ==========================================

// Botão de Pause
let pausadoManualmente = false; // controla se foi o JOGADOR quem pausou (pra não "despausar" sozinho)

function definirPausa(pausar, porTrocaDeAba = false) {
  if (!porTrocaDeAba) pausadoManualmente = pausar;

  jogoPausado = pausar;
  if (btnPause) {
    btnPause.innerText = jogoPausado ? "Continuar" : "Pausar";
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

// Pausa automaticamente quando o jogador troca de aba/minimiza (recomendado por Poki/CrazyGames)
// e retoma sozinho ao voltar — mas só se o jogador não tinha pausado manualmente antes
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    definirPausa(true, true);
  } else if (!pausadoManualmente) {
    definirPausa(false, true);
  }
});

// Salva o progresso automaticamente antes de fechar a aba
window.addEventListener('beforeunload', salvarJogo);

// Música de Fundo
function iniciarMusica() {
  if (musica) {
    musica.volume = 0.25; // Volume a 25%

    musica.onended = () => {
      musica.currentTime = 0;
      musica.play();
    };

    musica.play().catch(erro => {
      console.log("Aguardando interação para tocar o som:", erro);
    });
  }
}

// Inicia a música no primeiro clique do jogador
document.addEventListener('click', iniciarMusica, { once: true });

// Inicializações de início de jogo
carregarJogo();
renderizarLojinha();
renderizarBalcao();
atualizarEconomia();
atualizarProgressoMarco();
novoCliente(); // Inicia o primeiro cliente assim que o jogo abre
