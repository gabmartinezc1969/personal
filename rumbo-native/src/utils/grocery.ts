// Clasificador local de artículos de compra por pasillo (heurística por palabra clave).
// Mismo diccionario que la versión web para mantener paridad de comportamiento.

const AISLE_RULES: { cat: string; kws: string[] }[] = [
  { cat: 'Frutas y verduras', kws: ['manzana', 'platano', 'plátano', 'banana', 'naranja', 'limon', 'limón', 'lima', 'tomate', 'cebolla', 'papa', 'patata', 'lechuga', 'zanahoria', 'aguacate', 'palta', 'pepino', 'chile', 'pimiento', 'ajo', 'uva', 'fresa', 'sandia', 'sandía', 'melon', 'melón', 'brocoli', 'brócoli', 'espinaca', 'elote', 'maiz', 'maíz', 'calabaza', 'mango', 'piña', 'apio', 'cilantro', 'perejil'] },
  { cat: 'Lácteos y huevos', kws: ['leche', 'queso', 'yogur', 'yogurt', 'mantequilla', 'crema', 'huevo', 'huevos'] },
  { cat: 'Carnes y pescados', kws: ['pollo', 'res', 'carne', 'cerdo', 'puerco', 'pescado', 'atun', 'atún', 'camaron', 'camarón', 'jamon', 'jamón', 'tocino', 'salchicha', 'chorizo', 'pavo'] },
  { cat: 'Panadería', kws: ['pan', 'bolillo', 'baguette', 'tortilla', 'pastel', 'galleta', 'croissant', 'concha'] },
  { cat: 'Despensa', kws: ['arroz', 'frijol', 'frijoles', 'pasta', 'harina', 'azucar', 'azúcar', 'sal', 'aceite', 'cafe', 'café', 'cereal', 'lentejas', 'avena', 'salsa', 'mayonesa', 'mostaza', 'sopa', 'miel', 'vinagre'] },
  { cat: 'Bebidas', kws: ['agua', 'refresco', 'jugo', 'cerveza', 'vino', 'soda', 'te', 'té'] },
  { cat: 'Congelados', kws: ['helado', 'congelado', 'nuggets', 'pizza'] },
  { cat: 'Limpieza', kws: ['detergente', 'jabon', 'jabón', 'cloro', 'limpiador', 'esponja', 'higienico', 'higiénico', 'servilletas', 'basura', 'suavizante'] },
  { cat: 'Cuidado personal', kws: ['shampoo', 'champu', 'champú', 'dental', 'desodorante', 'rastrillo', 'toallas femeninas', 'crema corporal'] },
  { cat: 'Bebé', kws: ['pañal', 'pañales', 'formula', 'fórmula', 'toallitas'] },
  { cat: 'Mascotas', kws: ['croquetas', 'perro', 'gato', 'arena'] },
];

export const AISLE_ORDER = ['Frutas y verduras', 'Panadería', 'Lácteos y huevos', 'Carnes y pescados', 'Congelados', 'Despensa', 'Bebidas', 'Limpieza', 'Cuidado personal', 'Bebé', 'Mascotas', 'Otros'];

// Claves cortas (≤4 letras, ej. "te", "res", "pan") solo cuentan como palabra
// completa (o su plural); si no, "detergente" caería en Bebidas por contener "te".
function kwMatches(text: string, words: string[], kw: string): boolean {
  if (kw.length > 4) return text.includes(kw);
  return words.some((w) => w === kw || w === kw + 's' || w === kw + 'es');
}

export function classifyGroceryItem(text: string): string {
  const t = text.toLowerCase();
  const words = t.split(/[^a-záéíóúüñ]+/i).filter(Boolean);
  for (const rule of AISLE_RULES) {
    if (rule.kws.some((k) => kwMatches(t, words, k))) return rule.cat;
  }
  return 'Otros';
}
