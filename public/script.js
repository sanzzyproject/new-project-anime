const API_URL = '/api';

function showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
}

// Navigasi Bawah
function showPage(pageId, navElement = null) {
    document.querySelectorAll('.page-sec').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');

    if (navElement) {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        navElement.classList.add('active');
    }

    if (pageId === 'home-sec' && document.getElementById('home-grid').innerHTML === '') {
        loadHome();
    }
}

// Load Home Recommendations
async function loadHome() {
    showLoading(true);
    try {
        const res = await fetch(`${API_URL}?action=home`);
        const data = await res.json();
        
        let html = '';
        data.forEach(anime => {
            html += `
                <div class="anime-card" onclick="loadDetail('${anime.id}')">
                    <img src="${anime.image}" alt="${anime.title}">
                    <h3>${anime.title}</h3>
                </div>
            `;
        });
        document.getElementById('home-grid').innerHTML = html;
    } catch (err) {
        console.error(err);
        document.getElementById('home-grid').innerHTML = '<p>Gagal memuat data.</p>';
    }
    showLoading(false);
}

// Search Function
async function searchAnime() {
    const query = document.getElementById('search-input').value;
    if (!query) return;

    showLoading(true);
    document.getElementById('search-results').innerHTML = '';
    
    try {
        const res = await fetch(`${API_URL}?action=search&q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        let html = '';
        data.forEach(anime => {
            html += `
                <div class="anime-card" onclick="loadDetail('${anime.id}')">
                    <img src="${anime.image}" alt="${anime.title}">
                    <h3>${anime.title}</h3>
                </div>
            `;
        });
        document.getElementById('search-results').innerHTML = html || '<p>Tidak ditemukan.</p>';
    } catch (err) {
        console.error(err);
    }
    showLoading(false);
}

// Load Detail Anime & Episodes
async function loadDetail(id) {
    showPage('detail-sec');
    showLoading(true);
    document.getElementById('anime-info').innerHTML = '';
    document.getElementById('episode-list').innerHTML = '';
    document.getElementById('player-container').classList.add('hidden');
    document.getElementById('video-player').src = '';

    try {
        const res = await fetch(`${API_URL}?action=detail&id=${id}`);
        const data = await res.json();

        // Render Info
        document.getElementById('anime-info').innerHTML = `
            <div class="detail-info">
                <h2>${data.title}</h2>
                <p><strong>Status:</strong> ${data.status}</p>
                <p>${data.synopsis || 'Tidak ada sinopsis.'}</p>
            </div>
        `;

        // Render Episodes (Reserve array agar eps 1 di awal jika aslinya terbalik)
        let html = '';
        const episodes = data.episodes.reverse(); 
        episodes.forEach((ep, index) => {
            // Karena Animob expect string dengan '?ep=', kita gunakan id episodenya
            html += `<div class="ep-btn" onclick="playVideo('${ep.id}', this)">${index + 1}</div>`;
        });
        document.getElementById('episode-list').innerHTML = html;

    } catch (err) {
        console.error(err);
        document.getElementById('anime-info').innerHTML = '<p>Gagal memuat detail.</p>';
    }
    showLoading(false);
}

// Play Video
async function playVideo(episodeId, btnElement) {
    // Highlight active button
    document.querySelectorAll('.ep-btn').forEach(btn => btn.classList.remove('active-ep'));
    btnElement.classList.add('active-ep');

    showLoading(true);
    try {
        const res = await fetch(`${API_URL}?action=episode&id=${encodeURIComponent(episodeId)}`);
        const data = await res.json();

        const playerContainer = document.getElementById('player-container');
        const player = document.getElementById('video-player');
        
        // Memasukan URL video ke iframe
        if (data.url || data.iframe) {
            player.src = data.url || data.iframe;
            playerContainer.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            alert('Video tidak tersedia saat ini.');
        }

    } catch (err) {
        console.error(err);
        alert('Gagal memuat video.');
    }
    showLoading(false);
}

// Init Load
window.onload = loadHome;
