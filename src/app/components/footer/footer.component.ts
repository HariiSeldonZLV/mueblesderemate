import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private map: any;
  private isMapInitialized = false;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngAfterViewInit(): void {
    // Solo ejecutar en el navegador, no en SSR (Server Side Rendering)
    if (isPlatformBrowser(this.platformId)) {
      // Pequeño delay para asegurar que el DOM está listo
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Limpiar el mapa al destruir el componente
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Verificar que el elemento existe
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.warn('Elemento #map no encontrado');
      return;
    }

    // Evitar inicializar múltiples veces
    if (this.isMapInitialized) {
      return;
    }

    try {
      // Coordenadas de Curicó
      const curicoCoords: L.LatLngExpression = [-34.985, -71.239];

      this.map = L.map('map').setView(curicoCoords, 11);

      // Tile layer de OpenStreetMap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
        minZoom: 8
      }).addTo(this.map);

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
        .addTo(this.map)
        .bindPopup('<b>RemateZone</b><br>Curicó, Región del Maule<br>📍 Zona de reparto')
        .openPopup();

      // Dibujar un círculo que representa la zona de reparto (radio ~30km)
      L.circle(curicoCoords, {
        color: '#ffd700',
        fillColor: '#ffd700',
        fillOpacity: 0.1,
        radius: 30000 // 30 kilómetros
      }).addTo(this.map);

      this.isMapInitialized = true;

      // Forzar actualización del tamaño del mapa después de un breve momento
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      }, 200);
    } catch (error) {
      console.error('Error al inicializar el mapa:', error);
    }
  }
}
