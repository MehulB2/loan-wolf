export const formatCurrency = (n: number): string => {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);
  return n < 0 ? `-${formatted}` : formatted;
};

export const formatPercent = (n: number, decimals = 1): string => {
  return `${(n * 100).toFixed(decimals)}%`;
};

export const formatNumber = (n: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
};
