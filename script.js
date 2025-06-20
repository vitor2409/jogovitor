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
    // Adicione mais hieróglifos aqui para expandir o jogo!
    { simbolo: "d", resposta: "Boca (R)", opcoes: ["Orelha", "Nariz", "Boca (R)", "Olho"] },
    { simbolo: "𓂓", resposta: "Cesto (K)", opcoes: ["Vaso", "Cesto (K)", "Copo", "Caixa"] },
    { simbolo: "𓐑", resposta: "Mão (D)", opcoes: ["Pé", "Mão (D)", "Braço", "Dedo"] },
    { simbolo: "𓇽", resposta: "Estrela (Seba)", opcoes: ["Sol", "Lua", "Estrela (Seba)", "Nuvem"] },
    { simbolo: "𓀭", resposta: "Homem (Masculino)", opcoes: ["Mulher", "Criança", "Homem (Masculino)", "Deus"] },
    { simbolo: "𓏲", resposta: "Leão (Labu)", opcoes: ["Tigre", "Gato", "Leão (Labu)", "Cachorro"] }
];

let score = 0;
let indiceAtual = 0;
let tempo = 15; // Tempo aumentado para 15 segundos
let timer;
let glyphsEmbaralhados = [];

// Funções de áudio
const audioAcerto = document.getElementById("acerto");
const audioErro = document.getElementById("erro");
const audioVitoria = document.getElementById("vitoria");
const audioDerrota = document.getElementById("derrota");

// Adição para música ambiente
const backgroundMusic = document.getElementById("backgroundMusic");
const toggleMusicButton = document.getElementById("toggleMusic");
let isMusicPlaying = false; // Estado da música

// Adiciona um volume inicial mais baixo para a música ambiente
if (backgroundMusic) {
    backgroundMusic.volume = 0.4;
}

// Função para tocar/pausar a música
function toggleMusic() {
    if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        toggleMusicButton.textContent = "Música: OFF";
    } else {
        // Tenta tocar. Pode falhar se não houver interação do usuário ainda.
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                toggleMusicButton.textContent = "Música: ON";
            }).catch(error => {
                console.log("Erro ao tocar música (provavelmente política de autoplay):", error);
                // Informa o usuário que a música pode precisar de interação para tocar
                if (error.name === "NotAllowedError") {
                    // This is usually the case when autoplay is blocked
                    alert("Seu navegador bloqueou a reprodução automática. A música pode começar após a primeira interação (ex: iniciar o jogo).");
                }
            });
        }
    }
}

// Adicionar listener ao botão de música
// Usa DOMContentLoaded para garantir que o elemento existe
document.addEventListener("DOMContentLoaded", () => {
    if (toggleMusicButton) {
        toggleMusicButton.addEventListener("click", toggleMusic);
    }
});


function shuffle(array) {
    // Standard Fisher-Yates shuffle algorithm
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
    // Tentar tocar a música quando o jogo iniciar, se não estiver tocando
    if (!isMusicPlaying) {
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                toggleMusicButton.textContent = "Música: ON";
            }).catch(error => {
                console.log("Música ambiente não pôde ser iniciada automaticamente. Erro:", error);
                // No need for alert here, as it might already have been shown by toggleMusic()
            });
        }
    }
}

function mostrarModoLivre() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("livre").classList.remove("hidden");
    // A música ambiente continua tocando no modo livre
}

function voltarAoMenu() {
    document.getElementById("jogo").classList.add("hidden");
    document.getElementById("fim").classList.add("hidden");
    document.getElementById("livre").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    clearInterval(timer); // Para o timer se estiver ativo
    // A música ambiente continua tocando no menu por padrão.
    // Se quiser parar, descomente as linhas abaixo:
    // backgroundMusic.pause();
    // isMusicPlaying = false;
    // toggleMusicButton.textContent = "Música: OFF";
}

function carregarGlyph() {
    clearInterval(timer); // Clear any existing timer before starting a new one
    tempo = 15; // Reseta o tempo
    document.getElementById("time").textContent = tempo;
    timer = setInterval(contarTempo, 1000);

    const atual = glyphsEmbaralhados[indiceAtual];
    document.getElementById("glyph").textContent = atual.simbolo;

    const botoes = document.querySelectorAll(".options button");
    const opcoesEmbaralhadas = shuffle([...atual.opcoes]); // Copia e embaralha as opções
    botoes.forEach((btn, i) => {
        btn.textContent = opcoesEmbaralhadas[i];
        btn.disabled = false;
        btn.classList.remove("correct", "incorrect"); // Limpa classes de feedback
    });

    document.getElementById("feedback").textContent = "";
}

function contarTempo() {
    tempo--;
    document.getElementById("time").textContent = tempo;
    if (tempo <= 0) {
        clearInterval(timer);
        mostrarFeedback(false, true); // Passa true para indicar que o tempo acabou
    }
}

function checkAnswer(botao) {
    clearInterval(timer); // Stop the timer immediately after an answer is clicked
    const atual = glyphsEmbaralhados[indiceAtual];
    const resposta = botao.textContent;
    const correta = resposta === atual.resposta;

    mostrarFeedback(correta, false, botao);
}

function mostrarFeedback(correto, tempoEsgotado = false, botaoClicado = null) {
    const atual = glyphsEmbaralhados[indiceAtual];
    const botoes = document.querySelectorAll(".options button");
    botoes.forEach(btn => btn.disabled = true); // Disable all buttons after an answer

    const feedback = document.getElementById("feedback");

    if (correto) {
        score++;
        audioAcerto.play();
        feedback.textContent = "✅ Correto!";
        if (botaoClicado) {
            botaoClicado.classList.add("correct");
        }
    } else {
        audioErro.play();
        if (tempoEsgotado) {
            feedback.textContent = `⏰ Tempo esgotado! A resposta correta era: "${atual.resposta}"`;
        } else {
            feedback.textContent = `❌ Errado! A resposta correta era: "${atual.resposta}"`;
            if (botaoClicado) {
                botaoClicado.classList.add("incorrect");
            }
        }
        // Highlight the correct answer if it's one of the options
        botoes.forEach(btn => {
            if (btn.textContent === atual.resposta) {
                btn.classList.add("correct");
            }
        });
    }

    document.getElementById("score").textContent = score;

    // Proceed to the next glyph or end game after a short delay
    setTimeout(() => {
        indiceAtual++;
        if (indiceAtual >= glyphsEmbaralhados.length) {
            fimDeJogo();
        } else {
            carregarGlyph();
        }
    }, 2000); // 2-second delay to show feedback
}

function fimDeJogo() {
    clearInterval(timer); // Ensure timer is cleared at the end of the game
    document.getElementById("jogo").classList.add("hidden");
    document.getElementById("fim").classList.remove("hidden");
    document.getElementById("final-score").textContent = score;

    if (score >= glyphs.length / 2) { // Simple victory criterion: more than half correct
        audioVitoria.play();
    } else {
        audioDerrota.play();
    }
}

function reiniciar() {
    score = 0;
    indiceAtual = 0;
    glyphsEmbaralhados = shuffle([...glyphs]); // Shuffle a fresh copy of glyphs
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
            // Expanded mapping for more comprehensive conversion
            const mapa = {
                a: "𓄿", b: "𓃀", c: "𓎡", d: "𓂧", e: "𓇋", f: "𓆑",
                g: "𓎼", h: "𓎛", i: "𓇋", j: "𓆓", k: "𓎡", l: "𓃭",
                m: "𓅓", n: "𓈖", o: "𓅱", p: "𓊪", q: "𓎤", r: "𓂋",
                s: "𓋴", t: "𓏏", u: "𓅱", v: "𓆑", w: "𓅱", x: "𓐍",
                y: "𓇌", z: "𓊃",
                // Common punctuation and numbers (optional, but good for context)
                " ": " ", ".": "𓏏", ",": "𓏏", "!": "𓁢", "?": "𓐠",
                "0": "𓐠", "1": "𓏤", "2": "𓏥", "3": "𓏦", "4": "𓏧", "5": "𓏨",
                // You can add more specific hieroglyphs for common words or phonetics
                // This mapping is simplified and artistic, not linguistically accurate.
            };
            // Convert text to lowercase and map each character.
            // If a character is not in the map, it will be an empty string, effectively omitting it.
            const convertido = texto.toLowerCase().split('').map(l => mapa[l] || '').join('');
            document.getElementById("saidaHieroglifo").textContent = convertido || "𓀀"; // Default glyph if input is empty
        });
    }
});

// Initial setup when the page loads
// No need to call iniciarJogo() or carregarGlyph() directly here
// The game now starts with the menu visible, and the user clicks "Iniciar Jogo".