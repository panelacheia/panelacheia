import { Wrench } from "lucide-react";

export function MaintenanceScreen() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <Wrench size={36} aria-hidden />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-foreground sm:text-3xl">
        Estamos atualizando os produtos
      </h1>
      <p className="mt-3 text-neutral-500">
        Voltamos em instantes. Tente novamente em alguns minutos.
      </p>
    </div>
  );
}
