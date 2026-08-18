// Estado do Jogo (Variáveis Principais)
let moedas = 0;
let clienteAtual = null;
let jogoPausado = false;

// Lista de Clientes da Vila Cogumelo
const clientes = [
    { nome: "Musguinho", pedido: "Chá", recompensa: 10, sprite: "musguinho.png" },
    { nome: "Cerejinha", pedido: "Bolo", recompensa: 15, sprite: "cerejinha.png" }
];

// Elementos da Tela (DOM)
const qtdMoedasElement = document.getElementById('qtd-moedas');
const textoPedidoElement = document.getElementById('texto-pedido');
const btnPause = document.getElementById('btn-pause');

// Função para Gerar um Novo Cliente
function novoCliente() {
    if (jogoPausado) return;

    // Sorteia um cliente da lista
    const indice = Math.floor(Math.random() * clientes.length);
    clienteAtual = clientes[indice];

    // Atualiza a fala do cliente na tela
    textoPedidoElement.innerText = `${clienteAtual.nome}: Quero um(a) ${clienteAtual.pedido}!`;
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
