'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const range$1 = (limit, cb) => [...Array(limit).keys()].map(cb);

const GARBAGE_CHARACTERS = [
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '-',
    '+',
    '=',
    '|',
    '\\',
    ';',
    ':',
    '"',
    "'",
    ',',
    '.',
    '?',
    '/',
    '[',
    ']',
    '<',
    '>',
    '{',
    '}'
];
const randomWithin = (limit) => Math.floor(Math.random() * limit);
const memoryAddress = () => randomWithin(100000);
const garbage = () => GARBAGE_CHARACTERS[randomWithin(GARBAGE_CHARACTERS.length)];
const randomItemOf = (items) => items[randomWithin(items.length)];
var rng = { randomWithin, randomItemOf, memoryAddress, garbage };

const formatMemoryAddress = (address) => `0X${address.toString(16)}`.substring(0, 6);
const formatMemoryDump = (dimensions, memoryDump) => {
    const initialMemoryAddress = rng.memoryAddress();
    const data = memoryDump.dumpedContent.split('');
    const firstBlock = range$1(dimensions.rowsPerBlock, () => data.splice(0, dimensions.columnsPerBlock));
    const secondBlock = range$1(dimensions.rowsPerBlock, () => data.splice(0, dimensions.columnsPerBlock));
    const firstBlockRows = firstBlock.map((data, idx) => {
        return {
            memoryAddress: formatMemoryAddress(initialMemoryAddress + idx * dimensions.columnsPerBlock),
            columns: data
        };
    });
    const secondBlockRows = secondBlock.map((data, idx) => {
        return {
            memoryAddress: formatMemoryAddress(initialMemoryAddress + dimensions.rowsPerBlock * dimensions.columnsPerBlock + idx * dimensions.columnsPerBlock),
            columns: data
        };
    });
    return {
        rowsPerBlock: {
            firstBlock: firstBlockRows,
            secondBlock: secondBlockRows
        },
    };
};

const span = (config) => {
    const span = document.createElement("span");
    span.className = config.className;
    if (config.tabIndex !== null && config.tabIndex !== undefined) {
        span.tabIndex = config.tabIndex;
    }
    const content = document.createTextNode(config.content);
    Object.entries(config.dataAttributes ?? {}).forEach(([key, value]) => {
        span.setAttribute(`data-${key}`, value.toString());
    });
    span.appendChild(content);
    return span;
};
const createElement = (name) => (config) => {
    const element = document.createElement(name);
    element.className = config.className;
    element.append(...config.children);
    return element;
};
const p = createElement("p");
const section = createElement("section");
var dom = { span, p, section };

const SecurityLevels = {
    L1: {
        passphraseLength: 5,
        passphrasesDumped: 8
    }
};
const GUESSES = ['WHICH', 'OTHER', 'ABOUT', 'MAYBE', 'LUNCH', 'EVERY', 'THEIR', 'FAITH'];
const getMemoryDump = (dumpSize, securityLevel) => {
    const guessesSize = securityLevel.passphraseLength * securityLevel.passphrasesDumped;
    const garbageSize = dumpSize - guessesSize;
    const garbage = range$1(garbageSize, () => rng.garbage()).join('');
    // TODO: Improve guess distribution logic
    const groupOffset = Math.floor(garbageSize / (securityLevel.passphrasesDumped + 1));
    const guessIndices = range$1(securityLevel.passphrasesDumped, (i) => groupOffset * i + 1).map((offset) => {
        const nextIndex = rng.randomWithin(groupOffset - securityLevel.passphraseLength) + offset;
        return Math.min(nextIndex, garbageSize - securityLevel.passphraseLength);
    });
    const insertGuessesIntoGarbage = (result, guessIndex) => result.slice(0, guessIndex) + rng.randomItemOf(GUESSES) + result.slice(guessIndex);
    const dumpedContent = guessIndices.reduce(insertGuessesIntoGarbage, garbage);
    return {
        guessIndices,
        dumpedContent
    };
};

const KEY_CODES = {
    UP: "ArrowUp",
    RIGHT: "ArrowRight",
    DOWN: "ArrowDown",
    LEFT: "ArrowLeft",
};
const move = {
    [KEY_CODES.DOWN]: (coord) => coord.row === terminalDimensions.rowsPerBlock - 1
        ? { row: 0 }
        : { row: coord.row + 1 },
    [KEY_CODES.UP]: (coord) => coord.row === 0
        ? { row: terminalDimensions.rowsPerBlock - 1 }
        : { row: coord.row - 1 },
    [KEY_CODES.LEFT]: (coord) => coord.column === 0
        ? {
            column: terminalDimensions.columnsPerBlock - 1,
            block: coord.block === 0 ? 1 : 0,
        }
        : {
            column: coord.column - 1,
        },
    [KEY_CODES.RIGHT]: (coord) => coord.column === terminalDimensions.columnsPerBlock - 1
        ? {
            column: 0,
            block: coord.block === 0 ? 1 : 0,
        }
        : {
            column: coord.column + 1,
        },
};
const range = (limit, cb) => [...Array(limit).keys()].map(cb);
const terminalDimensions = {
    rowsPerBlock: 17,
    columnsPerBlock: 12,
};
const memoryDumpSize = terminalDimensions.columnsPerBlock * terminalDimensions.rowsPerBlock * 2 + 1;
const memoryDump = getMemoryDump(memoryDumpSize, SecurityLevels.L1);
const matrix = formatMemoryDump(terminalDimensions, memoryDump);
const buildBlockOfRows = (rowContent, blockIndex) => rowContent.map((row, rowIndex) => dom.p({
    className: "terminal-line",
    children: [
        dom.span({
            className: "memory-address",
            content: row.memoryAddress,
        }),
        ...row.columns.map((c, columnIndex) => dom.span({
            className: "terminal-column",
            tabIndex: 0,
            content: c,
            dataAttributes: {
                block: blockIndex,
                column: columnIndex,
                row: rowIndex,
                "contiguous-index": columnIndex +
                    terminalDimensions.columnsPerBlock * rowIndex +
                    blockIndex *
                        (terminalDimensions.columnsPerBlock *
                            terminalDimensions.rowsPerBlock),
            },
        })),
    ],
}));
const firstBlockRows = buildBlockOfRows(matrix.rowsPerBlock.firstBlock, 0);
const secondBlockRows = buildBlockOfRows(matrix.rowsPerBlock.secondBlock, 1);
const terminalBlockContainer = document.querySelector("#block-container");
terminalBlockContainer?.append(dom.section({
    className: "terminal-block",
    children: firstBlockRows,
}), dom.section({
    className: "terminal-block",
    children: secondBlockRows,
}));
document.onkeydown = (event) => {
    const activeElement = document.activeElement;
    if (!activeElement || activeElement.className !== "terminal-column") {
        document.querySelector(".terminal-column").focus();
        return;
    }
    if (Object.values(KEY_CODES).includes(event.key)) {
        getNextColumn(activeElement, event.key)?.focus();
    }
};
const getNextColumn = (activeElement, movement) => {
    const coordinates = getColumnCoordinates(activeElement);
    if (memoryDump.guessIndices.includes(coordinates.contiguousIndex) && movement === KEY_CODES.RIGHT) {
        const selector = `.terminal-column[data-contiguous-index="${coordinates.contiguousIndex + SecurityLevels.L1.passphraseLength}"]`;
        return document.querySelector(selector);
    }
    const nextCoordinates = { ...coordinates, ...move[movement](coordinates) };
    const selector = `.terminal-column[data-row="${nextCoordinates.row}"][data-column="${nextCoordinates.column}"][data-block="${nextCoordinates.block}"]`;
    return document.querySelector(selector);
};
const getColumnCoordinates = (activeColumn) => {
    return {
        row: parseInt(activeColumn.dataset.row),
        column: parseInt(activeColumn.dataset.column),
        block: parseInt(activeColumn.dataset.block),
        contiguousIndex: parseInt(activeColumn.dataset.contiguousIndex),
    };
};
const firstColumn = document.querySelector(".terminal-column");
firstColumn?.focus();

exports.range = range;
//# sourceMappingURL=terminal.js.map
