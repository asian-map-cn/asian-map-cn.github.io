function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 13)];
  }
  return color;
}

function chooseColor(level) {
  return COLOR_PALETE[level]
}


COLOR_PALETE = {
  "1": "#FFEC16",
  "2": "#f9aa0f",
  "3": "#bf800f",
  "4": "#935f0f",
  "5": "#853704",
}

LEVEL_LEGEND = {
  "1": "0 to 1,000",
  "2": "1,001 to 2,000",
  "3": "2,001 to 5,000",
  "4": "5,001 to 10,000",
  "5": "10,001+",
}


let map;
let infowindow;

function getLevel(populationNumber) {
  if(populationNumber <= 1000){
    return 1
  }
  else if(populationNumber <= 2000){
    return 2
  }
  else if(populationNumber <= 5000){
    return 3
  }
  else if(populationNumber <= 10000){
    return 4
  }
  else{
    return 5
  }
}

function showInfo(position, data) {
  const names = new Set(["Geography","U.S. Representative","Party","Asian Total","Chinese"])


  let content = data.filter((x)=>{
    if(names.has(x.name )){
      return true
    }
  }).map(x => `<span style="font-weight: 900">${x.name}:</span> <span>${x.value}</span>`).join("<br>")
  infowindow.setContent(`<div >${content}</div>`)
  infowindow.setPosition(position)
  infowindow.open(map)
}


function initLegend() {
  const legend = document.createElement("div")
  legend.style.padding = "1rem"
  legend.style.margin = "1rem"
  legend.style.border = "1px solid black"
  legend.style.background = "white"
  // legend.style.height = "6rem"

  title = document.createElement("h2")
  title.innerHTML = "Chinese American Population (2010 Census)"
  legend.appendChild(title)

  for (let level of Object.keys(COLOR_PALETE)) {
    const color = COLOR_PALETE[level]
    const legendText = LEVEL_LEGEND[level]

    const row = document.createElement("div")

    row.innerHTML = `<span style="background-color: ${color};width: 1.5rem;height: 1rem;display:inline-block;margin-right: 0.5rem"></span> <span >${legendText}</span>`
    legend.appendChild(row)
  }
  document.body.appendChild(legend)
  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
}

async function initMap() {

  const districtData = await (await fetch("geo_all_data.json")).json()
  // console.log(districtData);


  infowindow = new google.maps.InfoWindow()

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 38.2101854, lng: -98.7250281},
    zoom: 4.9,
    mapTypeControl: false,
    streetViewControl: false,
    rotateControl: false,
  });

  // populate the data
  for (let district of districtData) {
    const chinesePopulation = Number(district.data.filter(x=>x.name == "Chinese")[0].value.replace(",",""))
    const level = getLevel(chinesePopulation)
    console.log(level);
    const color = chooseColor(level)
    switch (district.type) {
      case "Polygon":
        const region = new google.maps.Polygon({
          paths: district.coordinates,
          strokeColor: '#515151',
          strokeOpacity: 0.8,
          strokeWeight: 1,
          fillColor: color,
          fillOpacity: 0.5
        });
        region.setMap(map);
        const state = {
          color
        }
        region.addListener("click", (event) => {
          showInfo(event.latLng, district.data)
        })

        break
      case "MultiPolygon":
        for (let coords of district.coordinates) {
          const region = new google.maps.Polygon({
            paths: coords,
            strokeColor: '#515151',
            strokeOpacity: 0.8,
            strokeWeight: 1,
            fillColor: color,
            fillOpacity: 0.5
          });
          region.setMap(map);
          region.addListener("click", (event) => {
            showInfo(event.latLng, district.data)
          })
        }
        break
      default:

    }
  }

  initLegend()

}

// initMap()
