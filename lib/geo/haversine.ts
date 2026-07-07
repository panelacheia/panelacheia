import { ROAD_DISTANCE_FACTOR, STORE_COORDS } from "./constants";

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Distância em linha reta (km) entre dois pontos lat/lng.
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371; // raio da Terra em km
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

// Distância aproximada de rota entre a loja e um ponto do cliente, aplicando o
// fator de correção (linha reta subestima a distância real de rua).
export function distanciaAteALojaKm(destino: { lat: number; lng: number }): number {
  const linhaReta = haversineKm(STORE_COORDS, destino);
  return linhaReta * ROAD_DISTANCE_FACTOR;
}
