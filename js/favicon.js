// js/favicon.js
// Gera dinamicamente favicons (PNG e apple-touch-icon) a partir da imagem do app
// Roda no navegador e substitui os link[rel~='icon'] existentes por data URLs gerados via canvas.

function toDataURLFromImage(img, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    // fundo transparente
    ctx.clearRect(0, 0, size, size);

    // calcular tamanho mantendo proporção
    const ratio = Math.min(size / img.width, size / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    const x = (size - w) / 2;
    const y = (size - h) / 2;

    // desenhar
    ctx.drawImage(img, x, y, w, h);
    return canvas.toDataURL('image/png');
}

function setLink(rel, href, type = 'image/png', sizes) {
    // remover links existentes do mesmo rel/sizes
    const existing = Array.from(document.querySelectorAll(`link[rel='${rel}']`)).filter(l => !sizes || l.getAttribute('sizes') === sizes);
    existing.forEach(e => e.remove());

    const link = document.createElement('link');
    link.rel = rel;
    if (sizes) link.sizes = sizes;
    link.type = type;
    link.href = href;
    document.head.appendChild(link);
}

function generateFaviconsFromSrc(src) {
    const img = new Image();
    // tentar carregar com crossOrigin para evitar problemas se a imagem for externa
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        try {
            const png16 = toDataURLFromImage(img, 16);
            const png32 = toDataURLFromImage(img, 32);
            const png180 = toDataURLFromImage(img, 180);

            // setar favicons
            setLink('icon', png32, 'image/png', '32x32');
            // fallback/shortcut
            setLink('shortcut icon', png16, 'image/png', '16x16');
            // apple touch
            setLink('apple-touch-icon', png180, 'image/png', '180x180');

            // Atualizar document.title/favicon cache bust (opcional)
            // Forçar recarga do favicon em alguns navegadores
            const t = document.title;
            document.title = t + ' ';
            setTimeout(() => document.title = t, 50);
        } catch (err) {
            console.warn('Erro ao gerar favicon:', err);
        }
    };
    img.onerror = () => {
        console.warn('Não foi possível carregar a imagem para gerar favicon:', src);
    };

    // usar a tag #logo-img se existir (garante caminho correto e encode)
    const logoEl = document.getElementById('logo-img');
    if (logoEl && logoEl.src) {
        // usar o src já resolvido pelo navegador
        img.src = logoEl.src;
    } else {
        // caso contrário, tentar usar o caminho passado
        img.src = encodeURI(src);
    }
}

// Executa após carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Nome do arquivo usado no projeto (conforme index.html)
    const defaultSrc = 'Imagem do WhatsApp de 2024-11-14 à(s) 21.42.02_a263ffdf.jpg';
    generateFaviconsFromSrc(defaultSrc);
});
