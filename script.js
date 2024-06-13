document.addEventListener('DOMContentLoaded', () => {
  const quadrados = Array.from(document.querySelectorAll('.quadrados'));
  const tecladoVirtual = document.querySelector('.teclado');
  const teclas = tecladoVirtual.querySelectorAll('.tecla');
  const teclaEnter = document.querySelector('[data-enter]');
  const teclaApagar = document.querySelector('[data-apagar]');

  let entradaAtual = Array(5).fill(''); // Array para manter as letras da linha atual
  const maxComprimentoEntrada = 5; // Quantidade máxima de caracteres permitidos por linha (coluna)
  const maxLinhas = 6; // Número de fileiras
  let linhaAtual = 0;
  let posicaoAtiva = 0; // Nova variável para armazenar a posição ativa
  let palavraCorreta = ''; // Palavra correta será definida após carregar o JSON
  let palavrasValidas = []; // Lista de palavras válidas será carregada do JSON
  let palavrasValidasNormalizadas = {}; // Mapa de palavras normalizadas para palavras válidas
  let palavraCorretaNormalizada = ''; // Palavra correta normalizada
  let jogoTerminado = false; // Variável para verificar se o jogo terminou

  // Função para remover acentos e normalizar as palavras
  const normalizarPalavra = (palavra) => {
    return palavra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };
  // Função para carregar palavras válidas e a palavra correta do arquivo JSON
  const carregarPalavras = async () => {
    try {
      const respostaPalavras = await fetch('palavras.json');
      const dataPalavras = await respostaPalavras.json();
      palavrasValidas = dataPalavras.palavras.map(palavra => palavra.toUpperCase());

      const respostaRespostas = await fetch('respostas.json');
      const dataRespostas = await respostaRespostas.json();
      const respostas = dataRespostas.respostas.map(resposta => resposta.toUpperCase());
      palavraCorreta = respostas[Math.floor(Math.random() * respostas.length)];
      palavraCorretaNormalizada = normalizarPalavra(palavraCorreta);
      // Preencher o mapa de palavras normalizadas para palavras válidas
      palavrasValidas.forEach(palavra => {
        palavrasValidasNormalizadas[normalizarPalavra(palavra)] = palavra;
      });
    } catch (error) {
      console.error('Erro ao carregar palavras:', error);
      mostrarMensagem('Erro ao carregar palavras. Tente novamente mais tarde.');
    }
  };
  // Chama a função para carregar as palavras ao iniciar
  carregarPalavras();
  // Atualiza os quadrados com o texto atual na linha ativa
  const atualizarQuadrados = () => {
    const inicio = linhaAtual * maxComprimentoEntrada;
    for (let i = 0; i < maxComprimentoEntrada; i++) {
      quadrados[inicio + i].textContent = entradaAtual[i] || '';
    }
  };
  // Adiciona a classe 'blinking' ao quadrado ativo
  const atualizarPiscar = () => {
    if (jogoTerminado) return; // Não atualiza se o jogo terminou
    // Adiciona o evento de clique aos quadrados
    quadrados.forEach((quadrado) => {
      quadrado.classList.remove('blinking');
    });

    const indicePiscar = linhaAtual * maxComprimentoEntrada + posicaoAtiva;
    quadrados[indicePiscar].classList.add('blinking');
  };

  quadrados.forEach((quadrado, index) => {
    quadrado.addEventListener('click', () => {
      const linhaDoQuadrado = Math.floor(index / maxComprimentoEntrada);
      if (linhaDoQuadrado === linhaAtual && !jogoTerminado) {
        posicaoAtiva = index % maxComprimentoEntrada;
        atualizarPiscar();
      }
    });
  });
  // Função para adicionar caracteres
  const adicionarCaractere = (caractere) => {
    if (!jogoTerminado) {
      entradaAtual[posicaoAtiva] = caractere;
      atualizarQuadrados();
      if (posicaoAtiva < maxComprimentoEntrada - 1) {
        posicaoAtiva++;
      }
      atualizarPiscar();
    }
  };
  // Função para remover o último caractere
  const removerCaractere = () => {
    if (!jogoTerminado) {
      if (posicaoAtiva > 0 && !entradaAtual[posicaoAtiva]) {
        posicaoAtiva--;
      }
      entradaAtual[posicaoAtiva] = '';
      atualizarQuadrados();
      atualizarPiscar();
    }
  };
  // Função para processar a tecla Enter
  // Função para adicionar a animação de virar aos quadrados da linha atual, um por um
  const adicionarAnimacaoVirar = () => {
    const inicio = linhaAtual * maxComprimentoEntrada;
    for (let i = 0; i < maxComprimentoEntrada; i++) {
      setTimeout(() => {
        const quadrado = quadrados[inicio + i];
        quadrado.classList.add('virar');
        // Remover a classe de animação após a animação ser concluída
        quadrado.addEventListener('animationend', () => {
          quadrado.classList.remove('virar');
        }, { once: true });
      }, i * 100); // Atraso de 100ms entre cada quadrado
    }
  };

  const mostrarMensagem = (texto) => {
    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = texto;
    mensagem.style.display = 'block';
    setTimeout(() => {
      mensagem.classList.add('show');
    }, 10);
    setTimeout(() => {
      mensagem.classList.remove('show');
      setTimeout(() => mensagem.style.display = 'none', 500);
    }, 3000);
  };
  // Processa a tecla Enter
  const processarEnter = () => {
    if (!jogoTerminado) {
      if (entradaAtual.filter(Boolean).length === maxComprimentoEntrada) {
        const palavraDigitada = entradaAtual.join('');
        const palavraDigitadaNormalizada = normalizarPalavra(palavraDigitada);
        if (palavrasValidasNormalizadas[palavraDigitadaNormalizada]) {
          entradaAtual = palavrasValidasNormalizadas[palavraDigitadaNormalizada].split('');
          verificarPalavra();
          // Adiciona a animação de virar
          adicionarAnimacaoVirar();
          if (!jogoTerminado) {
            linhaAtual++;
            entradaAtual = Array(5).fill('');
            posicaoAtiva = 0;
            atualizarQuadrados();
            atualizarPiscar();
          }
        } else {
          balancarLinha(); // Adiciona a animação de balançar
          mostrarMensagem('Palavra inválida!');
        }
      } else {
        balancarLinha();
        mostrarMensagem('Preencha todos os quadrados antes de enviar!');
      }
    }
  };
  // Função para adicionar a animação de balançar aos quadrados da linha atual
  const balancarLinha = () => {
    const inicio = linhaAtual * maxComprimentoEntrada;
    for (let i = 0; i < maxComprimentoEntrada; i++) {
      const quadrado = quadrados[inicio + i];
      quadrado.classList.add('balancar');
      // Remover a classe de animação após a animação ser concluída
      quadrado.addEventListener('animationend', () => {
        quadrado.classList.remove('balancar');
      }, { once: true });
    }
  };
  // Verifica a palavra digitada pelo jogador
  const verificarPalavra = () => {
    const inicio = linhaAtual * maxComprimentoEntrada;
    const letrasCorretas = {};
    const letrasEncontradas = Array(maxComprimentoEntrada).fill(false);
    // Contagem das letras na palavra correta
    for (const letra of palavraCorreta) {
      letrasCorretas[letra] = (letrasCorretas[letra] || 0) + 1;
    }
    // Verificação de letras na posição correta (verde)
    for (let i = 0; i < maxComprimentoEntrada; i++) {
      const quadrado = quadrados[inicio + i];
      const letra = entradaAtual[i];
      if (letra === palavraCorreta[i]) {
        quadrado.style.backgroundColor = 'green';
        letrasCorretas[letra]--;
        letrasEncontradas[i] = true;
        atualizarTeclaVirtual(letra, '#01ad27');
      }
    }
    // Verificação de letras na posição incorreta (amarelo)
    for (let i = 0; i < maxComprimentoEntrada; i++) {
      const quadrado = quadrados[inicio + i];
      const letra = entradaAtual[i];
      if (!letrasEncontradas[i] && letrasCorretas[letra] > 0) {
        quadrado.style.backgroundColor = '#ffea00d6';
        letrasCorretas[letra]--;
        atualizarTeclaVirtual(letra, '#ffea00d6');
      } else if (quadrado.style.backgroundColor !== 'green') {
        quadrado.style.backgroundColor = '#6966663a';
        atualizarTeclaVirtual(letra, '#00000088');
      }
    }

    if (entradaAtual.join('') === palavraCorreta) {
      jogoTerminado = true;
      desativarPiscar();
      setTimeout(() => mostrarMensagem('Você ganhou!'), 100);
    } else if (linhaAtual + 1 === maxLinhas) {
      jogoTerminado = true;
      desativarPiscar();
      setTimeout(() => mostrarMensagem('Você perdeu! A palavra era: ' + palavraCorreta), 100);
    }
  };
  // Função para desativar o piscar dos quadrados
  const desativarPiscar = () => {
    quadrados.forEach((quadrado) => {
      quadrado.classList.remove('blinking');
    });
  };
  // Função para atualizar a cor da tecla no teclado virtual
  const atualizarTeclaVirtual = (letra, cor) => {
    const tecla = Array.from(teclas).find(t => t.getAttribute('data-tecla') === letra);
    if (tecla) {
      tecla.style.backgroundColor = cor;
    }
  };
  // Adiciona o evento de clique no teclado virtual
  teclas.forEach(tecla => {
    tecla.addEventListener('click', (event) => {
      const caractere = tecla.getAttribute('data-tecla');
      if (caractere) {
        adicionarCaractere(caractere);
        event.target.blur(); // Remove o foco do botão clicado
      }
    });
  });
  // Adiciona eventos para teclas especiais
  teclaEnter.addEventListener('click', () => {
    processarEnter();
    teclaEnter.blur(); // Remove o foco do botão "Enter" virtual
  });

  teclaApagar.addEventListener('click', () => {
    removerCaractere();
    teclaApagar.blur(); // Remove o foco do botão "Apagar" virtual
  });
  // Adiciona o evento de tecla pressionada no teclado físico
  document.addEventListener('keydown', (evento) => {
    const tecla = evento.key.toUpperCase();

    if (tecla.length === 1 && tecla.match(/[A-Z]/i)) {
      adicionarCaractere(tecla);
    } else if (tecla === 'ENTER') {
      processarEnter();
    } else if (tecla === 'BACKSPACE') {
      removerCaractere();
    } else if (tecla === 'ARROWLEFT') {
      moverPosicaoAtiva(-1);
    } else if (tecla === 'ARROWRIGHT') {
      moverPosicaoAtiva(1);
    }
  });
  // Função para mover a posição ativa com as setas do teclado
  const moverPosicaoAtiva = (direcao) => {
    if (!jogoTerminado) {
      posicaoAtiva = Math.max(0, Math.min(maxComprimentoEntrada - 1, posicaoAtiva + direcao));
      atualizarPiscar();
    }
  };
  // Inicializa o estado dos quadrados
  atualizarPiscar();
});
