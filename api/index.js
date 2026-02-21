const axios = require('axios');

class Animob {
    constructor() {
        this.client = axios.create({
            baseURL: 'https://animob-vidstr.fun/api',
            headers: {
                'accept-encoding': 'gzip',
                connection: 'Keep-Alive',
                host: 'animob-vidstr.fun',
                'user-agent': 'okhttp/4.9.2'
            }
        });
    }
    
    home = async function () {
        try {
            const { data } = await this.client('/');
            return data.results;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    search = async function (query, page = 1) {
        try {
            if (!query) throw new Error('Query is required.');
            const { data } = await this.client('/filter', {
                params: { keyword: query, page: page }
            });
            return data.results;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    detail = async function (id) {
        try {
            if (!id) throw new Error('Id is required.');
            const { data } = await this.client(`/info?id=${id}`);
            const { data: ep } = await this.client(`/episodes/${id}`);
            return {
                ...data.results,
                episodes: ep.results.episodes
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }
    
    episode = async function (episodeId) {
        try {
            if (!episodeId || !episodeId.includes('?ep=')) throw new Error('Invalid episode id.');
            const { data } = await this.client(`/backup/show-anime?episodeId=${episodeId}`);
            return data.results;
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

const animob = new Animob();

module.exports = async (req, res) => {
    // CORS Header
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { action, id, q } = req.query;

    try {
        if (action === 'home') {
            const data = await animob.home();
            res.status(200).json(data);
        } else if (action === 'search') {
            const data = await animob.search(q);
            res.status(200).json(data);
        } else if (action === 'detail') {
            const data = await animob.detail(id);
            res.status(200).json(data);
        } else if (action === 'episode') {
            const data = await animob.episode(id);
            res.status(200).json(data);
        } else {
            res.status(400).json({ error: 'Action tidak valid' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
