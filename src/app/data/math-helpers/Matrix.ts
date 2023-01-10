import * as math from 'mathjs';

export default class Matrix {
  elements: Array<Array<number>> = [];
  constructor(components: Array<Array<number>>) {
    this.elements = components;
  }
  get numberOfRows(){
    return this.elements.length;
  }
  get numberOfColumns(){
    return this.elements[0].length;
  }
  static getColumnVectorFromArray(array: Array<number>){
    return (new Matrix([array]).transpose())
  }
  asVector(){
    if(this.numberOfColumns > 1){
      throw Error("Trying to convert a matrix with more than one row to a vector!")
    }
    else{
      return this.transpose().elements[0];
    }
  }
  element(row: number, column: number){
    let element = this.elements[row][column];
    if(element == undefined){
      throw RangeError("Tried accessing an element in the matrix that is not filled!")
    }
    return this.elements[row][column]!;
  }
  set(row: number, column: number, value: number){
    this.elements[row][column] = value;
  }
  static identity(dim: number) {
    let components: Array<Array<number>> = [];
    for (let i = 0; i < dim; ++i) {
      let column = [];
      for (let j = 0; j < dim; ++j) {
        if (j == i) {
          column.push(1);
        } else {
          column.push(0);
        }
      }
      components.push(column);
    }
    return new Matrix(components);
  }
  static filledWithConstant(rows: number, columns: number, constant: number){
    let components: Array<Array<number>> = [];
    for (let rowCounter = 0; rowCounter < rows; ++rowCounter) {
      let column = [];
      for (let columnCounter = 0; columnCounter < columns; ++columnCounter) {
        column.push(constant);
      }
      components.push(column);
    }
    return new Matrix(components);
  }
  static zero(rows: number, columns: number){
    return this.filledWithConstant(rows, columns, 0);
  }
  invert() {
    return new Matrix(math.inv(this.elements));
  }
  multiply(other: Matrix) {
    let a = this.elements;
    let b = other.elements;
    let aNumRows = a.length,
      aNumCols = a[0].length;
    let bNumRows = b.length,
      bNumCols = b[0].length,
      m = new Array(aNumRows); // initialize array of rows
    for (var r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols); // initialize the current row
      for (var c = 0; c < bNumCols; ++c) {
        m[r][c] = 0; // initialize the current cell
        for (var i = 0; i < aNumCols; ++i) {
          m[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return new Matrix(m);
  }
  add(other: Matrix) {
    let newComponents: Array<Array<number>> = [];
    let rowIndex = 0;
    let columnIndex = 0;
    for (let row of this.elements) {
      let column = [];
      for (let element of row) {
        column.push(element + other.elements[rowIndex][columnIndex]);
        columnIndex += 1;
      }
      newComponents.push(column);
      rowIndex += 1;
      columnIndex = 0;
    }
    return new Matrix(newComponents);
  }
  scalarMultiply(scalar: number) {
    let newComponents: Array<Array<number>> = [];
    let rowIndex = 0;
    let columnIndex = 0;
    for (let row of this.elements) {
      let column = [];
      for (let element of row) {
        column.push(element * scalar);
        columnIndex += 1;
      }
      newComponents.push(column);
      rowIndex += 1;
      columnIndex = 0;
    }
    return new Matrix(newComponents);
  }
  transpose() {
    let numberOfRows = this.elements.length;
    let numberOfColumns = this.elements[0].length;
    let newMatrixComponents: Array<Array<number>> = [];
    for (let i = 0; i < numberOfColumns; i++) {
      newMatrixComponents.push([]);
    }

    for (let i = 0; i < numberOfColumns; i++) {
      for (let j = 0; j < numberOfRows; j++) {
        newMatrixComponents[i].push(this.elements[j][i]);
      }
    }
    return new Matrix(newMatrixComponents);
  }
}
