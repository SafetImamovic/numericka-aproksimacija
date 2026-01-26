import type { Matrix, Vector } from '@/lib/types'

/**
 * Solve a system of linear equations Ax = b using Gaussian elimination with partial pivoting
 */
export function solveLinearSystem(A: Matrix, b: Vector): Vector {
  const n = A.length

  // Create augmented matrix
  const aug: Matrix = A.map((row, i) => [...row, b[i]])

  // Forward elimination with partial pivoting
  for (let k = 0; k < n; k++) {
    // Find pivot
    let maxRow = k
    for (let i = k + 1; i < n; i++) {
      if (Math.abs(aug[i][k]) > Math.abs(aug[maxRow][k])) {
        maxRow = i
      }
    }

    // Swap rows
    ;[aug[k], aug[maxRow]] = [aug[maxRow], aug[k]]

    // Check for singular matrix
    if (Math.abs(aug[k][k]) < 1e-10) {
      throw new Error('Matrix is singular or nearly singular')
    }

    // Eliminate column
    for (let i = k + 1; i < n; i++) {
      const factor = aug[i][k] / aug[k][k]
      for (let j = k; j <= n; j++) {
        aug[i][j] -= factor * aug[k][j]
      }
    }
  }

  // Back substitution
  const x: Vector = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = aug[i][n]
    for (let j = i + 1; j < n; j++) {
      sum -= aug[i][j] * x[j]
    }
    x[i] = sum / aug[i][i]
  }

  return x
}

/**
 * Create an identity matrix of size n
 */
export function identityMatrix(n: number): Matrix {
  const I: Matrix = []
  for (let i = 0; i < n; i++) {
    I[i] = new Array(n).fill(0)
    I[i][i] = 1
  }
  return I
}

/**
 * Multiply two matrices
 */
export function multiplyMatrices(A: Matrix, B: Matrix): Matrix {
  const rowsA = A.length
  const colsA = A[0].length
  const colsB = B[0].length

  const result: Matrix = []
  for (let i = 0; i < rowsA; i++) {
    result[i] = new Array(colsB).fill(0)
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j]
      }
    }
  }

  return result
}

/**
 * Transpose a matrix
 */
export function transposeMatrix(A: Matrix): Matrix {
  const rows = A.length
  const cols = A[0].length
  const result: Matrix = []

  for (let j = 0; j < cols; j++) {
    result[j] = []
    for (let i = 0; i < rows; i++) {
      result[j][i] = A[i][j]
    }
  }

  return result
}

/**
 * Create a Vandermonde matrix for polynomial fitting
 */
export function vandermondeMatrix(x: number[], degree: number): Matrix {
  const n = x.length
  const V: Matrix = []

  for (let i = 0; i < n; i++) {
    V[i] = []
    for (let j = 0; j <= degree; j++) {
      V[i][j] = Math.pow(x[i], j)
    }
  }

  return V
}

/**
 * Format a matrix as a LaTeX string
 */
export function matrixToLatex(A: Matrix, precision: number = 4): string {
  const rows = A.map((row) =>
    row.map((val) => formatNumber(val, precision)).join(' & ')
  ).join(' \\\\ ')

  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`
}

/**
 * Format a vector as a LaTeX column vector
 */
export function vectorToLatex(v: Vector, precision: number = 4): string {
  const rows = v.map((val) => formatNumber(val, precision)).join(' \\\\ ')
  return `\\begin{bmatrix} ${rows} \\end{bmatrix}`
}

/**
 * Format a number for display
 */
export function formatNumber(n: any, precision: number = 4): string {
  const num = typeof n === 'number' ? n : Number(n)
  if (isNaN(num) || !isFinite(num)) return '0'
  if (Math.abs(num) < 1e-10) return '0'
  if (Math.abs(num - Math.round(num)) < 1e-10) return Math.round(num).toString()
  return num.toFixed(precision).replace(/\.?0+$/, '')
}

/**
 * Calculate the determinant of a matrix (for small matrices)
 */
export function determinant(A: Matrix): number {
  const n = A.length
  if (n === 1) return A[0][0]
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0]

  let det = 0
  for (let j = 0; j < n; j++) {
    det += Math.pow(-1, j) * A[0][j] * determinant(minor(A, 0, j))
  }
  return det
}

/**
 * Get the minor of a matrix (matrix with row i and column j removed)
 */
function minor(A: Matrix, row: number, col: number): Matrix {
  return A.filter((_, i) => i !== row).map((r) =>
    r.filter((_, j) => j !== col)
  )
}

/**
 * Create the normal equations matrix for least squares: A^T * A
 */
export function normalEquationsMatrix(A: Matrix): Matrix {
  const At = transposeMatrix(A)
  return multiplyMatrices(At, A)
}

/**
 * Create the normal equations vector for least squares: A^T * b
 */
export function normalEquationsVector(A: Matrix, b: Vector): Vector {
  const At = transposeMatrix(A)
  const result: Vector = []

  for (let i = 0; i < At.length; i++) {
    let sum = 0
    for (let j = 0; j < At[i].length; j++) {
      sum += At[i][j] * b[j]
    }
    result[i] = sum
  }

  return result
}
