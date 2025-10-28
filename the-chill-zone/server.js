const express = require('express');
const Parser = require('rss-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

const parser = new Parser();
let cachedNews = { anime: [], games: [], trending: [], upcoming: [], tech: [], movies: [] };
let cachedViralClip = null;

// RSS feeds (categorized)
const feeds = {
  anime: ['https://www.animenewsnetwork.com/news/rss.xml', 'https://www.crunchyroll.com/rss'],
  games: ['https://feeds.feedburner.com/ign/games-all', 'https://www.gamespot.com/feeds/news/', 'https://kotaku.com/rss'],
  trending: ['https://feeds.feedburner.com/ign/games-all'],
  upcoming: ['https://www.gamespot.com/feeds/news/'],
  tech: ['https://feeds.arstechnica.com/arstechnica/index', 'https://www.theverge.com/rss/index.xml'],
  movies: ['https://www.empireonline.com/feeds/all', 'https://www.slashfilm.com/feed/']
};

// YouTube RSS for viral clip (IGN Gaming channel as example)
const youtubeFeed = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKy1dAqELo0zrOtPkf0eTMw';

async function fetchNews() {
  try {
    for (const category in feeds) {
      cachedNews[category] = [];
      for (const url of feeds[category]) {
        try {
          const feed = await parser.parseURL(url);
          (feed.items||[]).slice(0, 10).forEach(item => {
            cachedNews[category].push({
              title: item.title,
              link: item.link,
              summary: item.contentSnippet || item.summary || 'No summary available.',
              image: item.enclosure?.url || item.thumbnail || 'https://via.placeholder.com/300x200?text=No+Image',
              pubDate: item.pubDate
            });
          });
        } catch (e) {
          console.error('Error parsing feed', url, e.message);
        }
      }
    }
    console.log('News updated at', new Date());
  } catch (error) {
    console.error('Error fetching news:', error);
  }
}

async function fetchViralClip() {
  try {
    const feed = await parser.parseURL(youtubeFeed);
    const latestVideo = (feed.items||[])[0];
    if (latestVideo) {
      cachedViralClip = {
        title: latestVideo.title,
        link: latestVideo.link,
        embedUrl: latestVideo.link.replace('watch?v=', 'embed/')
      };
    }
  } catch (error) {
    console.error('Error fetching viral clip:', error);
  }
}

// Initial fetch
fetchNews();
fetchViralClip();

// Refresh every 4 hours
setInterval(() => {
  fetchNews();
  fetchViralClip();
}, 14400000);

// API endpoints
app.get('/api/news/:category', (req, res) => {
  const category = req.params.category;
  res.json(cachedNews[category] || []);
});

app.get('/api/viral-clip', (req, res) => {
  res.json(cachedViralClip);
});

// Fallback to index for client-side routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
