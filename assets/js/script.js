// API KEY
const apiKey = "09a768f72164141fe50ccdf4967f1388";

// Variables
var searchHistoryArr = [];
var currentWeather = document.querySelector("#current-weather");
var userForm = document.querySelector("#user-form");
var searchInput = document.querySelector("#city");
var searchHistory = document.querySelector(".search-history");
var fiveDaysForcast = document.querySelector(".five-days-forcast");

// Function to display general information
var showCity = function (data) {
  currentWeather.textContent = "";
  var cityName = document.createElement("h2");
  var weatherIcon = document.createElement("img");
  cityName.classList = "card-header text-center";
  cityName.textContent =
    data.name + " (" + moment(data.dt * 1000).format("MM/DD/YYYY") + ")";
  weatherIcon.setAttribute(
    "src",
    "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png"
  );
  cityName.appendChild(weatherIcon);
  return cityName;
};

// Function to show the ttemperature
var showTemp = function (data) {
  var tempListEl = document.createElement("li");
  tempListEl.className = "list-group-item";
  tempListEl.textContent = "Temperature: " + data.main.temp + " F";
  return tempListEl;
};

// Function to show the wind speed
var showWindspeed = function (data) {
  var windSpeedListEl = document.createElement("li");
  windSpeedListEl.className = "list-group-item";
  windSpeedListEl.textContent = "Wind Speed: " + data.wind.speed + " MPH";
  return windSpeedListEl;
};

// Function to show the humidity
var showHumidity = function (data) {
  var humid = document.createElement("li");
  humid.className = "list-group-item";
  humid.textContent = "Humidity: " + data.main.humidity + "%";
  return humid;
};

// Function to show current weather
var showCurrent = function (data) {
  currentWeather.appendChild(showCity(data));
  var currList = document.createElement("ul");
  currList.classList = "card-body list-group";
  currList.appendChild(showTemp(data));
  currList.appendChild(showWindspeed(data));
  currList.appendChild(showHumidity(data));

  var getUvIndex = function (data) {
    var apiUrl =
      "https://api.openweathermap.org/data/2.5/onecall?lat=" +
      data.coord.lat +
      "&lon=" +
      data.coord.lon +
      "&units=imperial&appid=09a768f72164141fe50ccdf4967f1388";

    fetch(apiUrl).then(function (response) {
      if (response.ok) {
        response.json().then(function (uvData) {
          var uvIndexEl = document.createElement("li");
          var indexEl = document.createElement("span");
          indexEl.textContent = uvData.current.uvi;
          if (uvData.current.uvi >= 6) {
            indexEl.classList = "badge badge-danger";
          } else if (uvData.current.uvi < 6 && uvData.current.uvi >= 3) {
            indexEl.classList = "badge badge-warning";
          } else {
            indexEl.classList = "badge badge-success";
          }

          uvIndexEl.className = "list-group-item";
          uvIndexEl.textContent = "UV index: ";
          uvIndexEl.appendChild(indexEl);
          currList.appendChild(uvIndexEl);
        });
      } else {
        alert("Could not find the UV index.");
      }
    });
  };
  getUvIndex(data);
  currentWeather.appendChild(currList);
};

 // Getting weather data from the API
var weatherData = function (city) {
  var apiUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    city +
    "&units=imperial&appid=09a768f72164141fe50ccdf4967f1388";

  fetch(apiUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        showCurrent(data);
      });
    } else {
      alert("Could not find the city! Please check your spelling.");
    }
  });

  var forcastUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    city +
    "&units=imperial&appid=09a768f72164141fe50ccdf4967f1388";

  var displayForcast = function (obj) {
    // make the card
    var card = document.createElement("div");
    card.classList = "card days";
    // card header
    var cardHead = document.createElement("h4");
    cardHead.textContent = moment(obj.dt_txt).format("MM/DD/YYYY");
    cardHead.className = "card-header";
    // card body
    var cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // list icon
    var cardIcon = document.createElement("img");
    cardIcon.setAttribute(
      "src",
      "https://openweathermap.org/img/wn/" + obj.weather[0].icon + "@2x.png"
    );
    cardBody.appendChild(cardIcon);

    // list temp
    var tempEl = document.createElement("li");
    tempEl.textContent = "Temp: " + obj.main.temp + " F";
    cardBody.appendChild(tempEl);

    // list humidity
    var humidEl = document.createElement("li");
    humidEl.textContent = "Humidity: " + obj.main.humidity + "%";
    cardBody.appendChild(humidEl);

    // list wind speed
    var windEl = document.createElement("li");
    windEl.textContent = "Wind: " + obj.wind.speed + " MPH";
    cardBody.appendChild(windEl);

    card.appendChild(cardHead);
    card.appendChild(cardBody);
    fiveDaysForcast.appendChild(card);
  };

  fetch(forcastUrl).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        var dateArr = data.list;
        fiveDaysForcast.textContent = "";
        for (var i = 0; i < dateArr.length; i += 7) {
          displayForcast(dateArr[i]);
          i += 1;
        }
      });
    } else {
      alert("Could not get the forcast data");
    }
  });
};

// Functions to save history in the local storage
var saveInBrowser = function (arr) {
  var arr = JSON.stringify(arr);
  localStorage.setItem("Search-History", arr);
};

var saveCity = function (city) {
  var cityName = document.createElement("li");
  cityName.classList = "list-group-item text-center";
  cityName.setAttribute("data-name", city);
  cityUpper = city.toUpperCase();
  cityName.textContent = cityUpper;
  searchHistoryArr.push(city);
  saveInBrowser(searchHistoryArr);
  searchHistory.appendChild(cityName);
};

var submitHandler = function (event) {
  event.preventDefault();
  var userSearch = searchInput.value.trim();
  if (userSearch) {
    weatherData(userSearch);
    saveCity(userSearch);
  } else {
    alert("Please enter a city Name");
  }
};

var btnClickHandler = function (event) {
  var selectedCity = event.target.getAttribute("data-name");
  if (selectedCity) {
    weatherData(selectedCity);
  }
};

// To display seartch history
var citySearchHistory = function () {
  cityArr = JSON.parse(localStorage.getItem("Search-History"));
  if (!cityArr) {
    cityArr = [];
  }
  for (var i = 0; i < cityArr.length; i++) {
    saveCity(cityArr[i]);
  }
};

// Function for clearing storage
function clearStorage(){ 
  localStorage.clear();
}

citySearchHistory();

document.getElementById("resetButton").addEventListener("click", clearStorage);
userForm.addEventListener("submit", submitHandler);
searchHistory.addEventListener("click", btnClickHandler);