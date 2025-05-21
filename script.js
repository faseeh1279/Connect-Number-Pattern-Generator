// Get DOM elements
const canvas = document.getElementById('patternCanvas');
const ctx = canvas.getContext('2d');
const sizeSelect = document.getElementById('sizeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const datasetSelect = document.getElementById('datasetSelect');
const resetBtn = document.getElementById('resetBtn');
const appendBtn = document.getElementById('appendBtn');
const exportBtn = document.getElementById('exportBtn');
const loadBtn = document.getElementById('loadBtn');
const patternSelect = document.getElementById('patternSelect');
const editBtn = document.getElementById('editBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

// Canvas settings
const cellSize = 50;
let cells = [];
let currentOrder = 1;
let patternStats = {
    easy: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    medium: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
    hard: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
};

// Store all patterns
let allPatterns = [];
let savedDatasets = {};

// Add these variables at the top with other state variables
let currentDataset = null;
let currentPatternIndex = -1;
let isEditMode = false;

// Initialize canvas
function initializeCanvas() {
    const size = parseInt(sizeSelect.value);
    canvas.width = size * cellSize;
    canvas.height = size * cellSize;
    drawGrid();
}

// Draw the grid
function drawGrid() {
    const size = parseInt(sizeSelect.value);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;

    for (let i = 0; i <= size; i++) {
        // Vertical lines
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size * cellSize);
        ctx.stroke();

        // Horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size * cellSize, i * cellSize);
        ctx.stroke();
    }

    // Draw numbers in cells
    cells.forEach(cell => {
        ctx.fillStyle = '#000';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            cell.order.toString(),
            (cell.x + 0.5) * cellSize,
            (cell.y + 0.5) * cellSize
        );
    });
}

// Handle canvas click
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    const size = parseInt(sizeSelect.value);

    if (x >= 0 && x < size && y >= 0 && y < size) {
        const existingCell = cells.find(cell => cell.x === x && cell.y === y);
        if (!existingCell) {
            cells.push({ x, y, order: currentOrder++ });
            drawGrid();
        }
    }
}

// Reset canvas
function resetCanvas() {
    cells = [];
    currentOrder = 1;
    initializeCanvas();
}

// Generate pattern name based on grid size and difficulty
function generatePatternName() {
    const size = sizeSelect.value;
    const difficulty = difficultySelect.value;
    const count = patternStats[difficulty][size] + 1;
    return `${size}x${size} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Pattern ${count}`;
}

// Update statistics display
function updateStatistics() {
    // Update individual counts
    Object.entries(patternStats).forEach(([difficulty, sizes]) => {
        Object.entries(sizes).forEach(([size, count]) => {
            const cell = document.querySelector(`.count[data-difficulty="${difficulty}"][data-size="${size}"]`);
            if (cell) {
                cell.textContent = count;
            }
        });

        // Update totals
        const total = Object.values(sizes).reduce((sum, count) => sum + count, 0);
        const totalCell = document.querySelector(`.total[data-difficulty="${difficulty}"]`);
        if (totalCell) {
            totalCell.textContent = total;
        }
    });
}

// Update dataset selector
function updateDatasetSelector() {
    datasetSelect.innerHTML = '<option value="">Select Dataset</option>';
    Object.keys(savedDatasets).forEach(datasetName => {
        const option = document.createElement('option');
        option.value = datasetName;
        option.textContent = datasetName;
        datasetSelect.appendChild(option);
    });
}

// Update the loadDataset function to handle both file loading and dataset selection
async function loadDataset() {
    try {
        const handle = await window.showOpenFilePicker({
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json']
                }
            }]
        });

        const file = await handle[0].getFile();
        const content = await file.text();
        const dataset = JSON.parse(content);

        if (dataset.puzzleStages && Array.isArray(dataset.puzzleStages)) {
            const datasetName = file.name.replace('.json', '');
            savedDatasets[datasetName] = dataset.puzzleStages;
            updateDatasetSelector();
            
            // Set the current dataset
            currentDataset = {
                name: datasetName,
                patterns: dataset.puzzleStages.map(pattern => ({
                    size: pattern.gridSize,
                    difficulty: pattern.difficulty,
                    sequence: pattern.numbers.map(num => [num.y, num.x])
                }))
            };
            
            // Update pattern selector
            updatePatternSelector();
            updateStatistics();
            alert(`Dataset "${datasetName}" loaded successfully!`);
        } else {
            alert('Invalid dataset format!');
        }
    } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error loading dataset:', err);
        alert('Error loading dataset. Please try again.');
    }
}

// Add a new function to update pattern selector
function updatePatternSelector() {
    if (!currentDataset) return;
    
    patternSelect.innerHTML = '<option value="">Select Pattern</option>';
    currentDataset.patterns.forEach((pattern, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Pattern ${index + 1} (${pattern.size}x${pattern.size} - ${pattern.difficulty})`;
        patternSelect.appendChild(option);
    });
}

// Update handleDatasetSelection function
function handleDatasetSelection() {
    const selectedDataset = datasetSelect.value;
    if (!selectedDataset || !savedDatasets[selectedDataset]) return;

    // Set current dataset
    currentDataset = {
        name: selectedDataset,
        patterns: savedDatasets[selectedDataset].map(pattern => ({
            size: pattern.gridSize,
            difficulty: pattern.difficulty,
            sequence: pattern.numbers.map(num => [num.y, num.x])
        }))
    };
    
    // Update pattern selector
    updatePatternSelector();
    
    // Reset statistics
    patternStats = {
        easy: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
        medium: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
        hard: { 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }
    };

    // Update statistics based on loaded patterns
    currentDataset.patterns.forEach(pattern => {
        patternStats[pattern.difficulty][pattern.size]++;
    });

    updateStatistics();
    alert(`Loaded ${currentDataset.patterns.length} patterns from "${selectedDataset}"`);
}

// Append to dataset
function appendToDataset() {
    if (cells.length === 0) return;

    const pattern = {
        name: generatePatternName(),
        difficulty: difficultySelect.value,
        gridSize: parseInt(sizeSelect.value),
        numbers: cells.map(cell => ({
            x: cell.x,
            y: cell.y,
            number: cell.order
        }))
    };

    // Add pattern to allPatterns array
    allPatterns.push(pattern);

    // Update statistics
    const size = sizeSelect.value;
    const difficulty = difficultySelect.value;
    patternStats[difficulty][size]++;
    updateStatistics();

    // Reset canvas for next pattern
    resetCanvas();

    // Show success message
    alert(`Pattern added! Total patterns: ${allPatterns.length}`);
}

// Export dataset
async function exportDataset() {
    if (allPatterns.length === 0) {
        alert('No patterns to export!');
        return;
    }

    const dataset = {
        puzzleStages: allPatterns
    };

    try {
        // Create a new file handle
        const handle = await window.showSaveFilePicker({
            suggestedName: 'all_patterns.json',
            types: [{
                description: 'JSON Files',
                accept: {
                    'application/json': ['.json']
                }
            }]
        });

        // Create a FileSystemWritableFileStream to write to
        const writable = await handle.createWritable();
        
        // Write the contents
        await writable.write(JSON.stringify(dataset, null, 2));
        
        // Close the file and write the contents to disk
        await writable.close();
        
        // Save to savedDatasets
        const fileName = handle.name;
        savedDatasets[fileName] = allPatterns;
        updateDatasetSelector();
        
        alert(`Successfully exported ${allPatterns.length} patterns!`);
    } catch (err) {
        if (err.name === 'AbortError') {
            // User cancelled the save
            return;
        }
        console.error('Error saving file:', err);
        alert('Error saving file. Please try again.');
    }
}

// Event listeners
canvas.addEventListener('click', handleCanvasClick);
sizeSelect.addEventListener('change', resetCanvas);
resetBtn.addEventListener('click', resetCanvas);
appendBtn.addEventListener('click', appendToDataset);
exportBtn.addEventListener('click', exportDataset);
loadBtn.addEventListener('click', loadDataset);
datasetSelect.addEventListener('change', handleDatasetSelection);
patternSelect.addEventListener('change', handlePatternSelect);
editBtn.addEventListener('click', handleEditClick);
saveEditBtn.addEventListener('click', handleSaveEdit);
cancelEditBtn.addEventListener('click', handleCancelEdit);

// Initialize the canvas when the page loads
initializeCanvas();

function handlePatternSelect() {
    const selectedIndex = patternSelect.value;
    if (selectedIndex === '') {
        resetCanvas();
        return;
    }

    const pattern = currentDataset.patterns[selectedIndex];
    currentPatternIndex = parseInt(selectedIndex);
    
    // Update UI to match selected pattern
    sizeSelect.value = pattern.size;
    difficultySelect.value = pattern.difficulty;
    
    // Draw the pattern
    resetCanvas();
    pattern.sequence.forEach((cell, index) => {
        const [row, col] = cell;
        cells.push({ x: col, y: row, order: index + 1 });
    });
    drawGrid();
}

function handleEditClick() {
    if (currentPatternIndex === -1) {
        alert('Please select a pattern to edit');
        return;
    }

    isEditMode = true;
    editBtn.style.display = 'none';
    saveEditBtn.style.display = 'inline-block';
    cancelEditBtn.style.display = 'inline-block';
    appendBtn.style.display = 'none';
    exportBtn.style.display = 'none';
    loadBtn.style.display = 'none';
}

function handleSaveEdit() {
    if (!isEditMode || currentPatternIndex === -1) return;

    // Get the current pattern from the dataset
    const pattern = currentDataset.patterns[currentPatternIndex];
    
    // Update the pattern with the current cells
    pattern.size = parseInt(sizeSelect.value);
    pattern.difficulty = difficultySelect.value;
    pattern.sequence = cells.map(cell => [cell.y, cell.x]);

    // Update the dataset in savedDatasets
    savedDatasets[currentDataset.name] = currentDataset.patterns;

    // Exit edit mode
    exitEditMode();
    
    // Update the pattern selector to reflect changes
    updatePatternSelector();
    
    // Select the edited pattern
    patternSelect.value = currentPatternIndex;
    
    alert('Changes saved successfully!');
}

function handleCancelEdit() {
    exitEditMode();
    // Reload the current pattern
    handlePatternSelect();
}

function exitEditMode() {
    isEditMode = false;
    editBtn.style.display = 'inline-block';
    saveEditBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    appendBtn.style.display = 'inline-block';
    exportBtn.style.display = 'inline-block';
    loadBtn.style.display = 'inline-block';
} 