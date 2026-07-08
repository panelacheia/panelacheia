"use client";

import { useState } from "react";
import { buscarCep } from "@/lib/viacep";
import { formatCepBR } from "@/lib/format/cep";

export type EnderecoEntrega = {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string;
};

export function AddressForm({
  value,
  onChange,
}: {
  value: EnderecoEntrega;
  onChange: (value: EnderecoEntrega) => void;
}) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [cepNaoEncontrado, setCepNaoEncontrado] = useState(false);

  async function handleCepChange(rawCep: string) {
    const cep = formatCepBR(rawCep);
    onChange({ ...value, cep });
    setCepNaoEncontrado(false);

    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    setBuscandoCep(true);
    const resultado = await buscarCep(digits);
    setBuscandoCep(false);

    if (!resultado) {
      setCepNaoEncontrado(true);
      return;
    }

    onChange({
      ...value,
      cep,
      street: resultado.logradouro || value.street,
      neighborhood: resultado.bairro || value.neighborhood,
      city: resultado.localidade,
      state: resultado.uf,
    });
  }

  const inputClass =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">CEP</label>
        <input
          className={inputClass}
          value={value.cep}
          onChange={(e) => handleCepChange(e.target.value)}
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
        />
        {buscandoCep && <p className="mt-1 text-xs text-neutral-400">Buscando endereço...</p>}
        {cepNaoEncontrado && (
          <p className="mt-1 text-xs text-brand-secondary">
            Não encontramos esse CEP automaticamente. Preencha o endereço manualmente abaixo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Rua</label>
          <input
            className={inputClass}
            value={value.street}
            onChange={(e) => onChange({ ...value, street: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">Número</label>
          <input
            className={inputClass}
            value={value.number}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Complemento (opcional)</label>
        <input
          className={inputClass}
          value={value.complement}
          onChange={(e) => onChange({ ...value, complement: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Bairro</label>
          <input
            className={inputClass}
            value={value.neighborhood}
            onChange={(e) => onChange({ ...value, neighborhood: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">UF</label>
          <input
            className={inputClass}
            value={value.state}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600">Cidade</label>
        <input
          className={inputClass}
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        />
      </div>
    </div>
  );
}
