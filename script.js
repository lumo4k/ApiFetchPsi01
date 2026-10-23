const api = "https://hacker-news.firebaseio.com/v0";
const busca = document.querySelector("#busca");
const lista = document.querySelector("#lista");
const mensagem = document.querySelector("#mensagem");
let noticias = [];

async function consultarApi(caminho) {
    const resposta = await fetch(`${api}/${caminho}.json`);
    if (!resposta.ok) {
        throw new Error("Erro ao consultar a API");
    }
    return resposta.json();
}

async function carregarNoticias() {
    mensagem.textContent = "Carregando notícias...";
    try {
        const ids = await consultarApi("topstories");
        const resultados = await Promise.all(
            ids.slice(0, 20).map(id => consultarApi(`item/${id}`))
        );
        noticias = resultados.filter(item => item && !item.deleted && !item.dead);
        mostrarLista();
    } catch {
        mensagem.textContent = "Não foi possível carregar. Acesse Notícias para tentar novamente.";
    }
}

function mostrarLista() {
    const termo = busca.value.trim().toLowerCase();
    const filtradas = noticias.filter(noticia => noticia.title.toLowerCase().includes(termo));
    lista.replaceChildren();
    filtradas.forEach(noticia => {
        const item = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = noticia.title;
        link.href = `#detalhes/${noticia.id}`;
        item.appendChild(link);
        lista.appendChild(item);
    });
    mensagem.textContent = filtradas.length === 0 ? "Nenhuma notícia encontrada." : "";
}

function mostrarDetalhes(noticia) {
    document.querySelector("#titulo").textContent = noticia.title;
    document.querySelector("#autor").textContent = `Autor: ${noticia.by}`;
    document.querySelector("#pontos").textContent = `Pontos: ${noticia.score}`;
    document.querySelector("#data").textContent =
        `Publicado em: ${new Date(noticia.time * 1000).toLocaleString("pt-BR")}`;
    const link = document.querySelector("#link-noticia");
    const endereco = noticia.url || `https://news.ycombinator.com/item?id=${noticia.id}`;
    link.href = /^https?:\/\//i.test(endereco)
        ? endereco
        : `https://news.ycombinator.com/item?id=${noticia.id}`;
}

async function navegar() {
    const [tela, id] = (location.hash.slice(1) || "inicio").split("/");
    if (!["inicio", "noticias", "detalhes"].includes(tela)) {
        location.hash = "inicio";
        return;
    }
    document.querySelectorAll("main section").forEach(secao => {
        secao.hidden = secao.id !== tela;
    });
    if (tela === "noticias") {
        if (noticias.length === 0) await carregarNoticias();
        else mostrarLista();
    }
    if (tela === "detalhes") {
        const noticia = noticias.find(item => item.id === Number(id));
        if (noticia) mostrarDetalhes(noticia);
        else location.hash = "noticias";
    }
}

busca.addEventListener("input", mostrarLista);
window.addEventListener("hashchange", navegar);
navegar();
