import { NextRequest, NextResponse } from "next/server";
import { geocodeEndereco } from "@/lib/geo/nominatim";
import { distanciaAteALojaKm } from "@/lib/geo/haversine";
import { calcularTaxaEntrega } from "@/lib/orders/fees";

export async function POST(req: NextRequest) {
  const { street, number, city, state, cep } = (await req.json()) as {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    cep?: string;
  };

  if (!street || !number || !city || !state) {
    return NextResponse.json({ error: "Endereço incompleto." }, { status: 400 });
  }

  const coords = await geocodeEndereco(`${street}, ${number}, ${city}, ${state}, ${cep ?? ""}, Brasil`);

  if (!coords) {
    return NextResponse.json({
      feeCents: calcularTaxaEntrega(Infinity),
      distanceKm: null,
      geocoded: false,
    });
  }

  const distanceKm = distanciaAteALojaKm(coords);
  const feeCents = calcularTaxaEntrega(distanceKm);

  return NextResponse.json({ feeCents, distanceKm, geocoded: true });
}
