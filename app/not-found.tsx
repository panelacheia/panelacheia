import Link from "next/link";
import { ShoppingBasket, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <ShoppingBasket size={36} aria-hidden />
      </div>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-brand-secondary">
        Erro 404
      </p>
      <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
        Essa página saiu da prateleira
      </h1>
      <p className="mt-3 max-w-md text-neutral-500">
        Não encontramos o que você procura. O link pode estar errado ou a página não existe mais.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-primary-dark"
      >
        <Home size={16} aria-hidden />
        Voltar para a loja
      </Link>
    </div>
  );
}
