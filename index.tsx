import { h, render, Fragment, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

function makeGrid(size: number) {
  let result: string[][] = [];
  for (var i = 0; i < size; i++) {
    result[i] = [];
    for (var j = 0; j < size; j++) {
      result[i].push('E');
    }
  }
  return result;
}

export default function Comp(): any {
  let [sqSize, setSqSize] = useState(4);
  let [square, setSquare] = useState<string[][]>([]);

  let handleSquareSizeChange: any =
    (e: any) => {
      let newSquareSize = e.target.value;
      if (newSquareSize % 2 != 0) {
        console.error("square size should be multiple of 2");
        return;
      }
      setSqSize(newSquareSize);
    };

  let squareCellChanged = (rowIndex: number, cellIndex: number) => {
    let presentValue = square[rowIndex][cellIndex];
    let newValue = cycleCellForward(presentValue);
    setSquare(present => {
      present[rowIndex][cellIndex] = newValue;
      return [...present];
    });
  };

  let cycleCellForward = (cellValue: string) => {
    switch (cellValue) {
      case 'E':
        return 'B';
      case 'W':
        return 'E';
      case 'B':
        return 'W';
      default:
        console.error('The value entered is incorrect: "' + cellValue + '"');
        return cellValue;
    }
  };

  let cellOpposite = (cellValue: string) => {
    switch (cellValue) {
      case 'E':
        return cellValue;
      case 'W':
        return 'B';
      case 'B':
        return 'W';
      default:
        return cellValue;
    }
  };

  let getClassNameForCell = (cell: string) => {
    switch (cell) {
      case 'E':
        return 'cell cell_empty';
      case 'W':
        return 'cell cell_white';
      case 'B':
        return 'cell cell_black';
      default:
        return 'cell cell_error';
    }
  };

  useEffect(() => {
    console.log("sqSize changed");
    setSquare(makeGrid(sqSize));
  }, [sqSize]);

  let resetClicked = () => {
    setSquare(makeGrid(sqSize));
  };

  let solveClicked = () => {
    console.log("Solving");

    let rowWiseCount: { w: number, b: number }[] = [];
    let colWiseCount: { w: number, b: number }[] = [];
    for (let i = 0; i < sqSize; i++) {
      rowWiseCount.push({ w: 0, b: 0 });
      colWiseCount.push({ w: 0, b: 0 });
    }

    for (let i = 0; i < square.length; i++) {
      for (let j = 0; j < sqSize; j++) {
        let cellValue = square[i][j];
        rowWiseFiller(square, i, j);
        columnWiseFiller(square, j, i);
        updateRowAndColumnCount(
          square[i][j], i, j, rowWiseCount, colWiseCount);
      }
    }
    console.log(rowWiseCount, colWiseCount);

    for (let i = 0; i < sqSize; i++) {
      let row = rowWiseCount[i];
      let col = colWiseCount[i];
      let rowFull = row.b + row.w == sqSize;
      let colFull = col.b + col.w == sqSize;
      if (!rowFull) {
        if (row.w == (sqSize / 2)) {
          console.log("Row " + i + " is white complete. Fill B");
          fillRow(square, i, 'B');
        } else if (row.b == (sqSize / 2)) {
          console.log("Row " + i + " is black complete. Fill W");
          fillRow(square, i, 'W');
        }
      }
      if (!colFull) {
        if (col.w == sqSize / 2) {
          console.log("Col " + i + " is white complete. Fill B");
          fillColumn(square, i, 'B');
        } else if (col.b == sqSize / 2) {
          console.log("Col " + i + " is black complete. Fill W");
          fillColumn(square, i, 'W');
        }
      }
    }
    setSquare([...square]);
  };

  let fillRow = (
    square: string[][],
    index: number,
    colour: string
  ) => {
    let row = square[index];
    row.forEach((value, i) => {
      if (row[i] == 'E') {
        row[i] = colour;
      }
    });
  }

  let fillColumn = (
    square: string[][],
    index: number,
    colour: string
  ) => {
    for (let i = 0; i < square.length; i++) {
      if (square[i][index] == 'E') {
        square[i][index] = colour;
      }
    }
  }

  let columnWiseFiller = (
    square: string[][],
    j: number,
    i: number
  ) => {
    const getCol = (p: number) => square[p][j];
    if (getCol(i) != 'E') {
      return;
    }

    /*
        Check if in this column previous and next row are same
        State:
        1. [W]
        2. [E]
        3. [W]
      */
    if (i > 0 &&
      i < sqSize - 1 &&
      getCol(i - 1) != 'E' &&
      getCol(i - 1) == getCol(i + 1)) {
      square[i][j] = cellOpposite(getCol(i - 1));
    }
    if (i < sqSize - 2) {
      /*
        Check if in this column previous and next row are same
        State:
        1. [E]
        2. [W]
        3. [W]
      */
      if (getCol(i + 1) != 'E' &&
        getCol(i + 1) == getCol(i + 2)) {
        square[i][j] = cellOpposite(getCol(i + 1));
      }
    } else if (i >= 2 &&
      /*
        Check if in this column previous and next row are same
        State:
        1. [W]
        2. [W]
        3. [E]
      */
      getCol(i - 1) != 'E' &&
      getCol(i - 1) == getCol(i - 2)) {
      square[i][j] = cellOpposite(getCol(i - 1));
    }
  }

  let rowWiseFiller = (
    square: string[][],
    i: number,
    j: number
  ) => {
    const row = square[i];
    if (row[j] != 'E') {
      return;
    }

    /*
      Check if in this rows previous and next column are same
      State: [W E W]
    */
    if (j > 0 &&
      j < sqSize - 1 &&
      row[j - 1] != 'E' &&
      row[j - 1] == row[j + 1]) {
      square[i][j] = cellOpposite(row[j - 1]);
    }
    if (j < sqSize - 2) {
      /*
        Check if in this row and it previous cell are same
        State: [E W W]
      */
      if (row[j + 1] != 'E' &&
        row[j + 1] == row[j + 2]) {
        square[i][j] = cellOpposite(row[j + 1]);
      }
    } else if (j >= 2 &&
      /*
        Check if in this row and it previous cell are same
        State: [W W E]
      */
      row[j - 1] != 'E' &&
      row[j - 1] == row[j - 2]) {
      square[i][j] = cellOpposite(row[j - 1]);
    }
  }

  let updateRowAndColumnCount = (
    cellValue: string,
    i: number,
    j: number,
    rowCount: { w: number; b: number; }[],
    columnCount: { w: number; b: number; }[]
  ) => {
    console.log([cellValue, i, j, rowCount, columnCount]);
    if (cellValue == 'W') {
      rowCount[i].w = rowCount[i].w + 1;
      columnCount[j].w = columnCount[j].w + 1;
    } else if (cellValue == 'B') {
      rowCount[i].b = rowCount[i].b + 1;
      columnCount[j].b = columnCount[j].b + 1;
    }
  }

  return <>
    <div>
      <div>
        <label>Enter the columns in square:</label>
        <input value={sqSize} onChange={handleSquareSizeChange} />
      </div>
      <div>
        {square.length > 2 && square.map((row, rowIndex) =>
          <div class='row'>
            {row.map((cell, cellIndex) =>
              <div
                className={getClassNameForCell(cell)}
                onClick={() => squareCellChanged(rowIndex, cellIndex)}
              >
              </div>
            )}
          </div>
        )}
        {
          square.length <= 2 &&
          <div>The size of square is too small.</div>
        }
      </div>
      <div>
        <input type="button" value="Solve" onClick={e => solveClicked()} />
        <input type="button" value="Reset" onClick={e => resetClicked()} />
      </div>
    </div>
  </>
}





let el: any = document.getElementById("show-app");
render(<Comp />, el);
