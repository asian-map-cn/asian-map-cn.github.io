const fs = require('fs')


function geojson_to_googlemap(coords) {
  return coords.map(polygon => {
    return polygon.map(point => {
      return {
        lat: point[1],
        lng: point[0]
      }
    })
  })
}

function parseGeoJson(rawData) {
  const features = rawData["features"]
  return features.map(district => {

    const result = {
      id:district.properties.GEO_ID.substring(district.properties.GEO_ID.length - 4),
      state: district.properties.STATE,
      districtId: district.properties.CD,
      type: district.geometry.type
    }
    if (result.type === "Polygon") {
      result.coordinates = geojson_to_googlemap(district.geometry.coordinates)
    } else if (result.type === "MultiPolygon") {
      result.coordinates = district.geometry.coordinates.map(coords => geojson_to_googlemap(coords))
    }

    return result
  })
}


data = JSON.parse(fs.readFileSync("/Users/zhendongwang/Documents/projects/enterprise/iddpp-asian-map/aisan-map-frontend/congressional_data.json"))
fs.writeFileSync("/Users/zhendongwang/Documents/projects/enterprise/iddpp-asian-map/aisan-map-frontend/population_map/geo_data.json",JSON.stringify(parseGeoJson(data)))
