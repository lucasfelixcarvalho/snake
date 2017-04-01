/* Configuraçoes */

var tbJogo; // array multidimensional para exibiçao ao usuário
var snake; // fila que mantém a snake mapeada

var life; // level
var tempo; // tempo do intervalo com que a snake anda automatico, 1seg. de inicio

var direcao; // direçao que a snake está seguindo
var go; // variável que inicia o jogo, começando apenas quando o usuário aperta uma das setas
var timer; // timer com a funçao e o tempo que a snake andará automaticamente
var modo; // Modo lenon, alteracoes na forma da snake se mover
var raboSnake;
// Objeto snake e seus atributos, onde status pode ser: cabeca-snake, snake (corpo da snake), comida, default (em branco)
// As respectivas classes estão no CSS, com cores diferentes para exibiçao ao usuario
var Snake = function (linha, coluna, status) {
    this.linha = linha;
    this.coluna = coluna;
    this.status = status;
};

/* Functions */
function setModo()
{
    modo = document.getElementById("modo-lenon").checked;
};

// Carrega todas as informaçoes e Configuraçoes necessárias para iniciar o jogo
function loadAll() {
    tbJogo = new Array();
    snake = new Array();
    setModo();
    raboSnake = true;

    var tabela = document.getElementsByTagName("td");
    for (var i = 0; i < tabela.length; i++)
        tabela[i].setAttribute("class", "default");

    life = 2;
    tempo = 500;
    direcao = "";
    go = 0;    
    timer = setInterval(eventoTimer, tempo);

    readCookie();

    for (var i = 0; i < 9; i++) { // Reseta array do tabuleiro
        tbJogo[i] = new Array();
        for (var k = 0; k < 9; k++) {
            tbJogo[i][k] = {
                linha: i,
                coluna: k,
                status: "default"
            };
        }
    }

    document.addEventListener("keydown", inputTeclado); // leitura do teclado do usuário (setas)
    document.getElementById("level").innerText = "Level: " + life.toString();

    document.getElementById("dead").removeEventListener("click", loadAll);
    document.getElementById("dead").setAttribute("hidden", "true");

    snake.push(new Snake(0, 3, "cabeca-snake"));
    snake.push(new Snake(0, 2, "snake"));
    snake.push(new Snake(0, 1, "snake"));
    setSnake(snake);

    direcao = "direita";
    go = 1;

    apareceComida();
    eventoTimer();
};

function eventoTimer() {
    if (go == 1) {
        switch (direcao) {
            case "cima":
                mover("moveCima");
                break;

            case "baixo":
                mover("moveBaixo");
                break;

            case "esquerda":
                mover("moveEsquerda");
                break;

            case "direita":
                mover("moveDireita");
                break;
        }
    }
};

// Morreu!
function dead() {
    document.getElementById("dead").removeAttribute("hidden");
    document.getElementById("dead").addEventListener("click", loadAll);
    clearInterval(timer);
    go = 0;
    document.removeEventListener("keydown", inputTeclado);    
    readCookie();
};

// Verifica se foi a maior pontuaçao
function maiorPontuacao(score)
{
    if(score < life)
    {
        document.getElementById("bestScore").innerText = "Best Score: " + life.toString();
        setCookie()
    }

    if(go == 0)
        document.getElementById("bestScore").innerText = "Best Score: " + score.toString();
};

// Gravar Cookie de melhor pontuaçao
function setCookie() {
    var d = new Date();
    d.setTime(d.getTime() + (5 * 24 * 60 * 60 * 1000));
    localStorage.setItem("bestscore", life.toString());
};

// Recuperar Cookie de melhor pontuaçao
function readCookie() {
    try {
        var cookie = localStorage.getItem("bestscore").split("=");
        if(cookie)    
            maiorPontuacao(cookie[0]);
        else
            setCookie();
    }
    catch (ex) { }
};

// Seta uma casa do tabuleiro como sendo a comida
function apareceComida() {
    var ok = false;
    var l;
    var c;

    while (!ok) {
        l = Math.floor(Math.random() * 10);
        c = Math.floor(Math.random() * 10);

        if (l == 9)
            l--;
        if (c == 9)
            c--;
        
        var classImg = "";

        if((l + c)%2 == 0)
            classImg = "brain";
        else
            classImg = "brain_pink";

        if (tbJogo[l][c].status == "default") { // Seta apenas se a celula for default, ou seja, em branco
            tbJogo[l][c].status = "comida";
            ok = true;
        }
    }

    document.getElementById("lin" + l + "col" + c).setAttribute("class", "comida-" + classImg);
};

function comer() {
    snake.push(new Snake(snake[life].linha, snake[life].coluna, "snake"));
    life++;
    document.getElementById("level").innerText = "Level: " + life.toString();

    if (life % 5 == 0) { // A cada 5 leveis, o intervalo de movimentaçao automatica decresce em 100ms.
        tempo -= 100;
        clearInterval(timer);
        timer = setInterval(eventoTimer, tempo);
    }
    setSnake(snake);
    apareceComida();
};

// Altera o CSS do tabuleiro para dar impressão de movimento da Snake
function setSnake(celula) {
    for (var i = 0; i < celula.length-1; i++) {
        document.getElementById("lin" + celula[i].linha + "col" + celula[i].coluna).setAttribute("class", celula[i].status);
        tbJogo[celula[i].linha][celula[i].coluna].status = celula[i].status;
    }

};

// Limpa a última célula da snake, onde ela termina, deixando como default novamente
function clearSnake(celula) {
    document.getElementById("lin" + celula.linha + "col" + celula.coluna).setAttribute("class", "default");
    tbJogo[celula.linha][celula.coluna].status = "default";
};

function setRaboSnake(celula){
    if(raboSnake)
    {
        document.getElementById("lin" + celula.linha + "col" + celula.coluna).setAttribute("class", "rabo-snake-esq");
        raboSnake = false;
    }
    else
    {
        document.getElementById("lin" + celula.linha + "col" + celula.coluna).setAttribute("class", "rabo-snake-dir");
        raboSnake = true;
    }    
};

// Move todo o corpo da snake, exceto a cabeça, para a posiçao da célula da frente
function moveSnake() {
    clearSnake(snake[snake.length - 1]);

    for (var i = life; i > 0; i--) {
        snake[i].linha = snake[i - 1].linha;
        snake[i].coluna = snake[i - 1].coluna;
        snake[i].status = "snake";
    }

    snake[0].status = "cabeca-snake";

    setSnake(snake);
    
};

// Move apenas a cabeça da snake, onde são verificados se a próxima célula é comida, default ou snake, e toma as açoes necessárias para cada uma
// Verifica também se a próxima célula deverá ser do outro lado da tela, caso a cabeca-snake esteja nos limites do tabuleiro
// Recebe a direçao como parametro
function mover(fn) {
    clearInterval(timer);

    moveSnake();

    switch (fn) {
        case "moveCima": {
            if (snake[0].linha == 0)
                snake[0].linha = 8;
            else
                snake[0].linha -= 1;
            direcao = "cima";
        };
            break;

        case "moveBaixo": {
            if (snake[0].linha == 8)
                snake[0].linha = 0;
            else
                snake[0].linha += 1;
            direcao = "baixo";
        };
            break;

        case "moveDireita": {
            if (snake[0].coluna == 8)
                snake[0].coluna = 0;
            else
                snake[0].coluna += 1;
            direcao = "direita";
        };
            break;

        case "moveEsquerda": {
            if (snake[0].coluna == 0)
                snake[0].coluna = 8;
            else
                snake[0].coluna -= 1;
            direcao = "esquerda";
        };
            break;
    };

    timer = setInterval(eventoTimer, tempo);

    if (tbJogo[snake[0].linha][snake[0].coluna].status == "snake") // Morreu
        dead();
    else if (tbJogo[snake[0].linha][snake[0].coluna].status == "comida")
        comer();
    else
    {
        setSnake(snake);
        setRaboSnake(snake[snake.length -1]);
    }
};

// Recebe o input do teclado do usuário, apenas as setas estão mapeadas
function inputTeclado(event) {
    if (event.keyCode == 38 || event.keyCode == 87) // Cima
    {
        if(direcao != "baixo")
        {
            if(modo) // modo lenon
                direcao = "cima";
            else
                mover("moveCima");
        }
    }
    if (event.keyCode == 40 || event.keyCode == 83) // Baixo
    {
        if(direcao != "cima")
        {
            if(modo) // modo lenon
                direcao = "baixo";
            else
                mover("moveBaixo");
        }
    }
    if (event.keyCode == 37 || event.keyCode == 65) // Esquerda
    {
        if(direcao != "direita")
        {
            if(modo)
                direcao = "esquerda";
            else
                mover("moveEsquerda");
        }
    }
    if (event.keyCode == 39 || event.keyCode == 68) // Direita
    {
        if(direcao != "esquerda")
        {
            if(modo)
                direcao = "direita";
            else
                mover("moveDireita");
        }
    }    
};

// Load da página
window.onload = function start() {
    loadAll();
    document.getElementById("modo-lenon").addEventListener("click", setModo);
};



