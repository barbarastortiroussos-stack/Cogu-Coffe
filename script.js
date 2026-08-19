// Estado do Jogo (Variáveis Principais)
let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;

let nivelCafeteira = 1;
let precoUpgrade = 50;

// Lista de Clientes da Vila Cogumelo
const clientes = [
    { nome: "Musguinho", pedidosPossiveis: ["Chá", "Bolo"], recompensaBase: 10 },
    { nome: "Cerejinha", pedidosPossiveis: ["Café", "Torta", "Bolo"], recompensaBase: 15 }
];

// ==========================================
// 2. REFERÊNCIAS DO HTML (DOM)
// ==========================================
// Certifique-se de que essas variáveis apontam para os IDs corretos do seu HTML:
const textoPedidoElement = document.getElementById('balao-pedido');
const qtdMoedasElement = document.getElementById('moedas'); // Coloque o ID da sua div/span de moedas

// Elementos da Tela (DOM)
const qtdMoedasElement = document.getElementById('qtd-moedas');
const textoPedidoElement = document.getElementById('texto-pedido');
const btnPause = document.getElementById('btn-pause');

// Função para Gerar um Novo Cliente
// Substitua a sua função antigo 'novoCliente' por esta nova versão:
function novoCliente() {
    if (jogoPausado) return;

    // Sorteia o cliente
    const indiceCliente = Math.floor(Math.random() * clientes.length);
    clienteAtual = clientes[indiceCliente];

    // Sorteia o pedido dentro das opções desse cliente
    const opcoes = clienteAtual.pedidosPossiveis;
    const pedidoSorteado = opcoes[Math.floor(Math.random() * opcoes.length)];

    clienteAtual.pedido = pedidoSorteado; // Define o pedido da rodada
    textoPedidoElement.innerText = `${clienteAtual.nome}: Quero um(a) ${clienteAtual.pedido}!`;
}

function comprarUpgrade() {
    if (moedas >= precoUpgrade) {
        moedas -= precoUpgrade;
        nivelCafeteira++;
        precoUpgrade *= 2; // O próximo upgrade fica mais caro
        
        if (qtdMoedasElement) {
            qtdMoedasElement.innerText = moedas;
        }
        
        alert("Cafeteira melhorada! Clientes chegam mais rápido.");
    } else {
        alert("Moedas insuficientes!");
    }
}
// Função para Processar a Entrega do Pedido (Ativada pelos botões do HTML)
function entregarPedido(item) {
    if (jogoPausado || !clienteAtual) return;

    if (item === clienteAtual.pedido) {
        // Acertou o pedido!
        moedas += clienteAtual.recompensa;
        qtdMoedasElement.innerText = moedas;
        textoPedidoElement.innerText = "Muito obrigado! ❤️";
        
        // Aguarda 1.5 segundo e chama o próximo cliente
        clienteAtual = null;
        setTimeout(novoCliente, 1500);
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
