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
        foto: "customer-2.png" // Nome exato do arquivo de imagem do cliente
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

// Botão de Pause
btnPause.addEventListener('click', () => {
    jogoPausado = !jogoPausado;
    btnPause.innerText = jogoPausado ? "Continuar" : "Pausar";
});

// Inicia o primeiro cliente assim que a página carrega
window.onload = () => {
    novoCliente();
};
