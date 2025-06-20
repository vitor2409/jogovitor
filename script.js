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
backgroundMusic.volume = 0.4;

// Função para tocar/pausar a música
function toggleMusic() {
  if (isMusicPlaying) {
    backgroundMusic.pause();
    isMusicPlaying = false;
    toggleMusicButton.textContent = "Música: OFF";
  } else {
    // Tenta tocar. Pode falhar se não houver interação do usuário ainda.
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
      toggleMusicButton.textContent = "Música: ON";
    }).catch(error => {
      console.log("Erro ao tocar música:", error);
      // Se a reprodução automática for bloqueada, a música só começará com iniciarJogo()
      alert("Seu navegador bloqueou a reprodução automática. Clique em 'Iniciar Jogo' para tentar tocar a música ou tente novamente.");
    });
  }
}

// Adicionar listener ao botão de música
if (toggleMusicButton) { // Garante que o botão exista antes de adicionar o listener
    toggleMusicButton.addEventListener("click", toggleMusic);
}


function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function iniciarJogo() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("jogo").classList.remove("hidden");
  reiniciar();
  // Tentar tocar a música quando o jogo iniciar, se não estiver tocando
  if (!isMusicPlaying) {
    backgroundMusic.play().then(() => {
      isMusicPlaying = true;
      toggleMusicButton.textContent = "Música: ON";
    }).catch(error => {
      console.log("Música ambiente não pôde ser iniciada automaticamente. Erro:", error);
      // Tratar caso em que o navegador bloqueia autoplay sem interação
    });
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
  // A música ambiente continua tocando no menu. Se quiser parar, adicione:
  // backgroundMusic.pause();
  // isMusicPlaying = false;
  // toggleMusicButton.textContent = "Música: OFF";
}

function carregarGlyph() {
  clearInterval(timer);
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
  } else {
    audioErro.play();
    if (tempoEsgotado) {
      feedback.textContent = "⏰ Tempo esgotado! Era: " + atual.resposta;
    } else {
      feedback.textContent = "❌ Errado! Era: " + atual.resposta;
      if (botaoClicado) {
        botaoClicado.classList.add("incorrect");
      }
    }
    // Destacar a resposta correta se houver uma opção correspondente
    botoes.forEach(btn => {
      if (btn.textContent === atual.resposta) {
        btn.classList.add("correct");
      }
    });
  }

  document.getElementById("score").textContent = score;

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

  if (score >= glyphs.length / 2) { // Critério de vitória simples
    audioVitoria.play();
  } else {
    audioDerrota.play();
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

// Inicialização - O jogo agora começa com o menu
// glyphsEmbaralhados = shuffle([...glyphs]);
// carregarGlyph();