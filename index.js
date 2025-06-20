const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const errorImage = document.querySelector("[data-errorPage]");

//Initially variables needed
const apiKey = "509b4b2937772f841254eabeed3ec14d";
let currentTab = userTab;
getFromSessionStorage();

//This syntax shows as a confirmation that you are on this tab
currentTab.classList.add("current-tab");

//Functio to switch tabs
function switchTab(clickedTab) {
    if (clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            errorImage.classList.remove("active");
        }
        else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            errorImage.classList.remove("active");
            getFromSessionStorage();
        }
    }
};


//Adding Event Listeners
userTab.addEventListener('click', () => {
    //Pass clicked tab as an argument
    switchTab(userTab);
});

searchTab.addEventListener('click', () => {
    //Pass clicked tab as an argument
    switchTab(searchTab);
});



//Function to get weather data from session storage
function getFromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
   
};

//Function to fetch user weather info
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    grantAccessContainer.classList.remove("active");
    loadingScreen.classList.add("active");

    //API call to fetch weather data
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        const data = await response.json();
        if (data.cod !== 200) {
            throw new Error(data.message);
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(error) {
        loadingScreen.classList.remove("active");
        errorImage.classList.add("active");
    }

};

//Function to render weather info
function renderWeatherInfo(weatherInfo) {

    //Firstly we have to fetch and save the data in variables

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const weatherDescription = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temperature]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //Fetch values from the weatherInfo object and put in UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDescription.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
    // windSpeed.innerText = weatherInfo?.wind?.speed;
    // humidity.innerText = weatherInfo?.main?.humidity;
    // cloudiness.innerText = weatherInfo?.clouds?.all;

};

//Function to show position
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

function geoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
};

//Adding event listener to grant access button
const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener('click', geoLocation);

//Adding event listener to search form
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit" , (e) => {
    e.preventDefault();
    let cityName = searchInput.value;
    if (cityName === "") {
        return;

    } else {
        fetchSearchWeatherInfo(cityName);
    }
    
});



//Function to fetch The given city weather info
async function fetchSearchWeatherInfo(city) {

    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const data = await response.json();
        if (data.cod !== 200) {
            throw new Error(data.message);
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch(error) {
        errorImage.classList.add("active");
        loadingScreen.classList.remove("active");
    }
};