const apiKey = 'dccea7852850ea26f49ad6ef21ce8f20';
const apiUrl = 'https://api.themoviedb.org/3';
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

document.getElementById('search').addEventListener('input', searchMovies);
document.getElementById('search').addEventListener('input', searchMovies);
document.getElementById('sort-popularity').addEventListener('click', () => sortSearchResults('popularity.desc'));
document.getElementById('sort-release-date').addEventListener('click', () => sortSearchResults('release_date.desc'));
document.getElementById('sort-rating').addEventListener('click', () => sortSearchResults('vote_average.desc'));

/*
In this function, I retrieve the user's input from the search field.
 If the input is empty, I hide the autocomplete list. If there’s a query, 
 I send a request to the API to search for movies and process the received data:
  I store the search results in localStorage, display the movies on the page, and show an autocomplete list with search results.
*/
function searchMovies() {
  const query = document.getElementById('search').value;
  if (query === '') {
    document.getElementById('autocomplete-list').style.display = 'none'; 
    return;
  }

  fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`)
    .then(response => response.json())
    .then(data => {
      localStorage.setItem('lastSearchResults', JSON.stringify(data.results));
      displayMovies(data.results); 
      showAutocomplete(data.results); 
    })
    .catch(error => console.error('Error:', error));
}




/*
 In this function, I clear the current movie cards on the page and then create new cards for each movie passed to the function. Each card includes information about the movie, such as an image, title, release year, and buttons to view details and add the movie to the watchlist.
  I check if the movie is in the watchlist and change the color of the "Add to Watchlist" button accordingly.
*/

function displayMovies(movies) {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const grid = document.getElementById('movies-grid');
  grid.innerHTML = '';

  movies.forEach(movie => {
    const isInWatchlist = watchlist.includes(movie.id);
    const card = document.createElement('div');
    card.classList.add('movie-card');
    card.innerHTML = `
      <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}">
      <h3 style="width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${movie.title}</h3>
      <p>${new Date(movie.release_date).getFullYear()}</p>
      
      <div class = "some">
        <button class="view-btn" onclick="viewMovie(${movie.id})">View Details</button>
        <button class="favorite-btn" onclick="toggleWatchlist(${movie.id}, event)">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="heart-icon" style="fill: ${isInWatchlist ? 'red' : 'none'};">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    </div>
      
    `;
    grid.appendChild(card);
  });
}



/*
 In this function, I handle the display of autocomplete suggestions for the search field. When the user types, I send a request and display a list of suggestions that can be selected. If the list is empty, 
 it’s hidden. If an item is selected, the input field is filled with the chosen movie title, and a new search is triggered.
*/
function showAutocomplete(movies) {
  const list = document.getElementById('autocomplete-list');
  list.innerHTML = ''; 
  if (movies.length === 0) {
    list.style.display = 'none'; 
    return;
  }

  movies.forEach(movie => {
    const item = document.createElement('div');
    item.classList.add('autocomplete-item');
    item.innerText = movie.title;
    
    item.addEventListener('click', () => {
      document.getElementById('search').value = movie.title; 
      list.style.display = 'none';
      searchMovies(); 
    });

    list.appendChild(item);
  });

  list.style.display = 'block'; 
}





/*
In this function, I implement sorting of search results based on different criteria (popularity, release date, rating). I retrieve the search results from localStorage,
 sort them according to the selected criterion, and display the sorted results on the page.
*/

function sortSearchResults(sortBy) {
  const searchResults = JSON.parse(localStorage.getItem('lastSearchResults'));
  if (!searchResults) return;

  const sortedResults = searchResults.sort((a, b) => {
    if (sortBy === 'popularity.desc') {
      return b.popularity - a.popularity;
    } else if (sortBy === 'release_date.desc') {
      return new Date(b.release_date) - new Date(a.release_date);
    } else if (sortBy === 'vote_average.desc') {
      return b.vote_average - a.vote_average;
    }
    return 0;
  });

  localStorage.setItem('lastSearchResults', JSON.stringify(sortedResults));

  displayMovies(sortedResults);
}



/*
When the user clicks on the "View Details" button, I send a request to get detailed information about the movie (including actors, trailers, 
and additional data). After receiving the data, I create HTML for the modal window, display the movie details, and show the actor list. If a trailer is available, I show a button to link to YouTube.
*/
function viewMovie(id) {
  fetch(`${apiUrl}/movie/${id}?api_key=${apiKey}&append_to_response=credits,videos`)
    .then(response => response.json())
    .then(data => {
      const modal = document.getElementById('movie-modal');
      const details = document.getElementById('movie-details');
      const trailer = data.videos.results.find(video => video.type === "Trailer");

      const genres = data.genres.map(genre => genre.name).join(', ');

      const castHTML = data.credits.cast.map(actor => `
        <div class="actor">
          <img src="${imageBaseUrl}${actor.profile_path}" alt="${actor.name}">
          <p>${actor.name}</p>
        </div>
      `).join('');

      details.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <div class="details">
          <img src="${imageBaseUrl}${data.poster_path}" alt="${data.title}" style="width: 100%; max-height: 500px;">
          <h2>${data.title}</h2>

          <!-- Основной контейнер для информации о фильме -->
          <div class="movie-info-container">
            <div class="movie-rating"><strong>Rating:</strong> ${data.vote_average} / 10</div>
            <div class="movie-runtime"><strong>Runtime:</strong> ${data.runtime} mins</div>
            <div class="movie-genres"><strong>Genres:</strong> ${genres}</div>
            <div class="movie-synopsis"><strong>Synopsis:</strong> ${data.overview}</div>
          </div>

         
          <div class="cast-gallery">
            <h3>Cast:</h3>
            <div class="cast-list">
              ${castHTML}
            </div>
          <div class="trailer-button-container">
            ${trailer ? `<a href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank">
              <button class="trailer-button">Watch Trailer</button>
            </a>` : ''}
          </div>
      `;
      modal.style.display = 'flex';
    })
    .catch(error => console.error('Error fetching movie details:', error));
}

// This function closes the modal window displaying the movie details.
function closeModal() {
  document.getElementById('movie-modal').style.display = 'none';
}


/*
In this function, I handle adding or removing a movie from the watchlist. When the "Add to Watchlist" button is
 clicked, I check if the movie is already in the watchlist and either add it or remove it.
*/
function toggleWatchlist(id, event) {
  let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const heartButton = event.target.closest('.favorite-btn').querySelector('.heart-icon');

  if (watchlist.includes(id)) {
    watchlist = watchlist.filter(movieId => movieId !== id);
    heartButton.style.fill = 'none'; 
    alert('Removed from Watchlist');
  } else {
    watchlist.push(id);
    heartButton.style.fill = 'red'; 
    alert('Added to Watchlist');
  }

  localStorage.setItem('watchlist', JSON.stringify(watchlist));
  displayMovies(JSON.parse(localStorage.getItem('lastDisplayedMovies')) || []);
  displayWatchlist();
}

function displayWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
  const grid = document.getElementById('watchlist-grid');
  grid.innerHTML = '';

  watchlist.forEach(id => {
    fetch(`${apiUrl}/movie/${id}?api_key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.innerHTML = `
          <img src="${imageBaseUrl}${data.poster_path}" alt="${data.title}">
          <h3>${data.title}</h3>
          <p>${new Date(data.release_date).getFullYear()}</p>
          <div class = "some">
            <button class = "view-btn"onclick="viewMovie(${data.id})">View Details</button>
            <button class="favorite-btn" onclick="toggleWatchlist(${data.id}, event)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="heart-icon" style="fill: red;">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          </div>
          
        `;
        grid.appendChild(card);
      })
      .catch(error => console.error('Error fetching watchlist movie:', error));
  });
}

function toggleView(view) {
  const moviesGrid = document.getElementById('movies-grid');
  const watchlistSection = document.getElementById('watchlist-section');
  const viewWatchlistButton = document.getElementById('view-watchlist');
  const viewMainButton = document.getElementById('view-main');

  if (view === 'watchlist') {
    moviesGrid.style.display = 'none';
    watchlistSection.style.display = 'block';
    viewWatchlistButton.style.display = 'none';
    viewMainButton.style.display = 'inline';
    displayWatchlist();
  } else {
    moviesGrid.style.display = 'flex';
    watchlistSection.style.display = 'none';
    viewWatchlistButton.style.display = 'inline';
    viewMainButton.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  displayWatchlist();
  if (localStorage.getItem('lastDisplayedMovies')) {
    displayMovies(JSON.parse(localStorage.getItem('lastDisplayedMovies')));
  }
});