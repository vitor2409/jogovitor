const glyphs = [
  { simbolo: "𓂀", resposta: "Olho", opcoes: ["Sol", "Olho", "Casa"] },
  { simbolo: "𓇋", resposta: "Rei", opcoes: ["Rei", "Água", "Fogo"] },
  { simbolo: "𓂻", resposta: "Andar", opcoes: ["Comer", "Andar", "Falar"] },
  { simbolo: "𓆣", resposta: "Cobra", opcoes: ["Cobra", "Água", "Nilo"] },
  { simbolo: "𓊹", resposta: "Deus", opcoes: ["Deus", "Faraó", "Templo"] }
];

let score = 0;
let indiceAtual = 0;
let tempo = 10;
let timer;
let glyphsEmbaralhados = [];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function carregarGlyph() {
  clearInterval(timer);
  tempo = 10;
  document.getElementById("time").textContent = tempo;
  timer = setInterval(contarTempo, 1000);

  const atual = glyphsEmbaralhados[indiceAtual];
  document.getElementById("glyph").textContent = atual.simbolo;

  const botoes = document.querySelectorAll(".options button");
  atual.opcoes = shuffle(atual.opcoes);
  botoes.forEach((btn, i) => {
    btn.textContent = atual.opcoes[i];
    btn.disabled = false;
  });

  document.getElementById("feedback").textContent = "";
}

function contarTempo() {
  tempo--;
  document.getElementById("time").textContent = tempo;
  if (tempo <= 0) {
    clearInterval(timer);
    mostrarFeedback(false);
  }
}

function checkAnswer(botao) {
  clearInterval(timer);
  const atual = glyphsEmbaralhados[indiceAtual];
  const resposta = botao.textContent;
  const correta = resposta === atual.resposta;

  mostrarFeedback(correta);
}

function mostrarFeedback(correto) {
  const atual = glyphsEmbaralhados[indiceAtual];
  const botoes = document.querySelectorAll(".options button");
  botoes.forEach(btn => btn.disabled = true);

  const feedback = document.getElementById("feedback");
  if (correto) {
    score++;
    document.getElementById("acerto").play();
    feedback.textContent = "✅ Correto!";
  } else {
    document.getElementById("erro").play();
    feedback.textContent = "❌ Errado! Era: " + atual.resposta;
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

glyphsEmbaralhados = shuffle([...glyphs]);
carregarGlyph();
