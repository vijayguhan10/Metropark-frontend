

export function toLocalDateTime(date = new Date()) {
  const p = (n, len = 2) => String(n).padStart(len, '0');
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`
  );
}
