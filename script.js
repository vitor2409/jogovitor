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
  { simbolo: "𓈖", resposta: "Água", opcoes: ["Fogo", "Terra", "Ar", "Água"] }
];

let score = 0;
let indiceAtual = 0;
let tempo = 15;
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
let isMusicPlaying = false;

// Adiciona um volume inicial mais baixo para a música ambiente
backgroundMusic.volume = 0.4;

// Referências para o personagem guia e balão de fala
const guideCharacter = document.getElementById("guideCharacter");
const guideSpeechBubble = document.getElementById("guideSpeechBubble");

// --- Definições para Progressão Temática ---
const gameThemes = [
  {
    name: "Deserto",
    minScore: 0,
    bodyClass: "theme-desert",
    musicSrc: "musica_ambiente_deserto.mp3" // Confirme que este arquivo existe
  },
  {
    name: "Nilo",
    minScore: 5, // Após 5 acertos, muda para o Nilo
    bodyClass: "theme-nile",
    musicSrc: "musica_ambiente_nilo.mp3" // Confirme que este arquivo existe
  },
  {
    name: "Tumba",
    minScore: 10, // Após 10 acertos, muda para Tumba
    bodyClass: "theme-tomb",
    musicSrc: "musica_ambiente_tumba.mp3" // Confirme que este arquivo existe
  }
];
let currentThemeIndex = -1; // Inicializa com -1 para garantir que o primeiro tema seja aplicado corretamente

// --- Definições para Personagem Guia ---
const guideFeedback = {
  correct: {
    text: ["Magnífico! Sua sabedoria é digna dos faraós!", "Correto! Sua mente é afiada!", "Excelente trabalho!"],
    image: "escriba_feliz.png" // Confirme que este arquivo existe
  },
  incorrect: {
    text: ["Quase lá! Continue tentando, a verdade está escondida.", "Não desista! O caminho da aprendizagem é longo.", "Tente novamente, você consegue!"],
    image: "escriba_triste.png" // Confirme que este arquivo existe
  },
  timeout: {
    text: ["O tempo esgotou! A pressa é inimiga da perfeição.", "Rápido como o vento, mas a sabedoria leva tempo."],
    image: "escriba_surpreso.png" // Confirme que este arquivo existe
  },
  welcome: { // Mensagem inicial no menu
    text: ["Saudações, viajante! Decifre os mistérios do Egito antigo.", "Bem-vindo(a) ao Jogo dos Hieróglifos!"],
    image: "escriba_neutro.png" // Confirme que este arquivo existe
  },
  start_game: { // Mensagem ao iniciar o jogo
    text: ["Que a jornada da sabedoria comece!", "Desafie sua mente agora!"],
    image: "escriba_neutro.png"
  },
  free_mode: { // Mensagem ao entrar no modo livre
    text: ["Sinta-se à vontade para criar seus próprios hieróglifos!", "Liberdade para a escrita!"],
    image: "escriba_neutro.png"
  },
  goodbye: { // Mensagem ao sair ou fim de jogo
      text: ["Até a próxima jornada!", "Que os deuses o(a) abençoem!"],
      image: "escriba_neutro.png"
  }
};

// Função para tocar/pausar a música
function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
    isMusicPlaying = false;
    toggleMusicButton.textContent = "Música: OFF";
  } else {
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
      toggleMusicButton.textContent = "Música: ON";
    }).catch(error => {
      console.log("Erro ao tocar música:", error);
      // Alguns navegadores bloqueiam autoplay sem interação do usuário.
      // A música pode não iniciar aqui, mas iniciará ao clicar em "Iniciar Jogo".
    });
  }
}

// Adicionar listener ao botão de música
if (toggleMusicButton) {
  toggleMusicButton.addEventListener("click", toggleMusic);
}

// Função para mostrar o feedback do guia
function showGuideFeedback(type) {
  const feedbackData = guideFeedback[type];
  if (!feedbackData) return;

  const randomIndex = Math.floor(Math.random() * feedbackData.text.length);
  guideSpeechBubble.textContent = feedbackData.text[randomIndex];
  guideCharacter.src = feedbackData.image;

  guideCharacter.classList.remove("hidden");
  guideSpeechBubble.classList.remove("hidden");

  // Esconde o balão e o personagem após 3 segundos
  setTimeout(() => {
    guideCharacter.classList.add("hidden");
    guideSpeechBubble.classList.add("hidden");
  }, 3000);
}

// Função para atualizar o tema do jogo
function updateGameTheme() {
    let newThemeIndex = currentThemeIndex;
    for (let i = gameThemes.length - 1; i >= 0; i--) {
        if (score >= gameThemes[i].minScore) {
            newThemeIndex = i;
            break;
        }
    }

    if (newThemeIndex !== currentThemeIndex) {
        // Remove a classe do tema anterior, se houver uma ativa
        if (currentThemeIndex !== -1) {
            document.body.classList.remove(gameThemes[currentThemeIndex].bodyClass);
        }
        currentThemeIndex = newThemeIndex;
        // Adiciona a classe do novo tema
        document.body.classList.add(gameThemes[currentThemeIndex].bodyClass);

        // Mudar a música ambiente se houver uma nova para o tema
        if (gameThemes[currentThemeIndex].musicSrc && backgroundMusic.src !== window.location.origin + '/' + gameThemes[currentThemeIndex].musicSrc) {
            // Use window.location.origin para garantir o caminho absoluto correto
            backgroundMusic.src = gameThemes[currentThemeIndex].musicSrc;
            if (isMusicPlaying) {
                backgroundMusic.play();
            }
        }
    }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function iniciarJogo() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");
  reiniciar(); // Reinicia o jogo e aplica o tema inicial
  showGuideFeedback('start_game'); // Mensagem do guia ao iniciar o jogo
  // Tenta tocar a música se não estiver tocando
  if (!isMusicPlaying) {
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
      toggleMusicButton.textContent = "Música: ON";
    }).catch(error => {
      console.log("Música ambiente não pôde ser iniciada automaticamente na função iniciarJogo. Erro:", error);
    });
  }
}

function mostrarModoLivre() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("livre").classList.remove("hidden");
  showGuideFeedback('free_mode'); // Mensagem do guia no modo livre
}

function voltarAoMenu() {
  document.getElementById("jogo").classList.add("hidden");
  document.getElementById("fim").classList.add("hidden");
  document.getElementById("livre").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  clearInterval(timer); // Para o timer se estiver ativo
  showGuideFeedback('goodbye'); // Mensagem do guia ao voltar ao menu
  // A música ambiente continua tocando no menu.
  // Se quiser parar: backgroundMusic.pause(); isMusicPlaying = false; toggleMusicButton.textContent = "Música: OFF";
}

function carregarGlyph() {
  clearInterval(timer);
  tempo = 15;
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
  clearInterval(timer);
  const atual = glyphsEmbaralhados[indiceAtual];
  const resposta = botao.textContent;
  const correta = resposta === atual.resposta;

  mostrarFeedback(correta, false, botao);
}

function mostrarFeedback(correto, tempoEsgotado = false, botaoClicado = null) {
  const atual = glyphsEmbaralhados[indiceAtual];
  const botoes = document.querySelectorAll(".options button");
  botoes.forEach(btn => btn.disabled = true);

  const feedback = document.getElementById("feedback");

  if (correto) {
    score++;
    audioAcerto.play();
    feedback.textContent = "✅ Correto!";
    if (botaoClicado) {
      botaoClicado.classList.add("correct");
    }
    showGuideFeedback('correct'); // Acertou, mostra feedback do guia
  } else {
    audioErro.play();
    if (tempoEsgotado) {
      feedback.textContent = "⏰ Tempo esgotado! Era: " + atual.resposta;
      showGuideFeedback('timeout'); // Tempo esgotado, mostra feedback do guia
    } else {
      feedback.textContent = "❌ Errado! Era: " + atual.resposta;
      if (botaoClicado) {
        botaoClicado.classList.add("incorrect");
      }
      showGuideFeedback('incorrect'); // Errou, mostra feedback do guia
    }
    // Destacar a resposta correta se houver uma opção correspondente
    botoes.forEach(btn => {
      if (btn.textContent === atual.resposta) {
        btn.classList.add("correct");
      }
    });
  }

  document.getElementById("score").textContent = score;
  updateGameTheme(); // **Importante:** Atualiza o tema após mudar a pontuação

  setTimeout(() => {
    indiceAtual++;
    if (indiceAtual >= glyphsEmbaralhados.length) {
      fimDeJogo();
    } else {
      carregarGlyph();
    }
  }, 2000);
}

function fimDeJogo() {
  document.getElementById("jogo").classList.add("hidden");
  document.getElementById("fim").classList.remove("hidden");
  document.getElementById("final-score").textContent = score;

  if (score >= glyphs.length / 2) {
    audioVitoria.play();
  } else {
    audioDerrota.play();
  }
  // No fim do jogo, o guia já deu o feedback de 'goodbye' ao voltar ao menu.
  // Ou, você pode adicionar um feedback específico de "Fim de Jogo" aqui.
}

function reiniciar() {
  score = 0;
  indiceAtual = 0;
  glyphsEmbaralhados = shuffle([...glyphs]);
  document.getElementById("score").textContent = score;
  document.getElementById("fim").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");
  carregarGlyph();
  updateGameTheme(); // **Importante:** Reseta o tema para o inicial ao reiniciar o jogo
}

// Modo livre
document.getElementById("textoLivre").addEventListener("input", () => {
  const texto = document.getElementById("textoLivre").value;
  const mapa = {
    a: "𓄿", b: "𓃀", c: "𓎡", d: "𓂧", e: "𓇋", f: "𓆑",
    g: "𓎼", h: "𓎛", i: "𓇋", j: "𓆓", k: "𓎡", l: "𓃭",
    m: "𓅓", n: "𓈖", o: "𓅱", p: "𓊪", q: "𓎤", r: "𓂋",
    s: "𓋴", t: "𓏏", u: "𓅱", v: "𓆑", w: "𓅱", x: "𓐍",
    y: "𓇌", z: "𓊃", " ": " "
  };
  const convertido = texto.toLowerCase().split('').map(l => mapa[l] || '').join('');
  document.getElementById("saidaHieroglifo").textContent = convertido || "𓀀";
});

// **Importante:** Garante que o tema inicial e a mensagem de boas-vindas do guia apareçam ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updateGameTheme();
    showGuideFeedback('welcome'); // Mensagem de boas-vindas do guia no menu
});