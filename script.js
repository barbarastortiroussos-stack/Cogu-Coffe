// ==========================================
// 1. ESTADO DO JOGO (VARIÁVEIS PRINCIPAIS)
// ==========================================
let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;

let nivelCafeteira = 1;
let precoUpgrade = 50;

// Lista Inicial de Clientes da Vila Cogumelo
const clientes = [
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
      foto: "customer-1.png" // Troque pelo caminho do sprite dela
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

// ==========================================
// 3. FUNÇÕES DO JOGO
// ==========================================

// Atualiza o contador de moedas na tela do jogo e na loja
function atualizarEconomia() {
  if (qtdMoedasElement) {
    qtdMoedasElement.innerText = moedas;
  }
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
}

// Função para Comprar Melhoria na Cafeteira
function comprarUpgrade() {
  if (moedas >= precoUpgrade) {
    moedas -= precoUpgrade;
    nivelCafeteira++;
    precoUpgrade *= 2; // O próximo upgrade fica mais caro
    
    atualizarEconomia();
    alert(`Cafeteira melhorada para o Nível ${nivelCafeteira}! Os clientes vão chegar mais rápido.`);
  } else {
    alert("Moedas insuficientes!");
  }
}

// Função para Processar a Entrega do Pedido
function entregarPedido(item) {
  if (jogoPausado || !clienteAtual) return;

  if (item === clienteAtual.pedido) {
    // Acertou o pedido!
    moedas += clienteAtual.recompensa;
    atualizarEconomia();
    
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
// 4. SISTEMA DA LOJINHA E DESBLOQUEIOS
// ==========================================

function comprarItem(idItem) {
  const item = itensLojinha.find(i => i.id === idItem);

  if (!item) return;

  if (item.comprado) {
    alert("Você já possui este item!");
    return;
  }

  if (moedas >= item.preco) {
    moedas -= item.preco;
    item.comprado = true;
    
    atualizarEconomia();
    desbloquearConteudoJogo(item);
    renderizarLojinha();
    
    alert(`Sucesso! Você comprou: ${item.nome}! 🎉`);
  } else {
    alert("Moedas insuficientes! Atenda mais clientes na cafeteria para juntar moedas.");
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
    // Adiciona o novo cliente comprado na lista de visitantes possíveis
    clientes.push(item.dadosCliente);
  }
}

function renderizarLojinha() {
  const container = document.getElementById("container-itens-loja");
  if (!container) return;
  
  container.innerHTML = ""; // Limpa a lista antes de redesenhar

  itensLojinha.forEach(item => {
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
// 5. EVENTOS E INICIALIZAÇÃO
// ==========================================

// Botão de Pause
if (btnPause) {
  btnPause.addEventListener('click', () => {
    jogoPausado = !jogoPausado;
    btnPause.innerText = jogoPausado ? "Continuar" : "Pausar";
  });
}

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
renderizarLojinha();
atualizarEconomia();
novoCliente(); // Inicia o primeiro cliente assim que o jogo abre
