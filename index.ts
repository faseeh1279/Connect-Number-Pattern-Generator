

class Cell {

    constructor(
        private up = false,
        private down = false,
        private left = false,
        private right = false
    ) {

    }
    dataset = [
        { "value": 1, "x": 0, "y": 0 },
        { "value": 2, "x": 1, "y": 0 },
        { "value": 3, "x": 2, "y": 0 },
        { "value": 4, "x": 3, "y": 0 },
        { "value": 5, "x": 3, "y": 1 },
        { "value": 6, "x": 2, "y": 1 },
        { "value": 7, "x": 1, "y": 1 },
        { "value": 8, "x": 0, "y": 1 },
        { "value": 9, "x": 0, "y": 2 },
        { "value": 10, "x": 1, "y": 2 },
        { "value": 11, "x": 2, "y": 2 },
        { "value": 12, "x": 3, "y": 2 },
        { "value": 13, "x": 3, "y": 3 },
        { "value": 14, "x": 2, "y": 3 },
        { "value": 15, "x": 1, "y": 3 },
        { "value": 16, "x": 0, "y": 3 }
    ]

    //  4 x 4 
    private visitAllCells(rows: number, cols: number) {

    }
}