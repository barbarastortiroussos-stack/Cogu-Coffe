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



// Lista Inicial de Clientes da Vila Cogumelo (fonte da verdade — nunca é alterada)

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



// Ícones dos pedidos "de base" (os que já vinham fixos no balcão)

const ICONES_PEDIDOS_BASE = {

  "Coffee": "☕",

  "Tea": "🍵",

  "Cake": "🍰",

  "Pie": "🥧"

};



// Lista de clientes atualmente ativos no jogo (recalculada a partir de CLIENTES_BASE + compras)

let clientes = [];



// Lista de Itens/Upgrades da Lojinha

const itensLojinha = [

  // --- CARDÁPIO ---

  // "diaLiberacao" = a partir de qual dia esse item aparece como comprável na loja

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

    ocultoNaLoja: true // não aparece como comprável; só some da lista de "oculto" quando desbloqueado por marco

  },



  // --- PERSONAGENS / CLIENTES ---

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



// Frases mostradas aleatoriamente na tela de fim de dia

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



// Balcão em carrossel (um pedido por vez, com setas)

const pedidoAtualBalcaoElement = document.getElementById('pedido-atual-balcao');

const setaEsquerdaElement = document.getElementById('seta-esquerda-balcao');

const setaDireitaElement = document.getElementById('seta-direita-balcao');

let indiceBalcaoAtual = 0;



// Barra e textos do dia

const textoDiaElement = document.getElementById('texto-dia');

const barraDiaElement = document.getElementById('barra-dia');



// Tela de fim de dia

const fimdiaOverlayElement = document.getElementById('fimdia-overlay');

const fimdiaTituloElement = document.getElementById('fimdia-titulo');

const fimdiaLucrosElement = document.getElementById('fimdia-lucros');

const fimdiaGastosElement = document.getElementById('fimdia-gastos');

const fimdiaSaldoElement = document.getElementById('fimdia-saldo');

const fimdiaReceitaElement = document.getElementById('fimdia-receita');

const fimdiaFraseElement = document.getElementById('fimdia-frase');

const btnProximoDia = document.getElementById('btn-proximo-dia');



// Tempo que cada cliente espera antes de ir embora, e intervalo de atualização da barra

const TEMPO_PACIENCIA_MS = 9000;

const INTERVALO_TICK_PACIENCIA_MS = 100;



let tempoRestantePaciencia = 0;

let intervaloPaciencia = null;



// Duração de um "dia" (uma partida) e intervalo de atualização da barra de dia

const TEMPO_DIA_MS = 120000; // 2 minutos por dia — ajuste aqui se quiser dias mais curtos/longos

const INTERVALO_TICK_DIA_MS = 200;



let contadorDias = 1;

let lucrosDia = 0;

let gastosDia = 0;

let tempoRestanteDia = 0;

let intervaloDia = null;



// ==========================================

// SISTEMA DE MARCOS DE RECOMPENSA (ENGAJAMENTO)

// ==========================================

let contadorClientesAtendidos = 0;

let marcosResgatados = []; // guarda as "quantidade" já premiadas, pra não repetir



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



  // Reconstrói a lista de clientes sempre a partir da base (evita duplicar em saves antigos)

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



// tipo: 'sucesso' | 'erro' | 'info' | 'conquista'

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



// Atualiza o textinho de progresso no placar ("faltam X clientes para a próxima recompensa")

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



// ==========================================

// EFEITOS VISUAIS (GAME FEEL)

// ==========================================



// Mostra um texto subindo e sumindo (ex: "+10 🪙") perto do cliente

function mostrarTextoFlutuante(texto) {

  if (!areaClienteElement) return;



  const span = document.createElement('span');

  span.className = 'texto-flutuante';

  span.innerText = texto;

  areaClienteElement.appendChild(span);



  setTimeout(() => span.remove(), 1000);

}



// Reinicia a animação de "pulso" em um elemento (removendo e forçando reflow antes de reaplicar)

function reiniciarAnimacao(elemento, classeAnimacao) {

  if (!elemento) return;

  elemento.classList.remove(classeAnimacao);

  void elemento.offsetWidth; // força o navegador a "esquecer" o estado anterior da animação

  elemento.classList.add(classeAnimacao);

}



// Balãozinho treme quando o jogador entrega o pedido errado

function tremerBalao() {

  reiniciarAnimacao(document.getElementById('balao-pedido'), 'tremendo');

}



// Chuva de emojis quando um marco de recompensa é alcançado

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



// Atualiza o contador de moedas na tela do jogo e na loja

function atualizarEconomia() {

  if (qtdMoedasElement) {

    qtdMoedasElement.innerText = moedas;

    reiniciarAnimacao(qtdMoedasElement, 'pulso');

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



// ==========================================

// BALCÃO EM CARROSSEL (um pedido por vez + setas)

// ==========================================



// Redesenha o botão do pedido atualmente visível no carrossel

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



// Navega para o pedido anterior (-1) ou próximo (+1) do carrossel

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



// As setas do teclado (← →) fazem exatamente o mesmo que as setas touch

document.addEventListener('keydown', (evento) => {

  if (evento.key === 'ArrowLeft') avancarBalcao(-1);

  if (evento.key === 'ArrowRight') avancarBalcao(1);

});



// Função para Gerar um Novo Cliente

function novoCliente() {

  if (jogoPausado || diaTerminado) return;



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

    textoPedidoElement.innerText = `${clienteAtual.nome}: I'd like a ${clienteAtual.pedido}, please!`;

  }



  iniciarPaciencia();

}



// Inicia (ou reinicia) o cronômetro de paciência do cliente atual

function iniciarPaciencia() {

  pararPaciencia(); // por segurança, garante que não haja dois timers rodando ao mesmo tempo



  tempoRestantePaciencia = TEMPO_PACIENCIA_MS;

  atualizarBarraPaciencia();



  intervaloPaciencia = setInterval(() => {

    if (jogoPausado || lojaAberta || diaTerminado) return; // não desconta paciência pausado/loja aberta/fim de dia



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

    textoPedidoElement.innerText = `${clienteAtual.nome} lost their patience and left... 😤`;

  }

  mostrarToast("The customer left before being served in time!", 'erro');



  clienteAtual = null;

  setTimeout(novoCliente, 1200);

}



// Função para Comprar Melhoria na Cafeteira

function comprarUpgrade() {

  if (moedas >= precoUpgrade) {

    const custo = precoUpgrade;

    moedas -= custo;

    gastosDia += custo;

    nivelCafeteira++;

    precoUpgrade *= 2; // O próximo upgrade fica mais caro



    atualizarEconomia();

    salvarJogo();

    mostrarToast(`Café upgraded to Level ${nivelCafeteira}! Customers will arrive faster.`, 'sucesso');

  } else {

    mostrarToast("Not enough coins!", 'erro');

  }

}



// Função para Processar a Entrega do Pedido

function entregarPedido(item) {

  if (jogoPausado || lojaAberta || diaTerminado || !clienteAtual) return;



  if (item === clienteAtual.pedido) {

    // Acertou o pedido!

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



    // Quanto maior o nível da cafeteira, menor o tempo de espera (mínimo de 400ms)

    const tempoEspera = Math.max(400, 1800 - (nivelCafeteira * 300));



    clienteAtual = null;

    setTimeout(novoCliente, tempoEspera);

  } else {

    // Errou o pedido

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



// Um item de cardápio só aparece na loja a partir do dia configurado em "diaLiberacao"

function itemDisponivelHoje(item) {

  return item.diaLiberacao === undefined || item.diaLiberacao <= contadorDias;

}



function renderizarLojinha() {

  const container = document.getElementById("container-itens-loja");

  if (!container) return;



  container.innerHTML = ""; // Limpa a lista antes de redesenhar



  itensLojinha

    .filter(item => (!item.ocultoNaLoja || item.comprado) && itemDisponivelHoje(item))

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



if (btnAbrirLoja) {

  btnAbrirLoja.addEventListener('click', abrirLoja);

}



if (btnFecharLoja) {

  btnFecharLoja.addEventListener('click', fecharLoja);

}



// Fecha a loja se o jogador clicar no fundo escurecido (fora do painel)

if (lojaOverlayElement) {

  lojaOverlayElement.addEventListener('click', (evento) => {

    if (evento.target === lojaOverlayElement) {

      fecharLoja();

    }

  });

}



// ==========================================

// 8. SISTEMA DE DIA (TIMER DE PARTIDA + TELA DE FIM DE DIA)

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



// Encerra o dia atual e mostra a tela de resumo

function finalizarDia() {

  pararDia();

  pararPaciencia();

  diaTerminado = true;



  // A receita de cardápio que passou a ficar disponível justamente hoje

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



// Chamado quando o jogador clica em "Start Next Day"

// Chamado quando o jogador clica em "Start Next Day"

function avancarProximoDia() {

  // --- CHAMA O ANÚNCIO DA GAMEDISTRIBUTION ---

  if (typeof gamedistribution !== 'undefined' && gamedistribution.showAd) {

    gamedistribution.showAd();

  }



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

}



if (btnProximoDia) {

  btnProximoDia.addEventListener('click', avancarProximoDia);

}



// ==========================================

// 9. EVENTOS E INICIALIZAÇÃO

// ==========================================



// Botão de Pause

let pausadoManualmente = false; // controla se foi o JOGADOR quem pausou (pra não "despausar" sozinho)



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



// Gerenciador global de áudio para o SDK da GD controlar

window.audioManager = {

  pause: function() {

    if (musica) musica.pause();

  },

  resume: function() {

    if (musica && !jogoPausado) musica.play().catch(() => {});

  }

};



// Inicializações de início de jogo

carregarJogo();

renderizarLojinha();

renderizarBalcao();

atualizarEconomia();

atualizarProgressoMarco();

iniciarDia();

novoCliente(); // Inicia o primeiro cliente assim que o jogo abre 

