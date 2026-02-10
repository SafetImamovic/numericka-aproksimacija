/**
 * ============================================================================
 *  MODUL: Aproksimacija metodom najmanjih kvadrata
 * ============================================================================
 *
 *  Ovaj modul implementira metode aproksimacije za prilagođavanje krivih
 *  skupu podataka koristeći metodu najmanjih kvadrata (MNK).
 *
 *  Podržane metode:
 *    1. Linearna aproksimacija:      y = a + bx
 *    2. Kvadratna aproksimacija:     y = a + bx + cx²
 *    3. Polinomna aproksimacija:     y = a₀ + a₁x + ... + aₙxⁿ  (stepen n)
 *    4. Stepena aproksimacija:       y = a·x^b   (linearizacija pomoću ln)
 *    5. Eksponencijalna aproksimacija: y = a·e^(bx)  (linearizacija pomoću ln)
 *
 *  Svaka metoda vraća:
 *    - koeficijente polinoma/funkcije
 *    - LaTeX zapis rezultata
 *    - R² (koeficijent determinacije)
 *    - sumu kvadrata grešaka (SKG)
 *    - greške po tačkama (apsolutne i relativne)
 *    - tačke prilagođene krive za crtanje grafika
 *    - korake rješavanja za prikaz postupka
 */

import type { DataPoint, ApproximationResult, CalculationType, StepTranslations, MetodaRjesavanja } from '@/lib/types'
import {
  matricaULatex,
  vektorULatex,
  formatirajBroj,
  gaussSaKoracima,
  gaussJordanSaKoracima,
  luDoolittleSaKoracima,
} from './matrica-utils'
import { polynomialToLatex, generatePolynomialPoints } from './expression-parser'

// ============================================================================
//  Dispečer za rješavanje linearnog sistema
// ============================================================================

function rijesiSistem(
  A: number[][], b: number[], preciznost: number, t?: StepTranslations, metoda: MetodaRjesavanja = 'gauss'
): { rjesenje: number[]; koraci: string[] } {
  switch (metoda) {
    case 'gauss-jordan':
      return gaussJordanSaKoracima(A, b, preciznost, t)
    case 'lu-doolittle':
      return luDoolittleSaKoracima(A, b, preciznost, t)
    case 'gauss':
    default:
      return gaussSaKoracima(A, b, preciznost, t)
  }
}

// ============================================================================
//  Pomoćne funkcije za računanje suma
// ============================================================================

/**
 * Izračunava sumu stepena x-koordinata: Σ(xᵢ^stepen)
 *
 * @param tacke  - niz podatkovnih tačaka
 * @param stepen - stepen na koji se diže svaka x vrijednost
 * @returns suma svih x^stepen vrijednosti
 *
 * Primjer: sumaStepenX([{x:2,y:3}, {x:4,y:5}], 2) = 2² + 4² = 20
 */
function sumaStepenX(tacke: DataPoint[], stepen: number): number {
  return tacke.reduce((suma, t) => suma + Math.pow(t.x, stepen), 0)
}

/**
 * Izračunava sumu proizvoda x^stepen * y za sve tačke: Σ(xᵢ^stepen · yᵢ)
 *
 * @param tacke  - niz podatkovnih tačaka
 * @param stepen - stepen za x vrijednost u proizvodu
 * @returns suma svih x^stepen * y vrijednosti
 *
 * Primjer: sumaStepenXY([{x:2,y:3}, {x:4,y:5}], 1) = 2·3 + 4·5 = 26
 */
function sumaStepenXY(tacke: DataPoint[], stepen: number): number {
  return tacke.reduce((suma, t) => suma + Math.pow(t.x, stepen) * t.y, 0)
}

// ============================================================================
//  Funkcije za mjere kvaliteta aproksimacije
// ============================================================================

/**
 * Izračunava R² — koeficijent determinacije.
 *
 * R² mjeri koliko dobro aproksimacija objašnjava varijaciju u podacima.
 * Vrijednost 1.0 znači savršeno poklapanje, 0.0 znači da model ne
 * objašnjava nikakvu varijaciju.
 *
 * Formula:  R² = 1 - (SKres / SKtot)
 *   gdje je SKres = Σ(yᵢ - ŷᵢ)²  (rezidualna suma kvadrata)
 *           SKtot = Σ(yᵢ - ȳ)²   (totalna suma kvadrata)
 *
 * @param tacke       - originalne podatkovne tačke
 * @param koeficijenti - koeficijenti polinoma [a₀, a₁, ..., aₙ]
 * @returns R² vrijednost (između 0 i 1)
 */
function izracunajRKvadrat(tacke: DataPoint[], koeficijenti: number[]): number {
  const n = tacke.length
  const ySrednje = tacke.reduce((suma, t) => suma + t.y, 0) / n

  let skTot = 0 // Totalna suma kvadrata
  let skRes = 0 // Rezidualna suma kvadrata

  for (const tacka of tacke) {
    // Izračunaj predviđenu y vrijednost: ŷ = a₀ + a₁x + a₂x² + ...
    let yPred = 0
    for (let i = 0; i < koeficijenti.length; i++) {
      yPred += koeficijenti[i] * Math.pow(tacka.x, i)
    }

    skTot += Math.pow(tacka.y - ySrednje, 2)
    skRes += Math.pow(tacka.y - yPred, 2)
  }

  return 1 - skRes / skTot
}

/**
 * Izračunava sumu kvadrata grešaka (SKG): Σ(yᵢ - ŷᵢ)²
 *
 * SKG je mjera ukupnog odstupanja aproksimacije od stvarnih podataka.
 * Manja SKG znači bolje prilagođavanje.
 *
 * @param tacke       - originalne podatkovne tačke
 * @param koeficijenti - koeficijenti polinoma
 * @returns suma kvadrata razlika između stvarnih i predviđenih y vrijednosti
 */
function izracunajSKG(tacke: DataPoint[], koeficijenti: number[]): number {
  let skg = 0
  for (const tacka of tacke) {
    let yPred = 0
    for (let i = 0; i < koeficijenti.length; i++) {
      yPred += koeficijenti[i] * Math.pow(tacka.x, i)
    }
    skg += Math.pow(tacka.y - yPred, 2)
  }
  return skg
}

/**
 * Izračunava apsolutnu i relativnu grešku za svaku podatkovnu tačku.
 *
 * Za svaku tačku:
 *   - Apsolutna greška = |yᵢ - ŷᵢ|
 *   - Relativna greška = |yᵢ - ŷᵢ| / |yᵢ|  (0 ako je yᵢ = 0)
 *
 * Podržava tri tipa modela:
 *   - Stepena:         ŷ = a · x^b
 *   - Eksponencijalna: ŷ = a · e^(bx)
 *   - Polinomna:       ŷ = a₀ + a₁x + ... + aₙxⁿ
 *
 * @param tacke       - originalne podatkovne tačke
 * @param koeficijenti - koeficijenti modela
 * @param tip         - tip aproksimacije (određuje formulu za ŷ)
 * @returns niz objekata sa apsolutnom i relativnom greškom za svaku tačku
 */
function izracunajGreskePoTackama(tacke: DataPoint[], koeficijenti: number[], tip: string): { absolute: number, relative: number }[] {
  return tacke.map(tacka => {
    let yPred = 0

    if (tip === 'power-approximation') {
      // Stepeni model: y = a · x^b
      const [a, b] = koeficijenti
      yPred = a * Math.pow(tacka.x, b)
    } else if (tip === 'exponential-approximation') {
      // Eksponencijalni model: y = a · e^(bx)
      const [a, b] = koeficijenti
      yPred = a * Math.exp(b * tacka.x)
    } else {
      // Standardni polinom: y = a₀ + a₁x + a₂x² + ...
      for (let i = 0; i < koeficijenti.length; i++) {
        yPred += koeficijenti[i] * Math.pow(tacka.x, i)
      }
    }

    const apsolutna = Math.abs(tacka.y - yPred)
    const relativna = tacka.y !== 0 ? apsolutna / Math.abs(tacka.y) : 0

    return { absolute: apsolutna, relative: relativna }
  })
}

// ============================================================================
//  Glavne metode aproksimacije
// ============================================================================

/**
 * Linearna aproksimacija metodom najmanjih kvadrata: y = a + bx
 *
 * Rješava sistem normalnih jednadžbi:
 *   | n      Σxᵢ   | | a |   | Σyᵢ   |
 *   | Σxᵢ    Σxᵢ²  | | b | = | Σxᵢyᵢ |
 *
 * @param tacke    - niz podatkovnih tačaka (minimalno 2)
 * @param t        - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz
 * @returns rezultat aproksimacije sa koeficijentima, polinomom, greškama i koracima
 */
export function linearnaAproksimacija(tacke: DataPoint[], t?: StepTranslations, preciznost: number = 4, metodaRjesavanja: MetodaRjesavanja = 'gauss'): ApproximationResult & { steps: string[] } {
  const n = tacke.length
  const koraci: string[] = []

  // Izračunaj potrebne sume za normalne jednadžbe
  const sumaX = sumaStepenX(tacke, 1)
  const sumaX2 = sumaStepenX(tacke, 2)
  const sumaY = sumaStepenXY(tacke, 0)
  const sumaXY = sumaStepenXY(tacke, 1)

  koraci.push(`N = ${n}`)
  koraci.push(`\\sum x_i = ${formatirajBroj(sumaX, preciznost)}`)
  koraci.push(`\\sum x_i^2 = ${formatirajBroj(sumaX2, preciznost)}`)
  koraci.push(`\\sum y_i = ${formatirajBroj(sumaY, preciznost)}`)
  koraci.push(`\\sum x_i y_i = ${formatirajBroj(sumaXY, preciznost)}`)

  let koeficijenti: number[]

  if (metodaRjesavanja === 'direktne-formule') {
    // Direktne formule iz parcijalnih izvoda
    koraci.push(`\\text{${t?.directFormulas || 'Direct Formulas (Partial Derivatives):'}}`)

    const xBar = sumaX / n
    const yBar = sumaY / n

    koraci.push(`\\text{${t?.meanValues || 'Mean values:'}}`)
    koraci.push(`\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{${formatirajBroj(sumaX, preciznost)}}{${n}} = ${formatirajBroj(xBar, preciznost)}`)
    koraci.push(`\\bar{y} = \\frac{\\sum y_i}{n} = \\frac{${formatirajBroj(sumaY, preciznost)}}{${n}} = ${formatirajBroj(yBar, preciznost)}`)

    const bNumerator = n * sumaXY - sumaX * sumaY
    const bDenominator = n * sumaX2 - sumaX * sumaX

    koraci.push(`\\text{${t?.formulaForB || 'Formula for b:'}}`)
    koraci.push(`b = \\frac{n \\sum x_i y_i - \\sum x_i \\cdot \\sum y_i}{n \\sum x_i^2 - (\\sum x_i)^2} = \\frac{${n} \\cdot ${formatirajBroj(sumaXY, preciznost)} - ${formatirajBroj(sumaX, preciznost)} \\cdot ${formatirajBroj(sumaY, preciznost)}}{${n} \\cdot ${formatirajBroj(sumaX2, preciznost)} - (${formatirajBroj(sumaX, preciznost)})^2} = \\frac{${formatirajBroj(bNumerator, preciznost)}}{${formatirajBroj(bDenominator, preciznost)}} = ${formatirajBroj(bNumerator / bDenominator, preciznost)}`)

    const bVal = bNumerator / bDenominator
    const aVal = yBar - bVal * xBar

    koraci.push(`\\text{${t?.formulaForA || 'Formula for a:'}}`)
    koraci.push(`a = \\bar{y} - b \\cdot \\bar{x} = ${formatirajBroj(yBar, preciznost)} - ${formatirajBroj(bVal, preciznost)} \\cdot ${formatirajBroj(xBar, preciznost)} = ${formatirajBroj(aVal, preciznost)}`)

    koeficijenti = [aVal, bVal]
  } else {
    // Formiranje matrice normalnih jednadžbi
    const A = [
      [n, sumaX],
      [sumaX, sumaX2],
    ]
    const b = [sumaY, sumaXY]

    koraci.push(`\\text{${t?.normalEquations || 'Normal equations:'}}`)
    koraci.push(`${matricaULatex(A, preciznost)} ${vektorULatex(['a', 'b'] as unknown as number[])} = ${vektorULatex(b, preciznost)}`)

    // Rješavanje sistema jednadžbi
    const solverResult = rijesiSistem(A, b, preciznost, t, metodaRjesavanja)
    koeficijenti = solverResult.rjesenje
    koraci.push(...solverResult.koraci)
  }

  koraci.push(`\\text{${t?.solution || 'Solution:'}}`)
  koraci.push(`a = ${formatirajBroj(koeficijenti[0], preciznost)}, \\quad b = ${formatirajBroj(koeficijenti[1], preciznost)}`)

  // Generisanje tačaka prilagođene krive za crtanje grafika
  const xMin = Math.min(...tacke.map((t) => t.x))
  const xMax = Math.max(...tacke.map((t) => t.x))
  const tackePrilagodjeneKrive = generatePolynomialPoints(koeficijenti, { min: xMin, max: xMax })

  return {
    type: 'linear-approximation',
    coefficients: koeficijenti,
    polynomial: polynomialToLatex(koeficijenti, preciznost),
    rSquared: izracunajRKvadrat(tacke, koeficijenti),
    sumSquaredError: izracunajSKG(tacke, koeficijenti),
    points: tacke,
    fittedPoints: tackePrilagodjeneKrive,
    steps: koraci,
    pointErrors: izracunajGreskePoTackama(tacke, koeficijenti, 'linear-approximation'),
  }
}

/**
 * Kvadratna aproksimacija metodom najmanjih kvadrata: y = a + bx + cx²
 *
 * Rješava sistem normalnih jednadžbi 3×3:
 *   | n      Σxᵢ    Σxᵢ²  | | a |   | Σyᵢ     |
 *   | Σxᵢ    Σxᵢ²   Σxᵢ³  | | b | = | Σxᵢyᵢ   |
 *   | Σxᵢ²   Σxᵢ³   Σxᵢ⁴  | | c |   | Σxᵢ²yᵢ  |
 *
 * @param tacke    - niz podatkovnih tačaka (minimalno 3)
 * @param t        - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz
 * @returns rezultat aproksimacije sa koeficijentima, polinomom, greškama i koracima
 */
export function kvadratnaAproksimacija(tacke: DataPoint[], t?: StepTranslations, preciznost: number = 4, metodaRjesavanja: MetodaRjesavanja = 'gauss'): ApproximationResult & { steps: string[] } {
  const n = tacke.length
  const koraci: string[] = []

  // Izračunaj sve potrebne sume za normalne jednadžbe
  const sumaX = sumaStepenX(tacke, 1)
  const sumaX2 = sumaStepenX(tacke, 2)
  const sumaX3 = sumaStepenX(tacke, 3)
  const sumaX4 = sumaStepenX(tacke, 4)
  const sumaY = sumaStepenXY(tacke, 0)
  const sumaXY = sumaStepenXY(tacke, 1)
  const sumaX2Y = sumaStepenXY(tacke, 2)

  koraci.push(`N = ${n}`)
  koraci.push(`\\sum x_i = ${formatirajBroj(sumaX, preciznost)}, \\quad \\sum x_i^2 = ${formatirajBroj(sumaX2, preciznost)}`)
  koraci.push(`\\sum x_i^3 = ${formatirajBroj(sumaX3, preciznost)}, \\quad \\sum x_i^4 = ${formatirajBroj(sumaX4, preciznost)}`)
  koraci.push(`\\sum y_i = ${formatirajBroj(sumaY, preciznost)}, \\quad \\sum x_i y_i = ${formatirajBroj(sumaXY, preciznost)}, \\quad \\sum x_i^2 y_i = ${formatirajBroj(sumaX2Y, preciznost)}`)

  // Formiranje matrice normalnih jednadžbi 3×3
  const A = [
    [n, sumaX, sumaX2],
    [sumaX, sumaX2, sumaX3],
    [sumaX2, sumaX3, sumaX4],
  ]
  const b = [sumaY, sumaXY, sumaX2Y]

  koraci.push(`\\text{${t?.normalEquations || 'Normal equations:'}}`)
  koraci.push(`${matricaULatex(A, preciznost)} ${vektorULatex(['a', 'b', 'c'] as unknown as number[])} = ${vektorULatex(b, preciznost)}`)

  // Rješavanje sistema jednadžbi
  const solverResult = rijesiSistem(A, b, preciznost, t, metodaRjesavanja)
  const koeficijenti = solverResult.rjesenje
  koraci.push(...solverResult.koraci)

  koraci.push(`\\text{${t?.solution || 'Solution:'}}`)
  koraci.push(`a = ${formatirajBroj(koeficijenti[0], preciznost)}, \\quad b = ${formatirajBroj(koeficijenti[1], preciznost)}, \\quad c = ${formatirajBroj(koeficijenti[2], preciznost)}`)

  // Generisanje tačaka prilagođene krive za grafik
  const xMin = Math.min(...tacke.map((t) => t.x))
  const xMax = Math.max(...tacke.map((t) => t.x))
  const tackePrilagodjeneKrive = generatePolynomialPoints(koeficijenti, { min: xMin, max: xMax })

  return {
    type: 'quadratic-approximation',
    coefficients: koeficijenti,
    polynomial: polynomialToLatex(koeficijenti, preciznost),
    rSquared: izracunajRKvadrat(tacke, koeficijenti),
    sumSquaredError: izracunajSKG(tacke, koeficijenti),
    points: tacke,
    fittedPoints: tackePrilagodjeneKrive,
    steps: koraci,
    pointErrors: izracunajGreskePoTackama(tacke, koeficijenti, 'quadratic-approximation'),
  }
}

/**
 * Polinomna aproksimacija opšteg stepena metodom najmanjih kvadrata.
 *
 * Normalne jednadžbe se formiraju direktno iz suma:
 *   a₀·N     + a₁·Σxᵢ   + ... + aₙ·Σxᵢⁿ   = ΣYᵢ
 *   a₀·Σxᵢ  + a₁·Σxᵢ²  + ... + aₙ·Σxᵢⁿ⁺¹ = ΣxᵢYᵢ
 *   ...
 *   a₀·Σxᵢⁿ + a₁·Σxᵢⁿ⁺¹ + ... + aₙ·Σxᵢ²ⁿ = ΣxᵢⁿYᵢ
 *
 * @param tacke    - niz podatkovnih tačaka (minimalno stepen+1)
 * @param stepen   - stepen željenog polinoma
 * @param t        - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz
 * @returns rezultat sa koeficijentima, normalnom matricom, vektorom, i koracima
 */
export function polinomnaAproksimacija(
  tacke: DataPoint[],
  stepen: number,
  t?: StepTranslations,
  preciznost: number = 4,
  metodaRjesavanja: MetodaRjesavanja = 'gauss'
): ApproximationResult & { steps: string[]; normalMatrix: number[][]; normalVector: number[] } {
  const n = tacke.length
  const koraci: string[] = []

  // Izračunaj sume stepena x: Σxᵢ^k za k = 0, 1, ..., 2·stepen
  const sumeX: number[] = []
  for (let k = 0; k <= 2 * stepen; k++) {
    sumeX.push(sumaStepenX(tacke, k))
  }

  // Izračunaj sume proizvoda: Σxᵢ^k·Yᵢ za k = 0, 1, ..., stepen
  const sumeXY: number[] = []
  for (let k = 0; k <= stepen; k++) {
    sumeXY.push(sumaStepenXY(tacke, k))
  }

  // Prikaz N i suma
  koraci.push(`N = ${n}`)

  for (let k = 1; k <= 2 * stepen; k += 2) {
    let line = `\\sum x_i${k > 1 ? `^{${k}}` : ''} = ${formatirajBroj(sumeX[k], preciznost)}`
    if (k + 1 <= 2 * stepen) {
      line += `, \\quad \\sum x_i^{${k + 1}} = ${formatirajBroj(sumeX[k + 1], preciznost)}`
    }
    koraci.push(line)
  }

  let xyLine = `\\sum Y_i = ${formatirajBroj(sumeXY[0], preciznost)}`
  for (let k = 1; k <= stepen; k++) {
    xyLine += `, \\quad \\sum x_i${k > 1 ? `^{${k}}` : ''} Y_i = ${formatirajBroj(sumeXY[k], preciznost)}`
  }
  koraci.push(xyLine)

  // Formiranje matrice normalnih jednadžbi iz suma: M[j][k] = Σxᵢ^(j+k)
  const A: number[][] = []
  for (let j = 0; j <= stepen; j++) {
    A.push([])
    for (let k = 0; k <= stepen; k++) {
      A[j].push(sumeX[j + k])
    }
  }
  const b = sumeXY

  koraci.push(`\\text{${t?.normalEquations || 'Normal equations:'}}`)

  const varLabels: string[] = []
  for (let i = 0; i <= stepen; i++) {
    varLabels.push(`a_{${i}}`)
  }
  koraci.push(`${matricaULatex(A, preciznost)} ${vektorULatex(varLabels as unknown as number[])} = ${vektorULatex(b, preciznost)}`)

  // Rješavanje sistema jednadžbi
  const solverResult = rijesiSistem(A, b, preciznost, t, metodaRjesavanja)
  const koeficijenti = solverResult.rjesenje
  koraci.push(...solverResult.koraci)

  koraci.push(`\\text{${t?.solution || 'Solution:'}}`)
  for (let i = 0; i <= stepen; i++) {
    koraci.push(`a_{${i}} = ${formatirajBroj(koeficijenti[i], preciznost)}`)
  }

  // Generisanje tačaka prilagođene krive
  const xMin = Math.min(...tacke.map((t) => t.x))
  const xMax = Math.max(...tacke.map((t) => t.x))
  const tackePrilagodjeneKrive = generatePolynomialPoints(koeficijenti, { min: xMin, max: xMax })

  return {
    type: 'polynomial-approximation',
    coefficients: koeficijenti,
    polynomial: polynomialToLatex(koeficijenti, preciznost),
    rSquared: izracunajRKvadrat(tacke, koeficijenti),
    sumSquaredError: izracunajSKG(tacke, koeficijenti),
    points: tacke,
    fittedPoints: tackePrilagodjeneKrive,
    steps: koraci,
    normalMatrix: A,
    normalVector: b,
    pointErrors: izracunajGreskePoTackama(tacke, koeficijenti, 'polynomial-approximation'),
  }
}

/**
 * Stepena aproksimacija: y = a·x^b
 *
 * Koristi linearizaciju logaritmovanjem obje strane:
 *   ln(y) = ln(a) + b·ln(x)
 *
 * Uvođenjem smjene X = ln(x) i Y = ln(y), problem se svodi na
 * linearnu regresiju: Y = ln(a) + b·X
 *
 * NAPOMENA: Zahtijeva da su sve x i y vrijednosti strogo pozitivne (> 0),
 * jer logaritam nije definisan za nula ili negativne vrijednosti.
 *
 * @param tacke    - niz podatkovnih tačaka (x > 0, y > 0)
 * @param t        - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz
 * @returns rezultat sa koeficijentima [a, b], transformisanim tačkama, i koracima
 */
export function stepenaAproksimacija(tacke: DataPoint[], t?: StepTranslations, preciznost: number = 4, metodaRjesavanja: MetodaRjesavanja = 'gauss'): ApproximationResult & { steps: string[]; transformedPoints: DataPoint[] } {
  const koraci: string[] = []

  // Provjera: x vrijednosti moraju biti pozitivne za ln(x)
  if (tacke.some((t) => t.x <= 0)) {
    throw new Error('positiveXRequired')
  }
  // Provjera: y vrijednosti moraju biti pozitivne za ln(y)
  if (tacke.some((t) => t.y <= 0)) {
    throw new Error('positiveYRequired')
  }

  // Transformacija u linearan oblik: X = ln(x), Y = ln(y)
  const transformisaneTacke = tacke.map((t) => ({
    x: Math.log(t.x),
    y: Math.log(t.y),
  }))

  koraci.push(`\\text{${t?.linearization || 'Linearization:'} } \\ln(y) = \\ln(a) + b \\ln(x)`)
  koraci.push(`Y = \\ln(y), \\quad A = \\ln(a), \\quad X = \\ln(x) \\text{ i } B = b`)
  koraci.push(`Y = A + BX`)

  // Primjena linearne regresije na transformisane podatke
  const n = transformisaneTacke.length
  const sumaX = transformisaneTacke.reduce((s, t) => s + t.x, 0)
  const sumaX2 = transformisaneTacke.reduce((s, t) => s + t.x * t.x, 0)
  const sumaY = transformisaneTacke.reduce((s, t) => s + t.y, 0)
  const sumaXY = transformisaneTacke.reduce((s, t) => s + t.x * t.y, 0)

  let lnA: number
  let b: number

  if (metodaRjesavanja === 'direktne-formule') {
    koraci.push(`\\text{${t?.directFormulas || 'Direct Formulas (Partial Derivatives):'}}`)

    const xBar = sumaX / n
    const yBar = sumaY / n

    koraci.push(`\\text{${t?.meanValues || 'Mean values:'}}`)
    koraci.push(`\\bar{X} = \\frac{\\sum X_i}{n} = \\frac{${formatirajBroj(sumaX, preciznost)}}{${n}} = ${formatirajBroj(xBar, preciznost)}`)
    koraci.push(`\\bar{Y} = \\frac{\\sum Y_i}{n} = \\frac{${formatirajBroj(sumaY, preciznost)}}{${n}} = ${formatirajBroj(yBar, preciznost)}`)

    const bNumerator = n * sumaXY - sumaX * sumaY
    const bDenominator = n * sumaX2 - sumaX * sumaX

    koraci.push(`\\text{${t?.formulaForBCapital || 'Formula for B:'}}`)
    koraci.push(`B = \\frac{n \\sum X_i Y_i - \\sum X_i \\cdot \\sum Y_i}{n \\sum X_i^2 - (\\sum X_i)^2} = \\frac{${n} \\cdot ${formatirajBroj(sumaXY, preciznost)} - ${formatirajBroj(sumaX, preciznost)} \\cdot ${formatirajBroj(sumaY, preciznost)}}{${n} \\cdot ${formatirajBroj(sumaX2, preciznost)} - (${formatirajBroj(sumaX, preciznost)})^2} = \\frac{${formatirajBroj(bNumerator, preciznost)}}{${formatirajBroj(bDenominator, preciznost)}} = ${formatirajBroj(bNumerator / bDenominator, preciznost)}`)

    b = bNumerator / bDenominator
    lnA = yBar - b * xBar

    koraci.push(`\\text{${t?.formulaForACapital || 'Formula for A:'}}`)
    koraci.push(`A = \\bar{Y} - B \\cdot \\bar{X} = ${formatirajBroj(yBar, preciznost)} - ${formatirajBroj(b, preciznost)} \\cdot ${formatirajBroj(xBar, preciznost)} = ${formatirajBroj(lnA, preciznost)}`)
  } else {
    const A = [
      [n, sumaX],
      [sumaX, sumaX2],
    ]
    const bVektor = [sumaY, sumaXY]

    const solverResult = rijesiSistem(A, bVektor, preciznost, t, metodaRjesavanja)
    const linearniKoef = solverResult.rjesenje
    koraci.push(...solverResult.koraci)
    lnA = linearniKoef[0]
    b = linearniKoef[1]
  }

  const a = Math.exp(lnA)

  koraci.push(`Y = A + BX = ${formatirajBroj(lnA, preciznost)} + ${formatirajBroj(b, preciznost)} \\cdot X`)
  koraci.push(`a = e^{A} = e^{${formatirajBroj(lnA, preciznost)}} = ${formatirajBroj(a, preciznost)}, \\quad b = B = ${formatirajBroj(b, preciznost)}`)
  koraci.push(`\\text{${t?.result || 'Result:'} } y = ${formatirajBroj(a, preciznost)} \\cdot x^{${formatirajBroj(b, preciznost)}}`)

  // Generisanje tačaka prilagođene krive koristeći stepenu funkciju
  const xMin = Math.min(...tacke.map((t) => t.x))
  const xMax = Math.max(...tacke.map((t) => t.x))
  const tackePrilagodjeneKrive: DataPoint[] = []
  const brojTacaka = 100
  const korak = (xMax - xMin) / (brojTacaka - 1)

  for (let i = 0; i < brojTacaka; i++) {
    const x = xMin + i * korak
    const y = a * Math.pow(x, b)
    tackePrilagodjeneKrive.push({ x, y })
  }

  // Izračunaj R² za stepeni model
  const ySrednje = tacke.reduce((s, t) => s + t.y, 0) / n
  let skTot = 0
  let skRes = 0
  for (const tacka of tacke) {
    const yPred = a * Math.pow(tacka.x, b)
    skTot += Math.pow(tacka.y - ySrednje, 2)
    skRes += Math.pow(tacka.y - yPred, 2)
  }
  const rKvadrat = 1 - skRes / skTot

  return {
    type: 'power-approximation',
    coefficients: [a, b],
    polynomial: `${formatirajBroj(a, preciznost)} \\cdot x^{${formatirajBroj(b, preciznost)}}`,
    rSquared: rKvadrat,
    sumSquaredError: skRes,
    points: tacke,
    fittedPoints: tackePrilagodjeneKrive,
    steps: koraci,
    transformedPoints: transformisaneTacke,
    pointErrors: izracunajGreskePoTackama(tacke, [a, b], 'power-approximation'),
  }
}

/**
 * Eksponencijalna aproksimacija: y = a·e^(bx)
 *
 * Koristi linearizaciju logaritmovanjem:
 *   ln(y) = ln(a) + b·x
 *
 * Uvođenjem smjene Y = ln(y), problem se svodi na
 * linearnu regresiju: Y = ln(a) + b·x
 *
 * NAPOMENA: Zahtijeva da su sve y vrijednosti strogo pozitivne (> 0),
 * jer logaritam nije definisan za nula ili negativne vrijednosti.
 *
 * @param tacke    - niz podatkovnih tačaka (y > 0)
 * @param t        - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz
 * @returns rezultat sa koeficijentima [a, b], transformisanim tačkama, i koracima
 */
export function eksponencijalnaAproksimacija(tacke: DataPoint[], t?: StepTranslations, preciznost: number = 4, metodaRjesavanja: MetodaRjesavanja = 'gauss'): ApproximationResult & { steps: string[]; transformedPoints: DataPoint[] } {
  const koraci: string[] = []

  // Provjera: y vrijednosti moraju biti pozitivne za ln(y)
  if (tacke.some((t) => t.y <= 0)) {
    throw new Error('positiveYRequired')
  }

  // Transformacija: Y = ln(y), x ostaje isti
  const transformisaneTacke = tacke.map((t) => ({
    x: t.x,
    y: Math.log(t.y),
  }))

  koraci.push(`\\text{${t?.linearization || 'Linearization:'} } \\ln(y) = \\ln(a) + bx`)
  koraci.push(`Y = \\ln(y), \\quad A = \\ln(a), \\quad X = x \\text{ i } B = b`)
  koraci.push(`Y = A + BX`)

  // Primjena linearne regresije na transformisane podatke
  const n = transformisaneTacke.length
  const sumaX = transformisaneTacke.reduce((s, t) => s + t.x, 0)
  const sumaX2 = transformisaneTacke.reduce((s, t) => s + t.x * t.x, 0)
  const sumaY = transformisaneTacke.reduce((s, t) => s + t.y, 0)
  const sumaXY = transformisaneTacke.reduce((s, t) => s + t.x * t.y, 0)

  let lnA: number
  let b: number

  if (metodaRjesavanja === 'direktne-formule') {
    koraci.push(`\\text{${t?.directFormulas || 'Direct Formulas (Partial Derivatives):'}}`)

    const xBar = sumaX / n
    const yBar = sumaY / n

    koraci.push(`\\text{${t?.meanValues || 'Mean values:'}}`)
    koraci.push(`\\bar{X} = \\frac{\\sum X_i}{n} = \\frac{${formatirajBroj(sumaX, preciznost)}}{${n}} = ${formatirajBroj(xBar, preciznost)}`)
    koraci.push(`\\bar{Y} = \\frac{\\sum Y_i}{n} = \\frac{${formatirajBroj(sumaY, preciznost)}}{${n}} = ${formatirajBroj(yBar, preciznost)}`)

    const bNumerator = n * sumaXY - sumaX * sumaY
    const bDenominator = n * sumaX2 - sumaX * sumaX

    koraci.push(`\\text{${t?.formulaForBCapital || 'Formula for B:'}}`)
    koraci.push(`B = \\frac{n \\sum X_i Y_i - \\sum X_i \\cdot \\sum Y_i}{n \\sum X_i^2 - (\\sum X_i)^2} = \\frac{${n} \\cdot ${formatirajBroj(sumaXY, preciznost)} - ${formatirajBroj(sumaX, preciznost)} \\cdot ${formatirajBroj(sumaY, preciznost)}}{${n} \\cdot ${formatirajBroj(sumaX2, preciznost)} - (${formatirajBroj(sumaX, preciznost)})^2} = \\frac{${formatirajBroj(bNumerator, preciznost)}}{${formatirajBroj(bDenominator, preciznost)}} = ${formatirajBroj(bNumerator / bDenominator, preciznost)}`)

    b = bNumerator / bDenominator
    lnA = yBar - b * xBar

    koraci.push(`\\text{${t?.formulaForACapital || 'Formula for A:'}}`)
    koraci.push(`A = \\bar{Y} - B \\cdot \\bar{X} = ${formatirajBroj(yBar, preciznost)} - ${formatirajBroj(b, preciznost)} \\cdot ${formatirajBroj(xBar, preciznost)} = ${formatirajBroj(lnA, preciznost)}`)
  } else {
    const A = [
      [n, sumaX],
      [sumaX, sumaX2],
    ]
    const bVektor = [sumaY, sumaXY]

    const solverResult = rijesiSistem(A, bVektor, preciznost, t, metodaRjesavanja)
    const linearniKoef = solverResult.rjesenje
    koraci.push(...solverResult.koraci)
    lnA = linearniKoef[0]
    b = linearniKoef[1]
  }

  const a = Math.exp(lnA)

  koraci.push(`Y = A + Bx = ${formatirajBroj(lnA, preciznost)} + ${formatirajBroj(b, preciznost)} \\cdot x`)
  koraci.push(`a = e^{A} = e^{${formatirajBroj(lnA, preciznost)}} = ${formatirajBroj(a, preciznost)}, \\quad b = B = ${formatirajBroj(b, preciznost)}`)
  koraci.push(`\\text{${t?.result || 'Result:'} } y = ${formatirajBroj(a, preciznost)} \\cdot e^{${formatirajBroj(b, preciznost)}x} = ${formatirajBroj(a, preciznost)} \\cdot (e^{${formatirajBroj(b, preciznost)}})^x = ${formatirajBroj(a, preciznost)} \\cdot ${formatirajBroj(Math.exp(b), preciznost)}^x`)

  // Generisanje tačaka prilagođene krive koristeći eksponencijalnu funkciju
  const xMin = Math.min(...tacke.map((t) => t.x))
  const xMax = Math.max(...tacke.map((t) => t.x))
  const tackePrilagodjeneKrive: DataPoint[] = []
  const brojTacaka = 100
  const korak = (xMax - xMin) / (brojTacaka - 1)

  for (let i = 0; i < brojTacaka; i++) {
    const x = xMin + i * korak
    const y = a * Math.exp(b * x)
    tackePrilagodjeneKrive.push({ x, y })
  }

  // Izračunaj R² za eksponencijalni model
  const ySrednje = tacke.reduce((s, t) => s + t.y, 0) / n
  let skTot = 0
  let skRes = 0
  for (const tacka of tacke) {
    const yPred = a * Math.exp(b * tacka.x)
    skTot += Math.pow(tacka.y - ySrednje, 2)
    skRes += Math.pow(tacka.y - yPred, 2)
  }
  const rKvadrat = 1 - skRes / skTot

  return {
    type: 'exponential-approximation',
    coefficients: [a, b],
    polynomial: `${formatirajBroj(a, preciznost)} \\cdot e^{${formatirajBroj(b, preciznost)}x}`,
    rSquared: rKvadrat,
    sumSquaredError: skRes,
    points: tacke,
    fittedPoints: tackePrilagodjeneKrive,
    steps: koraci,
    transformedPoints: transformisaneTacke,
    pointErrors: izracunajGreskePoTackama(tacke, [a, b], 'exponential-approximation'),
  }
}

// ============================================================================
//  Glavna dispečer funkcija
// ============================================================================

/**
 * Glavna funkcija za aproksimaciju — preusmjerava na odgovarajuću metodu
 * na osnovu zadanog tipa izračuna.
 *
 * Ova funkcija služi kao jedina ulazna tačka iz ostatka aplikacije.
 * Na osnovu parametra `tip`, poziva jednu od pet metoda aproksimacije.
 *
 * @param tacke      - niz podatkovnih tačaka
 * @param tip        - tip aproksimacije (npr. 'linear-approximation')
 * @param stepen     - stepen polinoma (samo za polinomnu aproksimaciju)
 * @param prijevodi  - prijevodi za korake rješavanja (i18n)
 * @param preciznost - broj decimalnih mjesta za prikaz rezultata
 * @returns rezultat aproksimacije odgovarajućeg tipa
 * @throws Error ako je tip aproksimacije nepoznat
 */
export function aproksimiraj(
  tacke: DataPoint[],
  tip: CalculationType,
  stepen?: number,
  prijevodi?: StepTranslations,
  preciznost: number = 4,
  metodaRjesavanja: MetodaRjesavanja = 'gauss'
): ApproximationResult & { steps: string[] } {
  switch (tip) {
    case 'linear-approximation':
      return linearnaAproksimacija(tacke, prijevodi, preciznost, metodaRjesavanja)
    case 'quadratic-approximation':
      return kvadratnaAproksimacija(tacke, prijevodi, preciznost, metodaRjesavanja)
    case 'polynomial-approximation':
      return polinomnaAproksimacija(tacke, stepen || 3, prijevodi, preciznost, metodaRjesavanja)
    case 'power-approximation':
      return stepenaAproksimacija(tacke, prijevodi, preciznost, metodaRjesavanja)
    case 'exponential-approximation':
      return eksponencijalnaAproksimacija(tacke, prijevodi, preciznost, metodaRjesavanja)
    default:
      throw new Error(`Nepoznat tip aproksimacije: ${tip}`)
  }
}
