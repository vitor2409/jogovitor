const glyphs = [
    { simbolo: "𓂀", resposta: "Olho de Hórus", opcoes: ["Olho de Hórus", "Sol Nascente", "Pirâmide", "Ciclo da Vida"] },
    { simbolo: "𓇋", resposta: "Junco Florido (I)", opcoes: ["Junco Florido (I)", "Cajado", "Espada", "Faraó"] },
    { simbolo: "𓂻", resposta: "Par de Pernas (Andar)", opcoes: ["Correr", "Par de Pernas (Andar)", "Pular", "Dançar"] },
    { simbolo: "𓆣", resposta: "Besouro (Khepri)", opcoes: ["Cobra Real", "Gato Preto", "Besouro (Khepri)", "Águia"] },
    { simbolo: "𓊹", resposta: "Deus", opcoes: ["Deus", "Sacerdote", "Templo", "Eternidade"] },
    { simbolo: "𓁨", resposta: "Criança", opcoes: ["Adulto", "Criança", "Velho", "Família"] },
    { simbolo: "𓋹", resposta: "Ankh (Vida)", opcoes: ["Ankh (Vida)", "Morte", "Renascer", "Amor"] },
    { simbolo: "𓄿", resposta: "Falcão (Hórus)", opcoes: ["Águia", "Pássaro", "Falcão (Hórus)", "Coruja"] },
    { simbolo: "𓏏", resposta: "Pão", opcoes: ["Água", "Vinho", "Pão", "Fruta"] },
    { simbolo: "𓈖", resposta: "Água", opcoes: ["Fogo", "Terra", "Ar", "Água"] },
    { simbolo: "𓂋", resposta: "Boca (R)", opcoes: ["Orelha", "Nariz", "Boca (R)", "Olho"] },
    { simbolo: "𓂓", resposta: "Cesto (K)", opcoes: ["Vaso", "Cesto (K)", "Copo", "Caixa"] },
    { simbolo: "𓐑", resposta: "Mão (D)", opcoes: ["Pé", "Mão (D)", "Braço", "Dedo"] },
    { simbolo: "𓇽", resposta: "Estrela (Seba)", opcoes: ["Sol", "Lua", "Estrela (Seba)", "Nuvem"] },
    { simbolo: "𓀭", resposta: "Homem (Masculino)", opcoes: ["Mulher", "Criança", "Homem (Masculino)", "Deus"] },
    { simbolo: "𓏲", resposta: "Leão (Labu)", opcoes: ["Tigre", "Gato", "Leão (Labu)", "Cachorro"] }
];

let score = 0;
let indiceAtual = 0;
let tempo = 15;
let timer;
let glyphsEmbaralhados = [];

// Funções de áudio
// É importante que esses elementos existam e seus 'src' estejam corretos no HTML
const audioAcerto = document.getElementById("acerto");
const audioErro = document.getElementById("erro");
const audioVitoria = document.getElementById("vitoria");
const audioDerrota = document.getElementById("derrota");

const backgroundMusic = document.getElementById("backgroundMusic");
const toggleMusicButton = document.getElementById("toggleMusic");
let isMusicPlaying = false;

// Adiciona um volume inicial mais baixo para a música ambiente, se o elemento existir
if (backgroundMusic) {
    backgroundMusic.volume = 0.4;
}

// Função para tocar/pausar a música
function toggleMusic() {
    // Verifica se o elemento de áudio existe e se tem uma fonte válida antes de tentar tocar
    if (backgroundMusic && backgroundMusic.src) {
        if (isMusicPlaying) {
            backgroundMusic.pause();
            isMusicPlaying = false;
            toggleMusicButton.textContent = "Música: OFF";
        } else {
            const playPromise = backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isMusicPlaying = true;
                    toggleMusicButton.textContent = "Música: ON";
                }).catch(error => {
                    console.log("Erro ao tocar música (provavelmente política de autoplay):", error);
                    if (error.name === "NotAllowedError") {
                        // Alerta mais específico para política de autoplay
                        alert("Seu navegador bloqueou a reprodução automática. A música pode começar após a primeira interação (ex: iniciar o jogo).");
                    } else {
                        // Outros erros de reprodução
                        alert("Não foi possível iniciar a música. Verifique o arquivo de áudio.");
                    }
                });
            }
        }
    } else {
        console.warn("Elemento de música de fundo não encontrado ou sem fonte válida.");
        alert("A música de fundo não pode ser tocada. O arquivo pode estar faltando ou o caminho está incorreto.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (toggleMusicButton) {
        toggleMusicButton.addEventListener("click", toggleMusic);
    }
});

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

function iniciarJogo() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("jogo").classList.remove("hidden");
    reiniciar();
    // Tenta tocar a música ao iniciar o jogo, se não estiver tocando
    if (!isMusicPlaying) {
        toggleMusic(); // Reutiliza a função toggleMusic para tentar tocar
    }
}

function mostrarModoLivre() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("livre").classList.remove("hidden");
}

function voltarAoMenu() {
    document.getElementById("jogo").classList.add("hidden");
    document.getElementById("fim").classList.add("hidden");
    document.getElementById("livre").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    clearInterval(timer); // Para o timer se estiver ativo
}

function carregarGlyph() {
    clearInterval(timer);
    tempo = 15;
    document.getElementById("time").textContent = tempo;
    timer = setInterval(contarTempo, 1000);

    const atual = glyphsEmbaralhados[indiceAtual];
    document.getElementById("glyph").textContent = atual.simbolo;

    const botoes = document.querySelectorAll(".options button");
    const opcoesEmbaralhadas = shuffle([...atual.opcoes]);

    botoes.forEach((btn, i) => {
        btn.textContent = opcoesEmbaralhadas[i];
        btn.disabled = false; // <<< ESSENCIAL: HABILITA OS BOTÕES PARA A NOVA PERGUNTA
        btn.classList.remove("correct", "incorrect"); // Limpa classes de feedback
    });

    document.getElementById("feedback").textContent = "";
}

function contarTempo() {
    tempo--;
    document.getElementById("time").textContent = tempo;
    if (tempo <= 0) {
        clearInterval(timer);
        mostrarFeedback(false, true); // Tempo esgotado
    }
}

function checkAnswer(botao) {
    clearInterval(timer); // Para o timer imediatamente ao clicar
    const atual = glyphsEmbaralhados[indiceAtual];
    const resposta = botao.textContent;
    const correta = resposta === atual.resposta;

    mostrarFeedback(correta, false, botao);
}

function mostrarFeedback(correto, tempoEsgotado = false, botaoClicado = null) {
    const atual = glyphsEmbaralhados[indiceAtual];
    const botoes = document.querySelectorAll(".options button");
    
    // DESABILITA TODOS OS BOTÕES IMEDIATAMENTE PARA EVITAR MAIS CLIQUES
    botoes.forEach(btn => btn.disabled = true);

    const feedback = document.getElementById("feedback");

    if (correto) {
        score++;
        // Tenta tocar o áudio de acerto, se ele tiver uma fonte válida
        if (audioAcerto && audioAcerto.src) audioAcerto.play().catch(e => console.warn("Erro ao tocar áudio de acerto:", e));
        feedback.textContent = "✅ Correto!";
        if (botaoClicado) {
            botaoClicado.classList.add("correct");
        }
    } else {
        // Tenta tocar o áudio de erro, se ele tiver uma fonte válida
        if (audioErro && audioErro.src) audioErro.play().catch(e => console.warn("Erro ao tocar áudio de erro:", e));
        if (tempoEsgotado) {
            feedback.textContent = `⏰ Tempo esgotado! A resposta correta era: "${atual.resposta}"`;
        } else {
            feedback.textContent = `❌ Errado! A resposta correta era: "${atual.resposta}"`;
            if (botaoClicado) {
                botaoClicado.classList.add("incorrect");
            }
        }
        // Destaca a resposta correta mesmo se o usuário errou
        botoes.forEach(btn => {
            if (btn.textContent === atual.resposta) {
                btn.classList.add("correct");
            }
        });
    }

    document.getElementById("score").textContent = score;

    // Aguarda um pouco antes de ir para a próxima pergunta ou encerrar o jogo
    setTimeout(() => {
        indiceAtual++;
        if (indiceAtual >= glyphsEmbaralhados.length) {
            fimDeJogo();
        } else {
            carregarGlyph(); // Chama para carregar a próxima pergunta e reabilitar os botões
        }
    }, 2000); // Atraso de 2 segundos para mostrar o feedback
}

function fimDeJogo() {
    clearInterval(timer);
    document.getElementById("jogo").classList.add("hidden");
    document.getElementById("fim").classList.remove("hidden");
    document.getElementById("final-score").textContent = score;

    // Tenta tocar o áudio de vitória/derrota, se eles tiverem uma fonte válida
    if (score >= glyphs.length / 2) { // Critério simples de vitória: mais da metade correto
        if (audioVitoria && audioVitoria.src) audioVitoria.play().catch(e => console.warn("Erro ao tocar áudio de vitória:", e));
    } else {
        if (audioDerrota && audioDerrota.src) audioDerrota.play().catch(e => console.warn("Erro ao tocar áudio de derrota:", e));
    }
}

function reiniciar() {
    score = 0;
    indiceAtual = 0;
    glyphsEmbaralhados = shuffle([...glyphs]);
    document.getElementById("score").textContent = score;
    document.getElementById("fim").classList.add("hidden");
    document.getElementById("jogo").classList.remove("hidden");
    carregarGlyph();
}

// Modo livre - Hieroglyph Converter
document.addEventListener("DOMContentLoaded", () => {
    const textoLivreInput = document.getElementById("textoLivre");
    if (textoLivreInput) {
        textoLivreInput.addEventListener("input", () => {
            const texto = textoLivreInput.value;
            const mapa = {
                a: "𓄿", b: "𓃀", c: "𓎡", d: "𓂧", e: "𓇋", f: "𓆑",
                g: "𓎼", h: "𓎛", i: "𓇋", j: "𓆓", k: "𓎡", l: "𓃭",
                m: "𓅓", n: "𓈖", o: "𓅱", p: "𓊪", q: "𓎤", r: "𓂋",
                s: "𓋴", t: "𓏏", u: "𓅱", v: "𓆑", w: "𓅱", x: "𓐍",
                y: "𓇌", z: "𓊃",
                " ": " ", ".": "𓏏", ",": "𓏏", "!": "𓁢", "?": "𓐠",
                "0": "𓐠", "1": "𓏤", "2": "𓏥", "3": "𓏦", "4": "𓏧", "5": "𓏨",
                "6": "𓏩", "7": "𓏪", "8": "𓏫", "9": "𓏬",
                "ç": "𓋴", "á": "𓄿", "é": "𓇋", "í": "𓇋", "ó": "𓅱", "ú": "𓅱",
                "ã": "𓄿", "õ": "𓅱",
            };
            // Converte o texto para minúsculas e mapeia cada caractere.
            // Se um caractere não estiver no mapa, ele será uma string vazia (omitido).
            const convertido = texto.toLowerCase().split('').map(l => mapa[l] || '').join('');
            document.getElementById("saidaHieroglifo").textContent = convertido || "𓀀"; // Hieróglifo padrão se o input estiver vazio
        });
    }
});