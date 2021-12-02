/**
 * Welcome to my travel planning page. This page allows the user to search for information about a country, as well as to search for
 * countries that share a given language or currency. The forecast of the country's capital city is also provided, following one of the
 * ZyBooks excercises for the table. 
 * 
 * This project uses two APIs: the OpenWeather API and the REST countries API.
 * I used the api-calling forecast function and html from ZyBooks' Ajax & REST api lesson, 
 * using the code from the city forecast comparison excercise. The rest is my own.
 * 
 * This project uses JQuery for the Ajax API calls, and a JavaScript library called OriDomi that can fold DOM elements 
 * like paper for a visual element.
 */

// Wait until DOM is ready to register callbacks
$(function() {
   $("#countryBtn").click(countryBtnClick);
   $("#languageBtn").click(languageBtnClick);
   $("#currencyBtn").click(currencyBtnClick);
   $("#user-input").on("input", countryInput);
   showElement("welcome");

   // OriDomi is a JS library that allows DOM elements to be folded like paper
   // The user can click and drag to fold/unfold the element (the map in this case)
   let oriDomi = new OriDomi('#map-container', {
      vPanels: 6,
      ripple: true
   });
   oriDomi.accordion(20);
});

// Called when country input values change
function countryInput(e) {
   // Extract the text from country input that triggered the callback
   const country = $(`#user-input`).val().trim();
   
   // Only show error message if no country 
   if (country.length === 0) {
      showElement("value-error");
   }
   else {
      hideElement("value-error");
   }
}

// search by country button is clicked
function countryBtnClick() {
   // Get user input
   const country = $("#user-input").val().trim();

   // Show error messages if country fields left blank
   if (country.length === 0) {
      showElement("value-error");
   }
   else {
      clear();

      // Fetch country info
      getCountryInfo(country);
   }
}


// search by language button is clicked
function languageBtnClick() {
   // Get user input
   const language = $("#user-input").val().trim();

   // Show error messages if country fields left blank
   if (language.length === 0) {
      showElement("value-error");
   }
   else {
      clear();

      // Fetch common language countries
      getCountriesByLang(language);
   }
}


// search by currency button is clicked
function currencyBtnClick() {
   // Get user input
   const currency = $("#user-input").val().trim().toLowerCase();

   // Show error messages if country fields left blank
   if (currency.length === 0) {
      showElement("value-error");
   }
   else {
      clear();

      // Fetch common currency countries
      getCountriesByCurrency(currency);
   }
}


// Request this city's forecast
function getWeatherForecast(city) {
   // Create a URL to access the web API
   const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
   const apiKey = "2d757bd7c26958aa76ff73af715cc919";
  
   // Make GET request to API for the given city's forecast   
   $.ajax({
      url: endpoint, 
      method: "GET",
      data: {q: city, units: "imperial", appid : apiKey},
      dataType: "json"      
   })
   .done(function(data) {
      displayForecast(data, city);
   })
   .fail(function() {
      displayError(city);
   });
}


function getCountryInfo(country) {
   const endpoint = "https://restcountries.com/v2/name/";
   const queryString = encodeURI(country);
   const url = `${endpoint}${queryString}`;

   // Make GET request to API for the country's information
   $.ajax({
      url: url, 
      method: "GET",
      dataType: "json"      
   })
   .done(function(data) {
      displayCountryInfo(data, country);
   })
   .fail(function() {
      displayError(country);
   });
}


function getCountriesByLang(language) {
   const endpoint = "https://restcountries.com/v3.1/lang/";
   const queryString = encodeURI(language);
   const url = `${endpoint}${queryString}`;

   // Make GET request to API for countries using this language 
   $.ajax({
      url: url, 
      method: "GET",
      dataType: "json"      
   })
   .done(function(data) {
      displayCountriesByLang(data, language);
   })
   .fail(function() {
      displayError(language);
   });
}


function getCountriesByCurrency(currency) {
   const endpoint = "https://restcountries.com/v3.1/currency/";
   const queryString = encodeURI(currency);
   const url = `${endpoint}${queryString}`;

   // Make GET request to API for countries using this currency
   $.ajax({
      url: url, 
      method: "GET",
      dataType: "json"      
   })
   .done(function(data) {
      displayCountriesByCurrency(data, currency);
   })
   .fail(function() {
      displayError(currency);
   });
}


// Display forecast received from JSON  
function displayForecast(data, city) {
   // Display results table
   showElement("forecast");
   showElement("results");

   const cityName = data.city.name;
   showText("capital-forecast", cityName);

   // Get 5 day forecast
   const forecast = getSummaryForecast(data.list);

   // Put forecast into the city's table
   let day = 1;
   for (const date in forecast) {
      // Only process the first 5 days
      if (day <= 5) {
         showText(`day${day}-name`, getDayName(date));
         showText(`day${day}-high`, Math.round(forecast[date].high) + "&deg;");
         showText(`day${day}-low`, Math.round(forecast[date].low) + "&deg;");
         showImage(`day${day}-image`, forecast[date].weather);
      }
      day++;
   }
}


// Display country info received from JSON  
function displayCountryInfo(data, country) {
      showElement('country-info');

      const name = data[0].name;
      const capital = data[0].capital;
      const region = data[0].subregion;
      const languages = data[0].languages;
      const currencies = data[0].currencies;
      let languageString = "<b>Languages:</b> ";
      let currencyString = "<b>Currencies:</b> ";
      showText('country-name', `<b>Country:</b> ${name}`);
      showText('country-region', `<b>Region:</b> ${region}`);
      showText('country-capital', `<b>Capital:</b> ${capital}`);
      let i = 0;
      languages.forEach(language => {
         languageString += language.name;
         if (i < languages.length - 1) {
            languageString += ", ";
         }
         i++;
      });
      let j = 0;
      currencies.forEach(currency => {
         currencyString += currency.name + " (" + currency.symbol + ")";
         if (j < currencies.length - 1) {
            currencyString += ", ";
         }
         j++;
      });
      showText('country-languages', languageString);
      showText('country-currencies', currencyString);

      getWeatherForecast(capital, "country");
}


// Display language data received from JSON  
function displayCountriesByLang(data, language) {

      showElement('language');
      const countries = data;
      let countriesString = "";
      let i = 0;
      countries.forEach(country => {
         countriesString += country.name.common;
         if (i < countries.length - 1) {
            countriesString += "<br>";
         }
         i++;
      });
      
      showText('language-participants', countriesString);
}


// Display currency data received from JSON  
function displayCountriesByCurrency(data, currency) {

   showElement('currency');
   const countries = data;
   let countriesString = "";
   let i = 0;
   countries.forEach(country => {
      countriesString += country.name.common;
      if (i < countries.length - 1) {
         countriesString += "<br>";
      }
      i++;
   });
   
   showText('currency-participants', countriesString);
}


function displayError(value) {
   // Display appropriate error message
   const errorId = "loading-error";
   showElement(errorId);
   showText(errorId, "Unable to load \"" + value + "\".");
}


// Return a map of objects that contain the high temp, low temp, and weather for the next 5 days
function getSummaryForecast(forecastList) {  
   // Map for storing high, low, weather
   const forecast = [];
   
   // Determine high and low for each day
   forecastList.forEach(function (item) {
      // Extract just the yyyy-mm-dd 
      const date = item.dt_txt.substr(0, 10);
      
      // Extract temperature
      const temp = item.main.temp;

     // Has this date been seen before?
      if (date in forecast) {         
         // Determine if the temperature is a new low or high
         if (temp < forecast[date].low) {
            forecast[date].low = temp;
         }
         if (temp > forecast[date].high) {
            forecast[date].high = temp;
         }
      }
      else {
         // Initialize new forecast
         const temps = {
            high: temp,
            low: temp,
            weather: item.weather[0].main
         };   
         
         // Add entry to map 
         forecast[date] = temps;
      }
   });
   
   return forecast;
}

// Convert date string into Mon, Tue, etc.
function getDayName(dateStr) {
   const date = new Date(dateStr);
   return date.toLocaleDateString("en-US", { weekday: 'short', timeZone: 'UTC' });
}

// Clear screen
function clear() {
   hideElement("welcome");
   hideElement("forecast");
   hideElement("loading-error");
   hideElement("results");
   hideElement("country-info");
   hideElement("language");
   hideElement("currency");
}

// Show the element
function showElement(elementId) {
   $(`#${elementId}`).show();
}

// Hide the element
function hideElement(elementId) {
   $(`#${elementId}`).hide();
}

// Display the text in the element
function showText(elementId, text) {
   $(`#${elementId}`).html(text);
}

// Show the weather image that matches the weatherType
function showImage(elementId, weatherType) {   
   // Images for various weather types
   const weatherImages = {
      Clear: "clear.png",
      Clouds: "clouds.png",
      Drizzle: "drizzle.png",
      Mist: "mist.png",
      Rain: "rain.png",
      Snow: "snow.png"
   };

   const imgUrl = "https://static-resources.zybooks.com/static/";
   $(`#${elementId}`).attr({
      src: imgUrl + weatherImages[weatherType],
      alt: weatherType
   });
}
