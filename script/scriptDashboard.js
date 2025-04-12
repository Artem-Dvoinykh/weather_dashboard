let weatherAllData = [];
let weatherCurData = [];
let uviData = [];
let uviCurData = [];

setButtons();
loadTheWeather();

function setButtons() {
    // set actions to the buttons
    document.getElementById("backToMainButton").addEventListener("click", backToMainPage);

    document.getElementById("day0").addEventListener("click", () => setCurDay(0));
    document.getElementById("day1").addEventListener("click", () => setCurDay(1));
    document.getElementById("day2").addEventListener("click", () => setCurDay(2));
    document.getElementById("day3").addEventListener("click", () => setCurDay(3));
    document.getElementById("day4").addEventListener("click", () => setCurDay(4));

    document.getElementById("general").addEventListener("click", setWeatherTypeGeneral);
    document.getElementById("temp").addEventListener("click", setWeatherTypeTemp);
    document.getElementById("rain").addEventListener("click", setWeatherTypeRain);
    document.getElementById("sun").addEventListener("click", setWeatherTypeSun);
    
    // set labels to the "days of the week" buttons
    const today = new Date();
    const todayId = today.getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    days[todayId] = 'Today';
    for (let i = 0; i < 5; i++) {
        document.getElementById(`day${i}`).innerText = days[(todayId + i) % 7];
    }
}

// setWeaterType functions cahnge the spaceForInfo space to display need info
function setWeatherTypeGeneral() {
    setInfoButtonsToWhite();
    setButtonTo("text-yellow-500", "general");
    let surface = document.getElementById("spaceForInfo");
    surface.innerText = weatherCurData[0].weather[0].description;
}

function setWeatherTypeTemp() {
    setInfoButtonsToWhite();
    setButtonTo("text-yellow-500", "temp");
    let listY = weatherCurData.map(el => Math.floor(el.main.temp - 273.15));
    let listX = weatherCurData.map(el => {
        const israelDateString = new Date(el.dt * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
        const israelDate = new Date(israelDateString);
        return israelDate.getHours() + ":00";
    })

    drawGraph(listX, listY, 'Temperature (°C)');
}

function setWeatherTypeRain() {
    setInfoButtonsToWhite();
    setButtonTo("text-yellow-500", "rain");
    let listY = weatherCurData.map(el => Math.floor(el.pop * 100));
    let listX = weatherCurData.map(el => {
        const israelDateString = new Date(el.dt * 1000).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
        const israelDate = new Date(israelDateString);
        return israelDate.getHours() + ":00";
    })

    drawGraph(listX, listY, 'rain chance %');
}

function setWeatherTypeSun() {
    setInfoButtonsToWhite();
    setButtonTo("text-yellow-500", "sun");
    let listY = uviCurData.map(el => Math.floor(el.uv));
    let listX = uviCurData.map(el => {
        const israelDateString = new Date(el.uv_time).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
        const israelDate = new Date(israelDateString);
        return israelDate.getHours() + ":00";
    })

    if (uviCurData.length == 0) {
        document.getElementById('spaceForInfo').innerHTML= 'not available';
    }
    else {
        drawGraph(listX, listY, 'uv index (0-10)');
    }
}

// draw a graph at the spaceForInfo div element
function drawGraph(listX, listY, label) {
    document.getElementById('spaceForInfo').innerHTML = '<canvas id="myChart" width="800" height="400"></canvas>';
    const ctx = document.getElementById('myChart').getContext('2d');
    const height = Math.max(2, Math.max(...listY));

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: listX,
          datasets: [{
            label: label,
            data: listY,
            borderColor: '#facc15', // Tailwind yellow-400
            backgroundColor: 'rgba(250, 204, 21, 0.1)', // Light yellow fill
            tension: 0.4,
            pointRadius: 0, // Hide points
            fill: true,
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { 
                display: true ,
                labels: {
                    padding: 0,
                    font: {
                        family: 'Rubik Dirt',
                        size: 20
                    }
                }
            },
            tooltip: {
              enabled: false
            },
            datalabels: {
              color: 'rgb(255, 255, 255)',
              anchor: 'end',
              align: 'top',
              font: {
                weight: 'bold',
                size: 18
              },
              formatter: value => value
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'white',
                font: {
                    size: 14,
                    weight: 'bold'
                }
              },
              grid: { display: false }
            },
            y: {
              display: false,
              grid: { display: false },
              beginAtZero: true,
              max: height + Math.floor(height / 3)
            }
          }
        },
        plugins: [ChartDataLabels]
    });
}

// set a day the user is interested in. Also sets the weatherCurData global variable
function setCurDay(dayNumb) {
    setInfoButtonsToWhite();
    setDayButtonsToWhite();
    setButtonTo("text-yellow-500", `day${dayNumb}`);
    const realNow = new Date();
    let curDay = new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate() + dayNumb, 0, 0, 0);
    let nextDay = new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate() + dayNumb + 1, 0, 0, 0);

    weatherCurData = weatherAllData.filter(ind => ind.dt * 1000 >= curDay.getTime() && ind.dt * 1000 <= nextDay.getTime());

    uviCurData = []
    if (dayNumb == 0) uviCurData = uviData.filter(ind => {
        let tm = new Date(ind.uv_time);
        return tm.getTime() >= curDay.getTime() && tm.getTime() <= nextDay.getTime();
    })

    setWeatherTypeTemp();
}

function setHeader() {
    const myTown = sessionStorage.getItem("myTown");
    document.getElementById("townHeader").innerText = myTown;
}

async function loadTheWeather() {
    let apiKey = '7b04ffc689dacb6527a673bae9a5275e';
    //const city = sessionStorage.getItem("myTown");
    let lat = sessionStorage.getItem("lat");
    let lon = sessionStorage.getItem("lon");

    // fetch the weather forecast
    const weatherRes = await fetch(`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const weatherData = await weatherRes.json();
    if (weatherData.cod !== "200") console.error("weather not found");
    else weatherAllData = weatherData.list;
    
    if (sessionStorage.getItem("myTown") == "noTown") {
        sessionStorage.setItem("myTown", weatherData.city.name)
    }

    // fetch the uvi data
    apiKey = "openuv-3ymkuncrm9cxziff-io";
    var myHeaders = new Headers();
    myHeaders.append("x-access-token", "openuv-3ymkuncrm9cxziff-io");
    myHeaders.append("Content-Type", "application/json");

    var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
    };

    const uviRes = await fetch(`https://api.openuv.io/api/v1/forecast?lat=${lat}&lng=${lon}`, requestOptions);
    const uviDataJson = await uviRes.json();
    if (uviDataJson.error) console.error("uvi data not found");
    else uviData = uviDataJson.result;

    // set the relevant to the user day to today
    setHeader();
    setCurDay(0);
}

// go back to the main page
function backToMainPage() {
    sessionStorage.setItem("myTown", "noTown");
    window.location.href = "index.html";
}

function setButtonTo(color, id) {
    const el = document.getElementById(id);
    el.className = el.className.replace(/\btext-[a-z]+-\d+\b/g, "");
    el.classList.add(color);
}

function setDayButtonsToWhite() {
    for (let i = 0; i < 5; i++) {
        setButtonTo("text-white", `day${i}`);
    }
}

function setInfoButtonsToWhite() {
    setButtonTo("text-white", "general");
    setButtonTo("text-white", "temp");
    setButtonTo("text-white", "rain");
    setButtonTo("text-white", "sun");
}