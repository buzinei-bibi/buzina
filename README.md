# buzina de bıbı

Portfólio pessoal da **buzina de bibi** — front-end developer formada, com foco em full-stack developer e estudando back-end com PHP e SQL.

> Objetivo: estágio ou vaga júnior como front-end developer ou full-stack developer.

## Sobre o projeto

Um portfólio de uma página só, feito à mão com **HTML, CSS e JavaScript puros** (sem framework e sem etapa de build), com identidade própria inspirada no universo das corridas: o logo "bibi" com os pingos acesos como faróis, a buzina e o painel de telemetria.

### Destaques

- **Dois temas:** preto com vermelho (padrão) e branco com roxo. O botão de sol/lua alterna entre eles com uma transição circular, e a escolha fica salva no navegador.
- **Buzina:** o botão "bibi" ou a tecla <kbd>B</kbd> tocam a buzina, com som gerado pelo navegador (Web Audio).
- **Velocímetro e telemetria:** o painel no canto acompanha a velocidade da rolagem, e o card "telemetria da formação" mostra a trilha front-end → back-end → full-stack.
- **Menu em marchas (00–04):** início, sobre, skills, projetos e contato.
- **Skills em 3 cards:** front-end developer, back-end developer e ferramentas.
- **Projetos em destaque**, com animação de cartões empilhando na rolagem.
- **Tipografia:** tudo em STIX Two Text itálico.
- **Acessibilidade:** respeita `prefers-reduced-motion`, navegação por teclado e textos alternativos.

## Tecnologias

| Front-end | Back-end (em estudo) | Ferramentas |
| --- | --- | --- |
| HTML5, CSS3, JavaScript, React, Tailwind | PHP, SQL, Python | Git, GitHub, VS Code, Figma, Postman |

## Projetos

| Projeto | Link |
| --- | --- |
| Fórmula 1: Lights Out | [f1-nkjs.onrender.com](https://f1-nkjs.onrender.com) |
| Portal de Esportes | [esportes-zgzb.onrender.com](https://esportes-zgzb.onrender.com) |
| Calculadoras | [calculadora-js-edn1.onrender.com](https://calculadora-js-edn1.onrender.com) |

## Estrutura

```
portifolio/
├── index.html          # página
├── css/
│   └── style.css       # estilos e os dois temas
├── js/
│   ├── tema.js         # aplica o tema salvo antes da página aparecer
│   └── script.js       # interações, buzina, velocímetro e animações
└── img/
    ├── projetos/       # capas dos projetos (.webp)
    └── skills/         # ícones das tecnologias (.svg)
```

## Como rodar

Não precisa instalar nada. Basta abrir o `index.html` no navegador, ou subir um servidor local:

```bash
python -m http.server 8000
```

E acessar `http://localhost:8000`.

## Contato

- LinkedIn: [linkedin.com/in/biancavs](https://www.linkedin.com/in/biancavs/)
- GitHub: [github.com/buzinei-bibi](https://github.com/buzinei-bibi)
- Instagram: [@biibii_crf](https://www.instagram.com/biibii_crf/)
- Contribuo com open source na comunidade [He4rt Developers](https://heartdevs.com/).
