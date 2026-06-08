export function formatarData(data: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(data);
}

export function formatarMesAno(data: Date) {
  const texto = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function ehMesmaData(dataA: Date, dataB: Date) {
  return (
    dataA.getDate() === dataB.getDate() &&
    dataA.getMonth() === dataB.getMonth() &&
    dataA.getFullYear() === dataB.getFullYear()
  );
}

export function converterDataTexto(valor: string) {
  const partes = valor.split('/');

  if (partes.length !== 3) {
    return null;
  }

  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);
  const data = new Date(ano, mes, dia);

  return Number.isFinite(data.getTime()) ? data : null;
}
