// Evaluador aritmético mínimo para la calculadora de montos.
// Hermes (el motor JS de React Native) no soporta eval()/new Function(), así
// que en vez del `Function('return (' + exp + ')')` de la versión web usamos
// un parser recursivo simple: soporta + - * / ( ) y decimales.

class CalcError extends Error {}

export function evaluateExpression(source: string): number {
  const clean = source.trim();
  if (!clean) return 0;
  if (!/^[0-9+\-.*/() ]+$/.test(clean)) throw new CalcError('invalid');

  let i = 0;

  function peek(): string {
    return clean[i];
  }

  function parseExpr(): number {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = clean[i++];
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const op = clean[i++];
      const rhs = parseUnary();
      if (op === '/') {
        if (rhs === 0) throw new CalcError('div0');
        value = value / rhs;
      } else {
        value = value * rhs;
      }
    }
    return value;
  }

  function parseUnary(): number {
    skipSpaces();
    if (peek() === '-') {
      i++;
      return -parseUnary();
    }
    if (peek() === '+') {
      i++;
      return parseUnary();
    }
    return parseFactor();
  }

  function parseFactor(): number {
    skipSpaces();
    if (peek() === '(') {
      i++;
      const value = parseExpr();
      skipSpaces();
      if (peek() !== ')') throw new CalcError('paren');
      i++;
      skipSpaces();
      return value;
    }
    const start = i;
    while (i < clean.length && /[0-9.]/.test(clean[i])) i++;
    if (start === i) throw new CalcError('number');
    const num = Number(clean.slice(start, i));
    if (!Number.isFinite(num)) throw new CalcError('number');
    skipSpaces();
    return num;
  }

  function skipSpaces() {
    while (clean[i] === ' ') i++;
  }

  skipSpaces();
  const result = parseExpr();
  skipSpaces();
  if (i !== clean.length) throw new CalcError('trailing');
  return result;
}

export function safeEvaluate(expression: string): number | null {
  try {
    const value = evaluateExpression(expression || '0');
    return Number.isFinite(value) ? Math.round(value * 100) / 100 : null;
  } catch {
    return null;
  }
}
