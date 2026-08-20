// ==========================================
// 1. ESTADO DO JOGO (VARIÁVEIS PRINCIPAIS)
// ==========================================
let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;

let nivelCafeteira = 1;
let precoUpgrade = 50;

// Lista de Clientes da Vila Cogumelo
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

// ==========================================
// 2. REFERÊNCIAS DO HTML (DOM)
// ==========================================
const qtdMoedasElement = document.getElementById('qtd-moedas');
const textoPedidoElement = document.getElementById('texto-pedido');
const btnPause = document.getElementById('btn-pause');
const musica = document.getElementById('musica-fundo'); // Movido para cá!

// ==========================================
// 3. FUNÇÕES DO JOGO
// ==========================================

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
    textoPedidoElement.innerText = `${clienteAtual.nome}: Quero um(a) ${clienteAtual.pedido}!`;
}

// Função para Comprar Melhoria na Lojinha
function comprarUpgrade() {
    if (moedas >= precoUpgrade) {
        moedas -= precoUpgrade;
        nivelCafeteira++;
        precoUpgrade *= 2; // O próximo upgrade fica mais caro
        
        if (qtdMoedasElement) {
            qtdMoedasElement.innerText = moedas;
        }
        
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
        qtdMoedasElement.innerText = moedas;
        textoPedidoElement.innerText = "Muito obrigado! ❤️";
        
        // Quanto maior o nível da cafeteira, menor o tempo de espera (mínimo de 400ms)
        const tempoEspera = Math.max(400, 1800 - (nivelCafeteira * 300));
        
        clienteAtual = null;
        setTimeout(novoCliente, tempoEspera);
    } else {
        // Errou o pedido
        textoPedidoElement.innerText = "Ops! Não foi isso que eu pedi...";
    }
}

// ==========================================
// 4. EVENTOS E INICIALIZAÇÃO
// ==========================================

// Botão de Pause
btnPause.addEventListener('click', () => {
    jogoPausado = !jogoPausado;
    btnPause.innerText = jogoPausado ? "Continuar" : "Pausar";
});

// Referência da música de fundo
const musica = document.getElementById('musica-fundo');

function iniciarMusica() {
    if (musica) {
        musica.volume = 0.25; // Volume a 25%
        
        // Garante que a música volte ao início e toque de novo quando terminar
        musica.onended = () => {
            musica.currentTime = 0;
            musica.play();
        };

        musica.play().catch(erro => {
            console.log("Aguardando interação para tocar o som:", erro);
        });
    }
}

// Inicia a música assim que o jogador clicar em QUALQUER lugar do jogo
document.addEventListener('click', iniciarMusica, { once: true });

// Lista de itens/upgrades da loja
const itensLojinha = [
  // --- CARDÁPIO ---
  {
    id: "muffin_cogumelo",
    nome: "Muffin de Mirtilo",
    tipo: "cardapio",
    preco: 50,
    comprado: false,
    descricao: "Um doce fofinho que atrai novos clientes!",
    icone: "🧁"
  },
  {
    id: "cha_estelar",
    nome: "Chá de Camomila Estelar",
    tipo: "cardapio",
    preco: 80,
    comprado: false,
    descricao: "Bebida relaxante que aumenta o valor das gorjetas.",
    icone: "🍵"
  },

  // --- PERSONAGENS / CLIENTES ---
  {
    id: "cliente_fada",
    nome: "Cliente Fada Luminosa",
    tipo: "personagem",
    preco: 150,
    comprado: false,
    descricao: "Uma fada exigente que paga o dobro pelas bebidas!",
    icone: "🧚‍♀️"
  },
  {
    id: "cliente_duende",
    nome: "Duende Ancião",
    tipo: "personagem",
    preco: 250,
    comprado: false,
    descricao: "Um cliente calmo que deixa gorjetas astronômicas.",
    icone: "🧝"
  },

  // --- ESTRUTURA ---
  {
    id: "mesa_extra",
    nome: "Mesa de Madeira Nobre",
    tipo: "infraestrutura",
    preco: 200,
    comprado: false,
    descricao: "Permite receber mais clientes ao mesmo tempo na cafeteria.",
    icone: "🪑"
  }
];

// Função para realizar a compra de um item
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
    
    // Atualiza a interface
    atualizarEconomia();
    desbloquearConteudoJogo(item);
    renderizarLojinha();
    
    alert(`Sucesso! Você comprou: ${item.nome}! 🎉`);
  } else {
    alert("Moedas insuficientes! Atenda mais clientes na cafeteria para juntar moedas.");
  }
}

// Ativa o benefício do item no jogo
function desbloquearConteudoJogo(item) {
  if (item.tipo === "cardapio") {
    // Código para adicionar a receita no cardápio de preparo
    console.log(`Receita ${item.nome} adicionada ao cardápio!`);
  } else if (item.tipo === "personagem") {
    // Código para incluir o novo personagem na fila de clientes
    console.log(`Personagem ${item.nome} agora pode visitar a loja!`);
  } else if (item.tipo === "infraestrutura") {
    // Aumenta a capacidade da loja
    console.log(`Nova mesa liberada!`);
  }
}

function atualizarEconomia() {
  document.getElementById("contador-moedas").innerText = moedas;
}

function renderizarLojinha() {
  const container = document.getElementById("container-itens-loja");
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

// Inicializa a lojinha ao carregar
renderizarLojinha();
