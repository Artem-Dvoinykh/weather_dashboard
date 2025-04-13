sessionStorage.setItem("myTown", "noTown");

setButtons();

function setButtons() {
    document.getElementById("myTown").addEventListener("keydown", event => {
        if (event.key == "Enter") search();
    });
    document.getElementById("getLocation").addEventListener("click", geoLocate);
}

async function search() {
    const city = document.getElementById("myTown").value;
    const apiKey = '7b04ffc689dacb6527a673bae9a5275e';
    let lat, lon;

    // fetch the coordinates of the city
    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
    const geoData = await geoRes.json();
    if (geoData.length == 0) console.error("City not found");
    else {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
    }

    sessionStorage.setItem("lat", lat);
    sessionStorage.setItem("lon", lon);
    sessionStorage.setItem("myTown", city);
    window.location.href = "dashboard.html";
}

function geoLocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
    } else {
        console.log("Geolocation not supported by this browser.");
        alert("Geolocation not supported by this browser.");
    }
}
  
function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    sessionStorage.setItem("lat", lat);
    sessionStorage.setItem("lon", lon);
    window.location.href = "dashboard.html";
}

function errorCallback(error) {
    console.error("Geolocation error:", error.message);
    alert("Geolocation error:", error.message);
}