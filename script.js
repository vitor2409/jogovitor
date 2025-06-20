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
let isMusicPlaying = false; // Estado da música

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
    musicSrc: "musica_ambiente_deserto.mp3" // Certifique-se que este arquivo exista
  },
  {
    name: "Nilo",
    minScore: 5, // Após 5 acertos, muda para o Nilo
    bodyClass: "theme-nile",
    musicSrc: "musica_ambiente_nilo.mp3" // Certifique-se que este arquivo exista
  },
  {
    name: "Tumba",
    minScore: 10, // Após 10 acertos, muda para Tumba
    bodyClass: "theme-tomb",
    musicSrc: "musica_ambiente_tumba.mp3" // Certifique-se que este arquivo exista
  }
  // Adicione mais temas conforme desejar
];
let currentThemeIndex = -1; // Começa com -1 para garantir que o primeiro tema seja aplicado

// --- Definições para Personagem Guia ---
const guideFeedback = {
  correct: {
    text: ["Magnífico! Sua sabedoria é digna dos faraós!", "Correto! Sua mente é afiada!", "Excelente trabalho!"],
    image: "escriba_feliz.png" // Certifique-se que este arquivo exista
  },
  incorrect: {
    text: ["Quase lá! Continue tentando, a verdade está escondida.", "Não desista! O caminho da aprendizagem é longo.", "Tente novamente, você consegue!"],
    image: "escriba_triste.png" // Certifique-se que este arquivo exista
  },
  timeout: {
    text: ["O tempo esgotou! A pressa é inimiga da perfeição.", "Rápido como o vento, mas a sabedoria leva tempo."],
    image: "escriba_surpreso.png" // Certifique-se que este arquivo exista
  },
  welcome: {
    text: ["Saudações, viajante! Decifre os mistérios do Egito antigo.", "Bem-vindo(a), jovem escriba!"],
    image: "escriba_neutro.png" // Certifique-se que este arquivo exista
  },
  goodbye: {
    text: ["Até a próxima jornada!", "Que os deuses o(a) abençoem!"],
    image: "escriba_neutro.png" // Pode usar a imagem neutra ou outra de despedida
  },
  start_game: { // Mensagem inicial ao começar o jogo
    text: ["Que a jornada da sabedoria comece!", "Desafie sua mente agora!"],
    image: "escriba_neutro.png"
  },
  free_mode: { // Mensagem ao entrar no modo livre
    text: ["Sinta-se à vontade para criar seus próprios hieróglifos!", "Liberdade para a escrita!"],
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
      alert("Seu navegador bloqueou a reprodução automática. Clique em 'Iniciar Jogo' para tentar tocar a música ou tente novamente.");
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

  setTimeout(() => {
    guideCharacter.classList.add("hidden");
    guideSpeechBubble.classList.add("hidden");
  }, 3000); // Mostra por 3 segundos
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
        // Remove a classe do tema anterior, se houver
        if (currentThemeIndex !== -1) {
            document.body.classList.remove(gameThemes[currentThemeIndex].bodyClass);
        }
        currentThemeIndex = newThemeIndex;
        // Adiciona a classe do novo tema
        document.body.classList.add(gameThemes[currentThemeIndex].bodyClass);

        // Mudar a música ambiente se houver uma nova
        if (gameThemes[currentThemeIndex].musicSrc && backgroundMusic.src !== gameThemes[currentThemeIndex].musicSrc) {
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
  reiniciar();
  showGuideFeedback('start_game'); // Mensagem do guia ao iniciar
  // Tentar tocar a música quando o jogo iniciar, se não estiver tocando
  if (!isMusicPlaying) {
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
      toggleMusicButton.textContent = "Música: ON";
    }).catch(error => {
      console.log("Música ambiente não pôde ser iniciada automaticamente. Erro:", error);
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
  showGuideFeedback('goodbye'); // Mensagem do guia ao sair
  // A música ambiente continua tocando no menu. Se quiser parar, adicione:
  // backgroundMusic.pause();
  // isMusicPlaying = false;
  // toggleMusicButton.textContent = "Música: OFF";
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
    btn.disabled = false;
    btn.classList.remove("correct", "incorrect");
  });

  document.getElementById("feedback").textContent = "";
}

function contarTempo() {
  tempo--;
  document.getElementById("time").textContent = tempo;
  if (tempo <= 0) {
    clearInterval(timer);
    mostrarFeedback(false, true);
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
    showGuideFeedback('correct'); // Guia: Acertou
  } else {
    audioErro.play();
    if (tempoEsgotado) {
      feedback.textContent = "⏰ Tempo esgotado! Era: " + atual.resposta;
      showGuideFeedback('timeout'); // Guia: Tempo esgotado
    } else {
      feedback.textContent = "❌ Errado! Era: " + atual.resposta;
      if (botaoClicado) {
        botaoClicado.classList.add("incorrect");
      }
      showGuideFeedback('incorrect'); // Guia: Errou
    }
    botoes.forEach(btn => {
      if (btn.textContent === atual.resposta) {
        btn.classList.add("correct");
      }
    });
  }

  document.getElementById("score").textContent = score;
  updateGameTheme(); // Verifica e atualiza o tema após a pontuação mudar

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
  showGuideFeedback('goodbye'); // Guia: Fim de jogo
}

function reiniciar() {
  score = 0;
  indiceAtual = 0;
  glyphsEmbaralhados = shuffle([...glyphs]);
  document.getElementById("score").textContent = score;
  document.getElementById("fim").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");
  carregarGlyph();
  updateGameTheme(); // Redefine o tema para o inicial ao reiniciar
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

// Inicialização: Aplica o tema inicial quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    updateGameTheme();
});