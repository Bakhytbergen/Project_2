const apiKey = '714d25c55479e83095eb629aea870a0a';
let units = 'metric';
let currentLat = null;
let currentLon = null;



/*
This function fetches the current weather for 
the specified latitude and longitude using the OpenWeather API. 
After receiving the weather data, it calls the displayWeather and displayinfo 
functions to show the current weather and additional information on the page.
*/
async function getWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=en`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            displayWeather(data);
            displayinfo(data);
        } else {
            console.log('Error fetching weather data.');
        }
    } catch (error) {
        console.error('Request error:', error);
        console.log('An error occurred while connecting to the server.');
    }
}

/*
This function displays the current weather on the page.
 It shows the city name, country, current temperature, and the weather icon, which are fetched from the API response.
*/
function displayWeather(data) {
    const weatherContainer = document.getElementById('current-weather');
    weatherContainer.innerHTML = `
        <div class="city-info">
            <div class="city-name">
                <h2>${data.name}, ${data.sys.country}</h2>
            </div>
            <div class="temperature">
                <p>${data.main.temp}° ${units === 'metric' ? 'C' : 'F'}</p>
            </div>
        </div>
        <div class="weather-info">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon" class="weather-icon">
        </div>
    `;
}

/*
This function displays additional weather information such as humidity,
 wind speed, weather description, and visibility (in kilometers), retrieved from the API.
*/

function displayinfo(data) {
    const info_conteiner = document.getElementById('infoo');
    info_conteiner.innerHTML = `
        <div class="weather-details">
            <div class="humidity">
                <p>Humidity</p>
                <p>${data.main.humidity}%</p>
            </div>
            <div class="wind-speed">
                <p>Wind speed</p>
                <p>${data.wind.speed} m/s</p>
            </div>
            <div class="description">
                <p>Description</p>
                <p>${data.weather[0].description}</p>
            </div>
            <div class="visibility">
                <p>Visibility</p>
                <p>${data.visibility / 1000} km</p>
            </div>
        </div>
    `;
}


/*
This function retrieves a 5-day weather forecast for the given latitude and longitude using the OpenWeather API. 
The retrieved data is passed to the displayForecast function, which displays the forecast on the page.
*/

async function getFiveDayForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=en`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === '200') {
            displayForecast(data);
        }
    } catch (error) {
        console.error('Forecast request error:', error);
    }
}


/*
This function displays the 5-day weather forecast. For each day, it shows the maximum and minimum temperatures and the weather icon.
*/
function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    for (let i = 0; i < 5; i++) {
        const day = data.list[i * 8];
        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');

        dayElement.innerHTML = `
            <h3>${new Date(day.dt * 1000).toLocaleDateString()}</h3>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon">
            <p>Max: ${day.main.temp_max}° ${units === 'metric' ? 'C' : 'F'}</p>
            <p>Min: ${day.main.temp_min}° ${units === 'metric' ? 'C' : 'F'}</p>
        `;

        forecastContainer.appendChild(dayElement);
    }
}


/*
This function is called when a user selects a city. It populates the input field with the chosen city and stores its coordinates. 
It then calls the getWeatherByCoordinates and getFiveDayForecast functions 
to fetch the current weather and 5-day forecast for the selected city.
*/

function selectCity(cityName, lat, lon) {
    const cityInput = document.getElementById('city-input');
    cityInput.value = cityName;

    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';

    currentLat = lat;
    currentLon = lon;

    getWeatherByCoordinates(lat, lon);
    getFiveDayForecast(lat, lon);
}

/*
This function searches for cities based on the text entered in the input field.
 It sends a request to the OpenWeather API to get a list of cities that start with the entered text.
 If results are found, they are displayed in an autocomplete list. When a city is clicked,
  its data is passed to the selectCity function, which displays the weather for the selected city.
*/

async function searchCityWeather() {
    const city = document.getElementById('city-input').value.trim().toLowerCase();
    const autocompleteList = document.getElementById('autocomplete-list');

    if (city.length > 0) {
        const url = `https://api.openweathermap.org/data/2.5/find?q=${city}&appid=${apiKey}&units=${units}&lang=en`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            autocompleteList.innerHTML = '';

            if (data.cod === '200') {
                const cities = data.list.filter(cityData => cityData.name.toLowerCase().startsWith(city));

                if (cities.length === 0) {
                    autocompleteList.style.display = 'none';
                    return;
                }

                cities.forEach(cityData => {
                    const cityItem = document.createElement('div');
                    cityItem.classList.add('autocomplete-item');
                    cityItem.innerText = `${cityData.name}, ${cityData.sys.country}`;

                    cityItem.addEventListener('click', () => {
                        document.getElementById('city-input').value = `${cityData.name}, ${cityData.sys.country}`;
                        autocompleteList.style.display = 'none';
                        selectCity(cityData.name, cityData.coord.lat, cityData.coord.lon);
                    });

                    autocompleteList.appendChild(cityItem);
                });

                autocompleteList.style.display = 'block';
            }
        } catch (error) {
            console.error('Request error:', error);
        }
    } else {
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
    }
}



/*
This function requests the user's location through the browser (if supported).
 Once the coordinates are obtained, it calls the getWeatherByCoordinates and 
 getFiveDayForecast functions to display the weather for the user's current location.
*/
function getUserLocation() {
    const cityInput = document.getElementById('city-input');
    cityInput.value = '';

    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            currentLat = lat;
            currentLon = lon;

            getWeatherByCoordinates(lat, lon);
            getFiveDayForecast(lat, lon);
        }, error => {
            alert('Unable to get your location');
        });
    } else {
        alert('Your browser does not support geolocation');
    }
}

/*
This function toggles the temperature units between Celsius and Fahrenheit based 
on the state of a checkbox. When the units are changed, 
it updates the current weather and forecast, if a city has already been selected.
*/
function toggleUnits() {
    const unitSwitch = document.getElementById('unit-switch');
    units = unitSwitch.checked ? 'imperial' : 'metric';
    document.getElementById('unit-label').innerText = unitSwitch.checked ? '°F' : '°C';

    if (currentLat && currentLon) {
        getWeatherByCoordinates(currentLat, currentLon);
        getFiveDayForecast(currentLat, currentLon);
    }
}
