import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Coordenadas de Curicó
    const curicoCoords: L.LatLngExpression = [-34.985, -71.239];

    const map = L.map('map').setView(curicoCoords, 11);

    // Tile layer de OpenStreetMap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      minZoom: 8
    }).addTo(map);

    // Marcador en Curicó
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Agregar marcador principal
    L.marker(curicoCoords, { icon })
      .addTo(map)
      .bindPopup('<b>RemateZone</b><br>Curicó, Región del Maule<br>📍 Zona de reparto')
      .openPopup();

    // Dibujar un círculo que representa la zona de reparto (radio ~30km)
    L.circle(curicoCoords, {
      color: '#ffd700',
      fillColor: '#ffd700',
      fillOpacity: 0.1,
      radius: 30000 // 30 kilómetros
    }).addTo(map);
  }
}
