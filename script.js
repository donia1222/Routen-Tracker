var map;
var marker;
var distance = 0;
var startTime;
var timer;
var firstUpdate = true;
var startPosition;
var routeLine;
var routeCoordinates = [];
var isPaused = false;
var accumulatedTime = 0;
var hasFinished = false;
var weight = 75; // Peso del usuario en kilogramos
var MET = 7.5; // Gasto energético metabólico para bicicleta a 15 km/h (7.5 METs)
var isTracking = false;

function initMap() {
  // Inicializar el mapa con la ubicación actual del usuario
  navigator.geolocation.getCurrentPosition(function(position) {
    var myLatLng = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    map = new google.maps.Map(document.getElementById("map"), {
      center: myLatLng,
      zoom: 20
    });
    marker = new google.maps.Marker({
      position: myLatLng,
      map: map
    });
    startPosition = myLatLng;

    // Cargar el historial de rutas
    loadHistory();
  });
}

function startRide() {
  if (hasFinished) {
    hasFinished = false;
    firstUpdate = true;
    routeLine = null;
    accumulatedTime = 0;
  }

  if (!timer) {
    // Iniciar el contador de tiempo y distancia
    if (!isPaused) {
      distance = 0;
      startTime = new Date().getTime();
      totalCalories = 0;
      previousLatLng = null;
    } else {
      startTime = new Date().getTime() - accumulatedTime;
    }

    isPaused = false;

    // Iniciar el contador de tiempo
    timer = setInterval(function () {
      var currentTime = new Date().getTime();
      var elapsedTime = currentTime - startTime;
      hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
      document.getElementById("stats").innerHTML = "Distanz: " + (distance / 1000).toFixed(2) + " km<br>Zeit: " + hours + " Std " + minutes + " m " + seconds + " s<br> ";
    }, 1000);
  }
  // Registrar la ubicación del usuario cada vez que se mueve
  navigator.geolocation.watchPosition(
    function (position) {
      if (isPaused) return;

      var currentLatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      // Verificar si el usuario se está moviendo
      if (previousLatLng) {
        var distanceMoved = google.maps.geometry.spherical.computeDistanceBetween(previousLatLng, currentLatLng);
        var timeElapsed = (new Date().getTime() - previousUpdateTime) / 1000;
        var speed = distanceMoved / timeElapsed; // Calcular la velocidad en metros por segundo
        const minDistanceMoved = 5; // Distancia mínima en metros para actualizar la posición
        if (speed >= 0.5 && distanceMoved >= minDistanceMoved) {
          totalCalories += calculateCalories(distanceMoved, position.coords.altitude);
        }
        distance += distanceMoved;
      }
      previousLatLng = currentLatLng;
      previousUpdateTime = new Date().getTime();

      marker.setPosition(currentLatLng);
      if (firstUpdate) {
        map.setCenter(currentLatLng);
        firstUpdate = false;
      } else {
        map.panTo(currentLatLng);
      }
      var path = [startPosition, currentLatLng];
      if (!routeLine) {
        // Crear la línea de la ruta
        routeCoordinates.push(currentLatLng);
        routeLine = new google.maps.Polyline({
          path: routeCoordinates,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2,
        });
        routeLine.setMap(map);
      } else {
        var newPath = routeLine.getPath();
        newPath.push(currentLatLng);
        routeLine.setPath(newPath);
      }
    },
    function (error) {
      console.log("Error al obtener posición: " + error.message);
    },
    { enableHighAccuracy: true,
 maximumAge: 0 }
  );
}

function togglePauseRide() {
  if (isPaused) {
    // Reanudar
    isPaused = false;
    startTime = new Date().getTime() - accumulatedTime;
    timer = setInterval(function () {
      var currentTime = new Date().getTime();
      var elapsedTime = currentTime - startTime;
      hours = Math.floor(elapsedTime / (1000 * 60 * 60));
      minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
      document.getElementById("stats").innerHTML = "Distanz: " + (distance / 1000).toFixed(2) + " km<br>Zeit: " + hours + " Std " + minutes + " m " + seconds + "s";
    }, 1000);
    navigator.geolocation.watchPosition(
      function (position) {
        if (isPaused) return;
        // Resto del código para actualizar la posición del usuario
      },
      function (error) {
        console.log("Error al obtener posición: " + error.message);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    document.getElementById("pause-btn").innerHTML = "Pause";
  } else {
    // Pausar
    isPaused = true;
    clearInterval(timer);
    accumulatedTime = new Date().getTime() - startTime;
    document.getElementById("pause-btn").innerHTML = isPaused ? "Fortsetzen" : "Pause";
  }
}

function stopRide() {
  // Detener el contador de tiempo y distancia
  clearInterval(timer);
  var endTime = new Date().getTime();
  var elapsedTime = endTime - startTime;
  var hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  var minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
  var distanceStr = (distance / 1000).toFixed(2) + " km";
  var timeStr = hours + " Std " + minutes + " m " + seconds + " s";

  // Calcular las calorías quemadas
  const caloriesPerKm = 50; // Número de calorías quemadas por km
  var caloriesBurned = (distance / 1000) * caloriesPerKm;

  // Crear la notificación
  var notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = "<span class='distance'>" + distanceStr + "</span><br><span class='time'>" + timeStr + "</span><br><span class='calories'>" + caloriesBurned.toFixed(2) + " Kalorien verbrannt</span>";

  // Agregar la notificación a la página
  document.body.appendChild(notification);

  // Esperar 3 segundos y luego recargar la página
  setTimeout(function() {
    location.reload();
  }, 3000);

  // Reiniciar el contador de distancia y la ruta trazada
  distance = 0;
  routeCoordinates = [];

  // Llamar a la función que envía el correo electrónico
if (confirm("Wenn Sie Ihre Route in der App teilen möchten, drücken Sie bitte auf 'Ok' und senden Sie uns eine E-Mail mit den erfassten Daten. Innerhalb von maximal 24 Stunden wird die Route in der App sichtbar sein")) {
  // Obtener las direcciones de inicio y fin de la ruta
// Llamar a la función que envía el correo electrónico
// if (confirm("Wenn Sie Ihre Route in der App teilen möchten, drücken Sie bitte auf 'Akzeptieren' und senden Sie uns eine E-Mail mit den erfassten Daten. Innerhalb von maximal 24 Stunden wird die Route in der App sichtbar sein")) {
  // Obtener las direcciones de inicio y fin de la ruta
  getAddress(startPosition.lat, startPosition.lng, function (startAddress) {
    getAddress(marker.getPosition().lat(), marker.getPosition().lng(), function (endAddress) {
      // Crear el objeto con los datos de la ruta
      var routeData = {
        distanceStr: distanceStr,
        timeStr: timeStr,
        caloriesBurned: caloriesBurned,
        startAddress: startAddress,
        endAddress: endAddress
      };

      // Llamar a la función que envía el correo electrónico
      sendEmail("info@hundezonen.ch", "Neue Route hinzufügen", routeData);
    });
  });
 
}

  hasFinished = true;
}

function sendEmail(email, subject, routeData) {
  var name = prompt("Bitte geben Sie Ihren Namen ein:", "");
  var emailBody = "Name: " + name + "\nDistanz: " + routeData.distanceStr + "\nZeit: " + routeData.timeStr + "\nKalorien: " + routeData.caloriesBurned.toFixed(2) + "\nStart: " + routeData.startAddress + "\nEnde: " + routeData.endAddress + "\nDatum: " + new Date().toLocaleDateString();
  
  window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(emailBody);
}

function getAddress(lat, lng, callback) {
  var geocoder = new google.maps.Geocoder();
  var latLng = new google.maps.LatLng(lat, lng);
  geocoder.geocode({ 'latLng': latLng }, function (results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      if (results[0]) {
        callback(results[0].formatted_address);
      } else {
        callback("Dirección no encontrada");
      }
    } else {
      callback("Error en la geocodificación: " + status);
    }
  });
}

function updateHistory() {
  var history = JSON.parse(localStorage.getItem("history")) || [];
  var table = document.createElement("table");
  var headerRow = document.createElement("tr");
  var distanceHeader = document.createElement("th");
  distanceHeader.textContent = "Distanz";
  var timeHeader = document.createElement("th");
  timeHeader.textContent = "Zeit";
  var dateHeader = document.createElement("th");
  dateHeader.textContent = "Datum";
  var caloriesHeader = document.createElement("th");
  caloriesHeader.textContent = "Kalorien";
  var startAddressHeader = document.createElement("th");
  startAddressHeader.textContent = "Ort und Straße (Abfahrt)";
  var endAddressHeader = document.createElement("th");
  endAddressHeader.textContent = "Ort und Straße (Ankunft)";
  var showRouteHeader = document.createElement("th");
  showRouteHeader.textContent = "Routenansicht";
  headerRow.appendChild(distanceHeader);
  headerRow.appendChild(timeHeader);
  headerRow.appendChild(dateHeader);
  headerRow.appendChild(caloriesHeader);
  headerRow.appendChild(startAddressHeader);
  headerRow.appendChild(endAddressHeader);
  headerRow.appendChild(showRouteHeader);
  table.appendChild(headerRow);

  for (var i = history.length - 1; i >= 0; i--) {
    var route = history[i];
    var row = document.createElement("tr");
    var distanceCell = document.createElement("td");
    distanceCell.textContent = route.Distanz;
    var timeCell = document.createElement("td");
    timeCell.textContent = route.Zeit;
    var dateCell = document.createElement("td");
    dateCell.textContent = route.date;
    var caloriesCell = document.createElement("td");
    caloriesCell.textContent = route.Kalori;
    var startAddressCell = document.createElement("td");
    startAddressCell.textContent = route.startAddress;
    var endAddressCell = document.createElement("td");
    endAddressCell.textContent = route.endAddress;
    var showRouteCell = document.createElement("td");
    var showRouteLink = document.createElement("a");
    showRouteLink.href = "javascript:void(0);";
    showRouteLink.textContent = "Anzeigen";
    showRouteLink.onclick = (function(route) {
      return function() {
        map.setCenter(route.start);
        map.setZoom(20);
        var path = [route.start, route.end];
        var routeLine = new google.maps.Polyline({
          path: path,
          strokeColor: "#FF0000",
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        routeLine.setMap(map);
        scrollToMap();
      };
    })(route);
    showRouteCell.appendChild(showRouteLink);
    row.appendChild(distanceCell);
    row.appendChild(timeCell);
    row.appendChild(dateCell);
    row.appendChild(caloriesCell);
    row.appendChild(startAddressCell);
    row.appendChild(endAddressCell);
    row.appendChild(showRouteCell);
    table.appendChild(row);
  }

  var historyContainer = document.getElementById("history");
  while (historyContainer.firstChild) {
    historyContainer.removeChild(historyContainer.firstChild);
  }
  historyContainer.appendChild(table);
}

function scrollToMap() {
  document.getElementById("map").scrollIntoView({ behavior: "smooth" });
}
function scrollToHistory() {
  var historyElement = document.getElementById("history");
  historyElement.scrollIntoView({ behavior: "smooth" });
}

function loadRoutes() {
  // Cargar las rutas guardadas del local storage y mostrarlas en el mapa
  var routes = JSON.parse(localStorage.getItem("routes")) || [];
  for (var i = 0; i < routes.length; i++) {
    var routeLine = new google.maps.Polyline({
      path: routes[i].path,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    routeLine.setMap(map);
  }
}

window.onload = function() {
  initMap();
  loadRoutes();
  updateHistory();
};

function clearHistory() {
  localStorage.removeItem("history");
  updateHistory();
}

window.onload = function() {
  initMap();
  loadRoutes();
  updateHistory();

  // Agregar evento onclick al botón de borrar historial
  var clearHistoryBtn = document.getElementById("clear-history-btn");
  clearHistoryBtn.onclick = clearHistory;
};


