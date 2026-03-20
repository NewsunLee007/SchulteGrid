document.addEventListener('DOMContentLoaded', () => {
    const gridSizeSelect = document.getElementById('grid-size');
    const btnGenerate = document.getElementById('btn-generate');
    const btnPrint = document.getElementById('btn-print');
    const gridContainer = document.getElementById('schulte-grid');
    const printSizeLabel = document.getElementById('print-size');

    // Fisher-Yates 洗牌算法
    function shuffle(array) {
        let currentIndex = array.length, randomIndex;

        // 当还剩有元素未洗牌时
        while (currentIndex !== 0) {
            // 选取剩下的元素
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // 与当前元素交换
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    // 根据不同阶数设置基础字体大小的倍率
    function getFontSizeMultiplier(size) {
        switch(size) {
            case 3: return 2.2;
            case 4: return 1.8;
            case 5: return 1.4;
            case 6: return 1.1;
            case 7: return 0.9;
            case 8: return 0.75;
            case 9: return 0.65;
            default: return 1.0;
        }
    }

    // 动态生成单个网格的 DOM 内容
    function createGridDOM(size) {
        const totalCells = size * size;
        let numbers = Array.from({ length: totalCells }, (_, i) => i + 1);
        numbers = shuffle(numbers);

        const container = document.createElement('div');
        container.className = 'grid-container';
        container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${size}, 1fr)`;

        const fontSizeMultiplier = getFontSizeMultiplier(size);

        numbers.forEach(num => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = num;
            cell.style.fontSize = `calc(${fontSizeMultiplier} * var(--scale-factor))`;
            container.appendChild(cell);
        });

        return container;
    }

    // 生成屏幕显示的单个主网格
    function generateGrid() {
        const size = parseInt(gridSizeSelect.value, 10);
        
        // 更新打印时的标签显示
        printSizeLabel.textContent = `${size}×${size}`;

        // 清空现有的网格并重新生成主网格
        gridContainer.innerHTML = '';
        const newGrid = createGridDOM(size);
        
        // 将内部节点转移到主容器
        while (newGrid.firstChild) {
            gridContainer.appendChild(newGrid.firstChild);
        }
        gridContainer.style.gridTemplateColumns = newGrid.style.gridTemplateColumns;
        gridContainer.style.gridTemplateRows = newGrid.style.gridTemplateRows;
    }

    // 准备打印的四宫格
    function preparePrintGrids() {
        const size = parseInt(gridSizeSelect.value, 10);
        const printLayout = document.getElementById('print-layout');
        
        // 清空旧的打印数据
        printLayout.innerHTML = '';

        // 生成 4 个完全不同的网格
        for (let i = 1; i <= 4; i++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'print-grid-item';

            const label = document.createElement('div');
            label.className = 'print-grid-label';
            label.textContent = `训练组 ${i}`;

            const gridDOM = createGridDOM(size);

            wrapper.appendChild(label);
            wrapper.appendChild(gridDOM);
            printLayout.appendChild(wrapper);
        }
    }

    // 绑定事件监听器
    btnGenerate.addEventListener('click', generateGrid);
    
    // 当下拉菜单改变时自动重新生成
    gridSizeSelect.addEventListener('change', generateGrid);

    // 绑定打印/导出 PDF 按钮
    btnPrint.addEventListener('click', () => {
        preparePrintGrids(); // 每次打印前动态生成 4 个新的网格
        window.print();
    });

    // 初始生成一次
    generateGrid();
});
