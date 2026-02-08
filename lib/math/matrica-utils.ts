/**
 * ============================================================================
 *  MODUL: Pomoćne funkcije za rad sa matricama i vektorima
 * ============================================================================
 *
 *  Ovaj modul sadrži operacije linearne algebre potrebne za numeričke
 *  metode aproksimacije i interpolacije:
 *
 *    - Rješavanje sistema linearnih jednadžbi (Gaussova eliminacija)
 *    - Operacije sa matricama (množenje, transponovanje, determinanta)
 *    - Vandermondeova matrica za polinomno prilagođavanje
 *    - Normalne jednadžbe za metodu najmanjih kvadrata (MNK)
 *    - Formatiranje matrica i vektora u LaTeX zapis
 *
 *  Tipovi podataka:
 *    Matrix = number[][]  (dvodimenzionalni niz brojeva)
 *    Vector = number[]    (jednodimenzionalni niz brojeva)
 */

import type { Matrix, Vector, StepTranslations } from '@/lib/types'

// ============================================================================
//  Rješavanje sistema linearnih jednadžbi
// ============================================================================

/**
 * Rješava sistem linearnih jednadžbi A·x = b Gaussovom eliminacijom
 * sa parcijalnim pivotiranjem.
 *
 * Postupak:
 *   1. Formira proširenu matricu [A|b]
 *   2. Direktna eliminacija (naprijed) sa parcijalnim pivotiranjem:
 *      - Za svaku kolonu k, pronađe red sa najvećim apsolutnim elementom
 *      - Zamijeni redove (pivotiranje) radi numeričke stabilnosti
 *      - Eliminira elemente ispod pivota
 *   3. Povratna supstitucija (nazad):
 *      - Od posljednje jednadžbe prema prvoj, izračunava nepoznate
 *
 * Primjer za 2×2 sistem:
 *   | 2  1 | | x₁ |   | 5 |
 *   | 1  3 | | x₂ | = | 7 |
 *   Rješenje: x₁ = 1.6, x₂ = 1.8
 *
 * @param A - matrica koeficijenata (n×n)
 * @param b - vektor slobodnih članova (n×1)
 * @returns vektor rješenja x
 * @throws Error ako je matrica singularna (determinanta ≈ 0)
 */
export function rijesiLinearniSistem(A: Matrix, b: Vector): Vector {
  const n = A.length

  // Kreiranje proširene matrice [A|b] — dodaje b kao posljednju kolonu
  const prosirena: Matrix = A.map((red, i) => [...red, b[i]])

  // ---- Direktna eliminacija sa parcijalnim pivotiranjem ----
  for (let k = 0; k < n; k++) {
    // Pronalaženje pivota — red sa najvećim apsolutnim elementom u koloni k
    let maxRed = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(prosirena[i][k]) > Math.abs(prosirena[maxRed][k])) {
        maxRed = i
      }
    }

    // Zamjena redova ako je pronađen bolji pivot
    ;[prosirena[k], prosirena[maxRed]] = [prosirena[maxRed], prosirena[k]]

    // Provjera singularnosti — ako je pivot ≈ 0, sistem nema jedinstveno rješenje
    if (Math.abs(prosirena[k][k]) < 1e-10) {
      throw new Error('Matrica je singularna ili skoro singularna')
    }

    // Eliminacija elemenata ispod pivota u koloni k
    for (let i = k + 1; i < n; i++) {
      const faktor = prosirena[i][k] / prosirena[k][k]
      for (let j = k; j <= n; j++) {
        prosirena[i][j] -= faktor * prosirena[k][j]
      }
    }
  }

  // ---- Povratna supstitucija ----
  // Kreće od posljednje jednadžbe i rješava prema prvoj
  const x: Vector = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let suma = prosirena[i][n]
    for (let j = i + 1; j < n; j++) {
      suma -= prosirena[i][j] * x[j]
    }
    x[i] = suma / prosirena[i][i]
  }

  return x
}

// ============================================================================
//  Osnovne matrične operacije
// ============================================================================

/**
 * Kreira jediničnu (identitet) matricu dimenzije n×n.
 *
 * Jedinična matrica ima 1 na glavnoj dijagonali i 0 svugdje drugdje:
 *   | 1  0  0 |
 *   | 0  1  0 |
 *   | 0  0  1 |
 *
 * @param n - dimenzija matrice
 * @returns jedinična matrica I(n×n)
 */
export function jedinicanMatrica(n: number): Matrix {
  const I: Matrix = []
  for (let i = 0; i < n; i++) {
    I[i] = new Array(n).fill(0)
    I[i][i] = 1
  }
  return I
}

/**
 * Množi dvije matrice: C = A · B
 *
 * Dimenzije: A(m×p) · B(p×n) = C(m×n)
 * Element Cᵢⱼ = Σₖ Aᵢₖ · Bₖⱼ  (za k od 0 do p-1)
 *
 * @param A - prva matrica (m×p)
 * @param B - druga matrica (p×n)
 * @returns rezultat množenja C (m×n)
 */
export function pomnozMatrice(A: Matrix, B: Matrix): Matrix {
  const redoviA = A.length
  const kolonaA = A[0].length
  const kolonaB = B[0].length

  const rezultat: Matrix = []
  for (let i = 0; i < redoviA; i++) {
    rezultat[i] = new Array(kolonaB).fill(0)
    for (let j = 0; j < kolonaB; j++) {
      for (let k = 0; k < kolonaA; k++) {
        rezultat[i][j] += A[i][k] * B[k][j]
      }
    }
  }

  return rezultat
}

/**
 * Transponuje matricu: zamjenjuje redove i kolone.
 *
 * Ako je A dimenzije m×n, tada je Aᵀ dimenzije n×m.
 * Element (Aᵀ)ᵢⱼ = Aⱼᵢ
 *
 * Primjer:
 *   | 1  2  3 |ᵀ    | 1  4 |
 *   | 4  5  6 |   =  | 2  5 |
 *                     | 3  6 |
 *
 * @param A - ulazna matrica (m×n)
 * @returns transponovana matrica Aᵀ (n×m)
 */
export function transponujMatricu(A: Matrix): Matrix {
  const redovi = A.length
  const kolone = A[0].length
  const rezultat: Matrix = []

  for (let j = 0; j < kolone; j++) {
    rezultat[j] = []
    for (let i = 0; i < redovi; i++) {
      rezultat[j][i] = A[i][j]
    }
  }

  return rezultat
}

// ============================================================================
//  Vandermondeova matrica
// ============================================================================

/**
 * Kreira Vandermondeovu matricu za polinomno prilagođavanje.
 *
 * Za niz x-vrijednosti i stepen d, matrica V ima oblik:
 *   | 1  x₁  x₁²  ...  x₁ᵈ |
 *   | 1  x₂  x₂²  ...  x₂ᵈ |
 *   | ...                     |
 *   | 1  xₙ  xₙ²  ...  xₙᵈ |
 *
 * Dimenzija: n × (d+1), gdje je n broj tačaka, d stepen polinoma.
 *
 * Koristi se u:
 *   - Polinomnoj aproksimaciji (MNK): VᵀV · a = Vᵀy
 *   - Direktnoj interpolaciji: V · a = y
 *
 * @param x      - niz x-koordinata podatkovnih tačaka
 * @param stepen - stepen željenog polinoma
 * @returns Vandermondeova matrica V (n × (stepen+1))
 */
export function vandermondeMatrica(x: number[], stepen: number): Matrix {
  const n = x.length
  const V: Matrix = []

  for (let i = 0; i < n; i++) {
    V[i] = []
    for (let j = 0; j <= stepen; j++) {
      V[i][j] = Math.pow(x[i], j)
    }
  }

  return V
}

// ============================================================================
//  LaTeX formatiranje
// ============================================================================

/**
 * Formatira matricu u LaTeX zapis koristeći bmatrix okruženje.
 *
 * Primjer izlaza za matricu [[1,2],[3,4]]:
 *   \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}
 *
 * @param A         - matrica za formatiranje
 * @param preciznost - broj decimalnih mjesta (podrazumijevano 4)
 * @returns LaTeX string reprezentacija matrice
 */
export function matricaULatex(A: Matrix, preciznost: number = 4): string {
  const redovi = A.map((red) =>
    red.map((vrijednost) => formatirajBroj(vrijednost, preciznost)).join(' & ')
  ).join(' \\\\ ')

  return `\\begin{bmatrix} ${redovi} \\end{bmatrix}`
}

/**
 * Formatira vektor u LaTeX zapis kao vektor-kolonu (bmatrix).
 *
 * Primjer izlaza za vektor [1, 2, 3]:
 *   \begin{bmatrix} 1 \\ 2 \\ 3 \end{bmatrix}
 *
 * @param v         - vektor za formatiranje
 * @param preciznost - broj decimalnih mjesta (podrazumijevano 4)
 * @returns LaTeX string reprezentacija vektora
 */
export function vektorULatex(v: Vector, preciznost: number = 4): string {
  const redovi = v.map((vrijednost) => formatirajBroj(vrijednost, preciznost)).join(' \\\\ ')
  return `\\begin{bmatrix} ${redovi} \\end{bmatrix}`
}

/**
 * Formatira broj za prikaz sa zadanom preciznošću.
 *
 * Pravila formatiranja:
 *   - NaN ili Infinity → "0"
 *   - Vrlo mali brojevi (< 1e-10) → "0"
 *   - Cijeli brojevi → bez decimalnog dijela (npr. 5.0000 → "5")
 *   - Ostalo → prikaži sa zadanim brojem decimala, ukloni trailing nule
 *
 * Primjeri:
 *   formatirajBroj(3.14159, 2) → "3.14"
 *   formatirajBroj(5.0, 4)     → "5"
 *   formatirajBroj(0.00001, 4) → "0"
 *
 * @param n         - broj ili string za formatiranje
 * @param preciznost - maksimalan broj decimalnih mjesta (podrazumijevano 4)
 * @returns formatirani string
 */
export function formatirajBroj(n: number | string, preciznost: number = 4): string {
  const broj = typeof n === 'number' ? n : Number(n)
  if (isNaN(broj) || !isFinite(broj)) return '0'
  if (Math.abs(broj) < 1e-10) return '0'
  if (Math.abs(broj - Math.round(broj)) < 1e-10) return Math.round(broj).toString()
  return broj.toFixed(preciznost).replace(/\.?0+$/, '')
}

// ============================================================================
//  Determinanta i minor
// ============================================================================

/**
 * Izračunava determinantu matrice rekurzivnom ekspanzijom po prvom redu
 * (Laplaceov razvoj).
 *
 * Za male matrice koristi direktne formule:
 *   - 1×1: det = a₁₁
 *   - 2×2: det = a₁₁·a₂₂ - a₁₂·a₂₁
 *   - n×n: det = Σⱼ (-1)ʲ · a₁ⱼ · det(Mᵢⱼ)
 *
 * NAPOMENA: Ova metoda ima složenost O(n!) i pogodna je samo za male
 * matrice (do ~10×10). Za veće matrice koristiti LU dekompoziciju.
 *
 * @param A - kvadratna matrica (n×n)
 * @returns determinanta matrice
 */
export function determinanta(A: Matrix): number {
  const n = A.length
  if (n === 1) return A[0][0]
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0]

  let det = 0
  for (let j = 0; j < n; j++) {
    det += Math.pow(-1, j) * A[0][j] * determinanta(minorMatrica(A, 0, j))
  }
  return det
}

/**
 * Vraća minor matrice — podmatricu nastalu brisanjem zadanog reda i kolone.
 *
 * Koristi se pri izračunavanju determinante Laplaceovim razvojem.
 *
 * Primjer: za matricu 3×3 i brisanje reda 0, kolone 1:
 *   | 1  2  3 |        | 4  6 |
 *   | 4  5  6 |  →     | 7  9 |
 *   | 7  8  9 |
 *
 * @param A     - ulazna matrica
 * @param red   - indeks reda za brisanje
 * @param kolona - indeks kolone za brisanje
 * @returns podmatrica bez zadanog reda i kolone
 */
export function minorMatrica(A: Matrix, red: number, kolona: number): Matrix {
  return A.filter((_, i) => i !== red).map((r) =>
    r.filter((_, j) => j !== kolona)
  )
}

// ============================================================================
//  Normalne jednadžbe za metodu najmanjih kvadrata (MNK)
// ============================================================================

/**
 * Kreira matricu normalnih jednadžbi za MNK: AᵀA
 *
 * U metodi najmanjih kvadrata, sistem Ax = b se rješava pomoću
 * normalnih jednadžbi: (AᵀA)x = Aᵀb
 *
 * Matrica AᵀA je uvijek simetrična i pozitivno semidefinitna.
 *
 * @param A - matrica sistema (obično Vandermondeova matrica)
 * @returns matrica AᵀA
 */
export function matricaNormalnihJednadzbi(A: Matrix): Matrix {
  const At = transponujMatricu(A)
  return pomnozMatrice(At, A)
}

/**
 * Kreira vektor normalnih jednadžbi za MNK: Aᵀb
 *
 * Ovo je desna strana normalnih jednadžbi (AᵀA)x = Aᵀb.
 *
 * @param A - matrica sistema (obično Vandermondeova matrica)
 * @param b - vektor mjerenih vrijednosti (y-koordinate tačaka)
 * @returns vektor Aᵀb
 */
export function vektorNormalnihJednadzbi(A: Matrix, b: Vector): Vector {
  const At = transponujMatricu(A)
  const rezultat: Vector = []

  for (let i = 0; i < At.length; i++) {
    let suma = 0
    for (let j = 0; j < At[i].length; j++) {
      suma += At[i][j] * b[j]
    }
    rezultat[i] = suma
  }

  return rezultat
}

// ============================================================================
//  Pomoćne funkcije za prikaz koraka rješavanja
// ============================================================================

/**
 * Formatira proširenu matricu [A|b] u LaTeX zapis.
 */
export function prosirenaMatricaULatex(A: Matrix, b: Vector, preciznost: number = 4): string {
  const cols = A[0].length
  const colSpec = 'c'.repeat(cols) + '|c'
  const redovi = A.map((red, i) =>
    [...red.map((v) => formatirajBroj(v, preciznost)), formatirajBroj(b[i], preciznost)].join(' & ')
  ).join(' \\\\ ')
  return `\\left[\\begin{array}{${colSpec}} ${redovi} \\end{array}\\right]`
}

// ============================================================================
//  Gaussova eliminacija sa koracima
// ============================================================================

export function gaussSaKoracima(
  A: Matrix, b: Vector, preciznost: number = 4, t?: StepTranslations
): { rjesenje: Vector; koraci: string[] } {
  const n = A.length
  const koraci: string[] = []

  // Kreiranje proširene matrice
  const aug: number[][] = A.map((red, i) => [...red, b[i]])

  koraci.push(`\\text{${t?.gaussElimination || 'Gauss Elimination with Partial Pivoting'}}`)
  koraci.push(`\\text{${t?.augmentedMatrix || 'Augmented matrix [A|b]:'}}`)
  koraci.push(prosirenaMatricaULatex(A, b, preciznost))

  // Direktna eliminacija
  for (let k = 0; k < n; k++) {
    // Parcijalno pivotiranje
    let maxRed = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > Math.abs(aug[maxRed][k])) {
        maxRed = i
      }
    }

    if (maxRed !== k) {
      ;[aug[k], aug[maxRed]] = [aug[maxRed], aug[k]]
      koraci.push(`\\text{${t?.rowSwap || 'Swap rows'} } R_{${k + 1}} \\leftrightarrow R_{${maxRed + 1}}`)
    }

    if (Math.abs(aug[k][k]) < 1e-10) {
      throw new Error('Matrica je singularna ili skoro singularna')
    }

    // Eliminacija ispod pivota
    for (let i = k + 1; i < n; i++) {
      const faktor = aug[i][k] / aug[k][k]
      if (Math.abs(faktor) < 1e-15) continue

      for (let j = k; j <= n; j++) {
        aug[i][j] -= faktor * aug[k][j]
      }
      koraci.push(
        `\\text{${t?.eliminationStep || 'Elimination step'}: } R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${formatirajBroj(faktor, preciznost)}) \\cdot R_{${k + 1}}`
      )
    }

    // Prikaz trenutnog stanja matrice nakon svakog koraka eliminacije
    const trenutnaA = aug.map((r) => r.slice(0, n))
    const trenutnaB = aug.map((r) => r[n])
    koraci.push(prosirenaMatricaULatex(trenutnaA, trenutnaB, preciznost))
  }

  koraci.push(`\\text{${t?.upperTriangularForm || 'Upper triangular form:'}}`)
  const gornjA = aug.map((r) => r.slice(0, n))
  const gornjB = aug.map((r) => r[n])
  koraci.push(prosirenaMatricaULatex(gornjA, gornjB, preciznost))

  // Povratna supstitucija
  koraci.push(`\\text{${t?.backSubstitution || 'Back substitution:'}}`)
  const x: Vector = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let suma = aug[i][n]
    const dijelovi: string[] = [formatirajBroj(aug[i][n], preciznost)]
    for (let j = i + 1; j < n; j++) {
      suma -= aug[i][j] * x[j]
      if (Math.abs(aug[i][j]) > 1e-15) {
        dijelovi.push(`(${formatirajBroj(aug[i][j], preciznost)}) \\cdot (${formatirajBroj(x[j], preciznost)})`)
      }
    }
    x[i] = suma / aug[i][i]

    if (dijelovi.length > 1) {
      koraci.push(
        `a_{${i}} = \\frac{${dijelovi[0]} - ${dijelovi.slice(1).join(' - ')}}{${formatirajBroj(aug[i][i], preciznost)}} = ${formatirajBroj(x[i], preciznost)}`
      )
    } else {
      koraci.push(
        `a_{${i}} = \\frac{${dijelovi[0]}}{${formatirajBroj(aug[i][i], preciznost)}} = ${formatirajBroj(x[i], preciznost)}`
      )
    }
  }

  return { rjesenje: x, koraci }
}

// ============================================================================
//  Gauss-Jordan eliminacija sa koracima (RREF)
// ============================================================================

export function gaussJordanSaKoracima(
  A: Matrix, b: Vector, preciznost: number = 4, t?: StepTranslations
): { rjesenje: Vector; koraci: string[] } {
  const n = A.length
  const koraci: string[] = []

  // Kreiranje proširene matrice
  const aug: number[][] = A.map((red, i) => [...red, b[i]])

  koraci.push(`\\text{${t?.gaussJordan || 'Gauss-Jordan Elimination'}}`)
  koraci.push(`\\text{${t?.augmentedMatrix || 'Augmented matrix [A|b]:'}}`)
  koraci.push(prosirenaMatricaULatex(A, b, preciznost))

  // Direktna eliminacija sa pivotiranjem i normalizacijom
  for (let k = 0; k < n; k++) {
    // Parcijalno pivotiranje
    let maxRed = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > Math.abs(aug[maxRed][k])) {
        maxRed = i
      }
    }

    if (maxRed !== k) {
      ;[aug[k], aug[maxRed]] = [aug[maxRed], aug[k]]
      koraci.push(`\\text{${t?.rowSwap || 'Swap rows'} } R_{${k + 1}} \\leftrightarrow R_{${maxRed + 1}}`)
    }

    if (Math.abs(aug[k][k]) < 1e-10) {
      throw new Error('Matrica je singularna ili skoro singularna')
    }

    // Normalizacija pivot reda
    const pivot = aug[k][k]
    if (Math.abs(pivot - 1) > 1e-15) {
      for (let j = k; j <= n; j++) {
        aug[k][j] /= pivot
      }
      koraci.push(
        `\\text{${t?.normalizeRow || 'Normalize row'}: } R_{${k + 1}} \\leftarrow \\frac{1}{${formatirajBroj(pivot, preciznost)}} \\cdot R_{${k + 1}}`
      )
    }

    // Eliminacija ispod pivota
    for (let i = k + 1; i < n; i++) {
      const faktor = aug[i][k]
      if (Math.abs(faktor) < 1e-15) continue

      for (let j = k; j <= n; j++) {
        aug[i][j] -= faktor * aug[k][j]
      }
      koraci.push(
        `\\text{${t?.eliminationStep || 'Elimination step'}: } R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${formatirajBroj(faktor, preciznost)}) \\cdot R_{${k + 1}}`
      )
    }

    // Prikaz trenutnog stanja
    const trenutnaA = aug.map((r) => r.slice(0, n))
    const trenutnaB = aug.map((r) => r[n])
    koraci.push(prosirenaMatricaULatex(trenutnaA, trenutnaB, preciznost))
  }

  // Eliminacija iznad pivota (backward elimination) za RREF
  koraci.push(`\\text{${t?.eliminateAbove || 'Eliminate above pivot'}}`)

  for (let k = n - 1; k >= 1; k--) {
    for (let i = k - 1; i >= 0; i--) {
      const faktor = aug[i][k]
      if (Math.abs(faktor) < 1e-15) continue

      for (let j = k; j <= n; j++) {
        aug[i][j] -= faktor * aug[k][j]
      }
      koraci.push(
        `R_{${i + 1}} \\leftarrow R_{${i + 1}} - (${formatirajBroj(faktor, preciznost)}) \\cdot R_{${k + 1}}`
      )
    }
  }

  koraci.push(`\\text{${t?.reducedRowEchelonForm || 'Reduced row echelon form:'}}`)
  const rrefA = aug.map((r) => r.slice(0, n))
  const rrefB = aug.map((r) => r[n])
  koraci.push(prosirenaMatricaULatex(rrefA, rrefB, preciznost))

  // Rješenje je posljednja kolona
  const x: Vector = aug.map((r) => r[n])

  return { rjesenje: x, koraci }
}

// ============================================================================
//  LU faktorizacija (Doolittle) sa koracima
// ============================================================================

export function luDoolittleSaKoracima(
  A: Matrix, b: Vector, preciznost: number = 4, t?: StepTranslations
): { rjesenje: Vector; koraci: string[] } {
  const n = A.length
  const koraci: string[] = []

  koraci.push(`\\text{${t?.luFactorization || 'LU Factorization (Doolittle)'}}`)
  koraci.push(`\\text{${t?.luDecomposition || 'LU Decomposition:'}} \\quad A = L \\cdot U`)

  // Inicijalizacija L i U
  const L: Matrix = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  )
  const U: Matrix = Array.from({ length: n }, () => new Array(n).fill(0))

  // Doolittle algoritam
  for (let i = 0; i < n; i++) {
    // Izračunaj elemente U-a u i-tom redu
    for (let j = i; j < n; j++) {
      let suma = 0
      for (let k = 0; k < i; k++) {
        suma += L[i][k] * U[k][j]
      }
      U[i][j] = A[i][j] - suma
    }

    // Izračunaj elemente L-a u i-toj koloni
    for (let j = i + 1; j < n; j++) {
      let suma = 0
      for (let k = 0; k < i; k++) {
        suma += L[j][k] * U[k][i]
      }
      if (Math.abs(U[i][i]) < 1e-10) {
        throw new Error('LU dekompozicija nije moguća (pivot je nula)')
      }
      L[j][i] = (A[j][i] - suma) / U[i][i]
    }

    // Prikaži korak dekompozicije
    if (i < n - 1) {
      koraci.push(`\\text{${t?.eliminationStep || 'Step'} } k = ${i + 1}:`)
      koraci.push(`L = ${matricaULatex(L, preciznost)}, \\quad U = ${matricaULatex(U, preciznost)}`)
    }
  }

  koraci.push(`\\text{${t?.lMatrix || 'Lower triangular matrix L:'}}`)
  koraci.push(`L = ${matricaULatex(L, preciznost)}`)
  koraci.push(`\\text{${t?.uMatrix || 'Upper triangular matrix U:'}}`)
  koraci.push(`U = ${matricaULatex(U, preciznost)}`)

  // Direktna supstitucija: Ly' = b
  koraci.push(`\\text{${t?.solvingLy || "Solving Ly' = b:"}}`)
  const yp: Vector = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let suma = b[i]
    const dijelovi: string[] = [formatirajBroj(b[i], preciznost)]
    for (let j = 0; j < i; j++) {
      suma -= L[i][j] * yp[j]
      if (Math.abs(L[i][j]) > 1e-15) {
        dijelovi.push(`(${formatirajBroj(L[i][j], preciznost)}) \\cdot (${formatirajBroj(yp[j], preciznost)})`)
      }
    }
    yp[i] = suma // L[i][i] = 1 u Doolittle

    if (dijelovi.length > 1) {
      koraci.push(
        `y'_{${i}} = ${dijelovi[0]} - ${dijelovi.slice(1).join(' - ')} = ${formatirajBroj(yp[i], preciznost)}`
      )
    } else {
      koraci.push(`y'_{${i}} = ${formatirajBroj(yp[i], preciznost)}`)
    }
  }

  // Povratna supstitucija: Ux = y'
  koraci.push(`\\text{${t?.solvingUx || "Solving Ux = y':"}}`)
  const x: Vector = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let suma = yp[i]
    const dijelovi: string[] = [formatirajBroj(yp[i], preciznost)]
    for (let j = i + 1; j < n; j++) {
      suma -= U[i][j] * x[j]
      if (Math.abs(U[i][j]) > 1e-15) {
        dijelovi.push(`(${formatirajBroj(U[i][j], preciznost)}) \\cdot (${formatirajBroj(x[j], preciznost)})`)
      }
    }
    x[i] = suma / U[i][i]

    if (dijelovi.length > 1) {
      koraci.push(
        `a_{${i}} = \\frac{${dijelovi[0]} - ${dijelovi.slice(1).join(' - ')}}{${formatirajBroj(U[i][i], preciznost)}} = ${formatirajBroj(x[i], preciznost)}`
      )
    } else {
      koraci.push(
        `a_{${i}} = \\frac{${dijelovi[0]}}{${formatirajBroj(U[i][i], preciznost)}} = ${formatirajBroj(x[i], preciznost)}`
      )
    }
  }

  return { rjesenje: x, koraci }
}
