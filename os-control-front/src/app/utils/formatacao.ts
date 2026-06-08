export function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function converterMoedaParaNumero(valor: string | number) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null;
  }

  const texto = valor.trim().replace(/[R$\s]/g, '');

  if (!texto) {
    return null;
  }

  const normalizado = texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto;
  const numero = Number(normalizado);

  return Number.isFinite(numero) ? numero : null;
}

export function formatarCpf(valor: string) {
  const numeros = (valor ?? '').replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 3) {
    return numeros;
  }

  if (numeros.length <= 6) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
  }

  if (numeros.length <= 9) {
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
  }

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

export function formatarTelefone(valor: string) {
  const numeros = (valor ?? '').replace(/\D/g, '').slice(0, 11);

  if (numeros.length <= 2) {
    return numeros ? `(${numeros}` : '';
  }

  if (numeros.length <= 6) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}
