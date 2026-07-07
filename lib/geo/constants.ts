// Coordenadas da loja, geocodificadas uma única vez (R. Silva Jardim, 21-31,
// Jardim Vânia Maria, Bauru - SP, 17063-090). Não geocodificar a loja a cada pedido.
export const STORE_COORDS = {
  lat: -22.3111271,
  lng: -49.0947022,
};

// Distância em linha reta (Haversine) subestima a distância real de rota nas ruas.
// 1.3x é uma aproximação comum para malha urbana sem precisar de API de rotas paga.
export const ROAD_DISTANCE_FACTOR = 1.3;
