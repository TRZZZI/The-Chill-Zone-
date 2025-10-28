document.addEventListener('DOMContentLoaded', () => {
  const categories = ['anime', 'games', 'tech', 'movies', 'trending', 'upcoming'];

  // Fetch and display news
  categories.forEach(category => {
    fetch(`/api/news/${category}`)
      .then(res => res.json())
      .then(data => {
        const grid = document.querySelector(`#${category} .news-grid`);
        if (!grid) return;
        grid.innerHTML = data.map(item => `
          <div class="news-item">
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <a href="${item.link}" target="_blank">Read More</a>
          </div>
        `).join('');
      }).catch(err => {
        console.error('Error loading', category, err);
      });
  });

  // Fetch and display viral clip
  fetch('/api/viral-clip')
    .then(res => res.json())
    .then(data => {
      if (data && data.embedUrl) {
        document.getElementById('clip-container').innerHTML = `
          <iframe src="${data.embedUrl}" allowfullscreen></iframe>
          <p><a href="${data.link}" target="_blank">${data.title}</a></p>
        `;
      } else {
        document.getElementById('clip-container').innerHTML = '<p>No viral clip available.</p>';
      }
    }).catch(err => {
      console.error('Error loading viral clip', err);
    });

  // Search functionality
  document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.news-item').forEach(item => {
      const title = item.querySelector('h3').textContent.toLowerCase();
      item.style.display = title.includes(query) ? 'block' : 'none';
    });
  });
});
