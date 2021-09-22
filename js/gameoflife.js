/**
 * @param {...any} 
 * @returns {any[]}
 */
function seed() { return Array.prototype.slice.call(arguments); }

/**
 * @param {[number, number]} param0 
 * @param {[number, number]} param1 
 * @returns {boolean}
 */
function same([x, y], [j, k]) { return x === j && y === k; }

// The game state to search for `cell` is passed as the `this` value of the function.
/**
 * @this {[number,number][]}
 * @param {[number,number]} cell 
 * @returns {boolean}
 */
function contains(cell) {
  return this.some(myCell => same(cell, myCell));
}

/**
 * @param {[number, number]} cell 
 * @param {[number, number][]} state 
 * @returns {string}
 */
const printCell = (cell, state) => {
  if (contains.call(state, cell)) {
    return '\u25A3';
  }
  return '\u25A2';
};

/**
 * @param {[number,number][]} state 
 * @returns {{ bottomLeft: [number, number], topRight: [number, number] }}
 */
const corners = (state = []) => {
  if (state.length === 0) {
    return {
      bottomLeft: [0, 0],
      topRight: [0, 0]
    };
  }
  const minX = Math.min(...state.map(([x]) => x));
  const maxX = Math.max(...state.map(([x]) => x));
  const minY = Math.min(...state.map(([_, y]) => y));
  const maxY = Math.max(...state.map(([_, y]) => y));
  const bottomLeft = [minX, minY];
  const topRight = [maxX, maxY];
  return { bottomLeft, topRight };
};

/**
 * @param {[number,number][]} state 
 */
const printCells = (state) => {
  /** @type {string[]} */
  const lines = [];
  const { bottomLeft, topRight } = corners(state);
  for (let y = topRight[1]; y >= bottomLeft[1]; --y) {
    /** @type {string[]} */
    const cells = [];
    for (let x = bottomLeft[0]; x <= topRight[0]; ++x) {
      cells.push(printCell([x, y], state));
    }
    lines.push(cells.join(' '));
  }
  return lines.join('\n');
};

/**
 * @param {[number, number]} param0
 * @returns {[number, number][]}
 */
const getNeighborsOf = ([x, y]) => {
  const minX = x - 1;
  const maxX = x + 1;
  const minY = y - 1;
  const maxY = y + 1;
  /** @type {[number, number][]} */
  const result = [];
  for (let j = minY; j <= maxY; ++j) {
    for (let i = minX; i <= maxX; ++i) {
      if (y === j && x === i) {
        continue;
      }
      const cell = [i, j];
      result.push(cell);
    }
  }
  return result;
};

const getLivingNeighbors = (cell, state) => {
  return getNeighborsOf(cell).filter(nCell => contains.call(state, nCell));
};

/**
 * @param {[number,number]} cell 
 * @param {[number,number][]} state 
 * @returns {boolean}
 */
const willBeAlive = (cell, state) => {
  const livingNeighbors = getLivingNeighbors(cell, state);
  if (contains.call(state, cell)) {
    if (livingNeighbors.length === 2) {
      return true;
    }
  }
  if (livingNeighbors.length === 3) {
    return true;
  }
  return false;
};

/**
 * @param {[number,number][]} state
 * @returns {[number,number][]}
 */
const calculateNext = (state) => {
  const curBounds = corners(state);
  const nextBounds = {
    bottomLeft: [curBounds.bottomLeft[0] - 1, curBounds.bottomLeft[1] - 1],
    topRight: [curBounds.topRight[0] + 1, curBounds.topRight[1] + 1]
  };
  /** @type {[number,number][]} */
  const nextState = [];
  for (let y = nextBounds.topRight[1]; y >= nextBounds.bottomLeft[1]; --y) {
    for (let x = nextBounds.bottomLeft[0]; x <= nextBounds.topRight[0]; ++x) {
      /** @type {[number,number]} */
      const cell = [x, y];
      if (willBeAlive(cell, state)) {
        nextState.push(cell);
      }
    }
  }
  return nextState;
};

/**
 * @param {[number,number][]} state
 * @param {number} iterations
 * @returns {[number,number][][]}
 */
const iterate = (state, iterations) => {
  /** @type {[number,number][][]} */
  const steps = [ state ];

  for (let i = 0; i < iterations; ++i) {
    state = calculateNext(state);
    steps.push(state);
  }
  return steps;
};

/**
 * 
 * @param {keyof startPatterns} pattern 
 * @param {number} iterations 
 * @returns {void}
 */
const main = (pattern, iterations) => {
  /** @type {[number,number][]} */
  let startState;
  switch (pattern) {
    case 'glider':
    case 'rpentomino':
    case 'square':
      startState = startPatterns[pattern];
      break;
    default:
      throw new Error(`Invalid pattern name: ${pattern} (valid values are: ${Object.keys(startPatterns).join(', ')})`);
  }
  for (const state of iterate(startState, iterations)) {
    console.log(printCells(state) + '\n');
  }
};

const startPatterns = {
    rpentomino: [
      [3, 2],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4]
    ],
    glider: [
      [-2, -2],
      [-1, -2],
      [-2, -1],
      [-1, -1],
      [1, 1],
      [2, 1],
      [3, 1],
      [3, 2],
      [2, 3]
    ],
    square: [
      [1, 1],
      [2, 1],
      [1, 2],
      [2, 2]
    ]
  };
  
  const [pattern, iterations] = process.argv.slice(2);
  const runAsScript = require.main === module;
  
  if (runAsScript) {
    if (startPatterns[pattern] && !isNaN(parseInt(iterations))) {
      main(pattern, parseInt(iterations));
    } else {
      console.log("Usage: node js/gameoflife.js rpentomino 50");
    }
  }
  
  exports.seed = seed;
  exports.same = same;
  exports.contains = contains;
  exports.getNeighborsOf = getNeighborsOf;
  exports.getLivingNeighbors = getLivingNeighbors;
  exports.willBeAlive = willBeAlive;
  exports.corners = corners;
  exports.calculateNext = calculateNext;
  exports.printCell = printCell;
  exports.printCells = printCells;
  exports.startPatterns = startPatterns;
  exports.iterate = iterate;
  exports.main = main;