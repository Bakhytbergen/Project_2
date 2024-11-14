const apiKey = '73858d75f7de4ce28adebb3b904f40d4';
const apiUrl = 'https://api.spoonacular.com/recipes';

document.getElementById('favorites-btn').addEventListener('click', showFavorites);

document.getElementById('search').addEventListener('input', handleSearchInput);



/*
Triggered when the user types in the search field. If the input length is greater than 0,
 it calls the searchRecipes and autocomplete functions. If the search field is empty, it hides the autocomplete results.
*/
function handleSearchInput() {
  const query = document.getElementById('search').value;

  if (query.length > 0) {
    searchRecipes(query);
    autocomplete(query);
  } else {
    document.getElementById('autocomplete-results').innerHTML = '';
    document.getElementById('autocomplete-container').style.display = 'none';
  }
}



/*
Makes a request to the Spoonacular API to search for recipes based on 
the provided query (query). Once the response is received, it calls the displayRecipes function to display the found recipes.
*/
function searchRecipes(query) {
  fetch(`${apiUrl}/complexSearch?apiKey=${apiKey}&query=${query}&number=10`)
    .then(response => response.json())
    .then(data => displayRecipes(data.results))
    .catch(error => console.error('Error:', error));
}


/*
Displays the list of recipes as cards. For each recipe, it creates a container with 
an image, title, buttons for viewing the recipe, and adding to favorites.

*/
function displayRecipes(recipes) {
  const grid = document.getElementById('recipes-grid');
  grid.innerHTML = '';

  recipes.forEach(recipe => {
    const recipeContainer = document.createElement('div');
    recipeContainer.classList.add('recipe-container');

    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <button onclick="viewRecipe(${recipe.id})">View Recipe</button>
      <button class="favorite-btn" onclick="toggleFavorite(${recipe.id}, event)">
        <svg  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="heart-icon">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </button>
    `;
    recipeContainer.appendChild(card);
    grid.appendChild(recipeContainer);
  });
}




/*
Makes a request to the Spoonacular API to get autocomplete suggestions for the query. When the user types,
 it shows a list of suggested options. If the list is empty, it hides the autocomplete container.
*/
function autocomplete(query) {
  fetch(`${apiUrl}/autocomplete?apiKey=${apiKey}&query=${query}&number=10`)
    .then(response => response.json())
    .then(data => displayAutocomplete(data))
    .catch(error => console.error('Error:', error));
}
/*
Displays the autocomplete results as a list. When an autocomplete item is clicked, 
the search field is filled with the selected value, and the results are hidden. It then performs a search for the selected query.

*/
function displayAutocomplete(results) {
  const autocompleteList = document.getElementById('autocomplete-results');
  autocompleteList.innerHTML = '';

  if (results.length > 0) {
    document.getElementById('autocomplete-container').style.display = 'block';
  } else {
    document.getElementById('autocomplete-container').style.display = 'none';
  }

  results.forEach(result => {
    const div = document.createElement('div');
    div.classList.add('autocomplete-item');
    div.textContent = result.title;
    div.style.cursor = 'pointer';
    div.addEventListener('click', function () {
      document.getElementById('search').value = result.title;
      document.getElementById('autocomplete-results').innerHTML = '';
      document.getElementById('autocomplete-container').style.display = 'none';
      searchRecipes(result.title);
    });
    autocompleteList.appendChild(div);
  });
}


/*
Opens a modal with detailed information about the recipe.
 It fetches recipe data by its id and displays information about its ingredients, instructions, and nutritional value.
*/
function viewRecipe(id) {
  const recipeCards = document.querySelectorAll('.recipe-card');
  recipeCards.forEach(card => {
    card.classList.add('no-hover');
  });

  fetch(`${apiUrl}/${id}/information?apiKey=${apiKey}&includeNutrition=true`)
    .then(response => response.json())
    .then(data => {
      const modal = document.getElementById('recipe-modal');
      const details = document.getElementById('recipe-details');
      details.innerHTML = `
        <span class="close-btn" onclick="closeModal()">&times;</span>
        <h2>${data.title}</h2>
        <img src="${data.image}" alt="${data.title}" style="width: 100%; max-height: 300px;">
        <h3>Ingredients:</h3>
        <div class="ingredients-container">
          ${data.extendedIngredients.map(ing => `<div class="ingredient-item">${ing.original}</div>`).join('')}
        </div>
        <h3>Instructions:</h3>
        <p>${data.instructions}</p>
        <h3>Nutrition:</h3>
        <p>Calories: ${data.nutrition.nutrients.find(n => n.name === 'Calories').amount} kcal</p>
      `;
      modal.style.display = 'flex';
    })
    .catch(error => console.error('Error fetching recipe details:', error));
}




/*
Closes the modal with the recipe details and restores the ability to hover over recipe cards.
*/
function closeModal() {
  document.getElementById('recipe-modal').style.display = 'none';

  const recipeCards = document.querySelectorAll('.recipe-card');
  recipeCards.forEach(card => {
    card.classList.remove('no-hover');
  });
}




/*
Adds or removes a recipe from the favorites list using localStorage. When a recipe is added to favorites, the heart
 icon changes to red. When removed, the icon returns to empty. A notification is displayed indicating the change.
*/

function toggleFavorite(id, event) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const heartButton = event.target.closest('.favorite-btn').querySelector('.heart-icon');

  if (favorites.includes(id)) {
    favorites = favorites.filter(favoriteId => favoriteId !== id);
    heartButton.style.fill = 'none';
    alert('Recipe removed from favorites!');
  } else {
    favorites.push(id);
    heartButton.style.fill = 'red';
    alert('Recipe added to favorites!');
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}



/*
Displays all the recipes added to the favorites list as cards. If no recipes are in favorites, it shows a message 
saying there are no favorites yet. After displaying favorites, it hides the main container and shows the favorites container.
*/
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const favoritesList = document.getElementById('favorites-list');
  favoritesList.style.display = 'grid';
  favoritesList.style.gridTemplateColumns = 'repeat(3, 1fr)';
  favoritesList.style.gap = '20px';
  favoritesList.innerHTML = '';

  if (favorites.length === 0) {
    favoritesList.innerHTML = `<p>No favorites yet!</p>`;
  } else {
    favorites.forEach(id => {
      fetch(`${apiUrl}/${id}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const favoriteCard = document.createElement('div');
          favoriteCard.classList.add('recipe-card');
          favoriteCard.innerHTML = `
            <img src="${data.image}" alt="${data.title}">
            <h3>${data.title}</h3>
            <p>Ready in ${data.readyInMinutes} mins</p>
            <button onclick="viewRecipe(${data.id})">View Recipe</button>
            <button class="favorite-btn" onclick="toggleFavorite(${data.id}, event)">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="heart-icon" style="fill: red;">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>
          `;
          favoritesList.appendChild(favoriteCard);
        })
        .catch(error => console.error('Error fetching favorite recipe:', error));
    });
  }

  document.querySelector('.container').style.display = 'none';
  document.getElementById('favorites-container').style.display = 'block';
}

function goBack() {
  document.querySelector('.container').style.display = 'block';
  document.getElementById('favorites-container').style.display = 'none';
}
