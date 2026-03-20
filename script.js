document.addEventListener('DOMContentLoaded', () => {
    const gridSizeSelect = document.getElementById('grid-size');
    const btnGenerate = document.getElementById('btn-generate');
    const btnPrint = document.getElementById('btn-print');
    const gridContainer = document.getElementById('schulte-grid');
    const printSizeLabel = document.getElementById('print-size');
    
    // 计时器相关 DOM
    const timerValue = document.getElementById('timer-value');
    const btnFinish = document.getElementById('btn-finish');
    const btnHistory = document.getElementById('btn-history');
    const historyModal = document.getElementById('history-modal');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const historyList = document.getElementById('history-list');
    const btnClearHistory = document.getElementById('btn-clear-history');

    // 计时器状态
    let startTime = 0;
    let timerInterval = null;
    let isTiming = false;

    // 格式化时间为 mm:ss.ms
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((ms % 1000) / 10);
        
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
    }

    // 更新计时器显示
    function updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;
        timerValue.textContent = formatTime(elapsedTime);
    }

    // 开始计时
    function startTimer() {
        if (isTiming) return;
        isTiming = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10);
        btnFinish.disabled = false;
        btnGenerate.disabled = true; // 训练期间禁用重新生成
        gridSizeSelect.disabled = true;
    }

    // 停止计时
    function stopTimer() {
        if (!isTiming) return;
        clearInterval(timerInterval);
        isTiming = false;
        btnFinish.disabled = true;
        btnGenerate.disabled = false;
        gridSizeSelect.disabled = false;
        
        const finalTimeMs = Date.now() - startTime;
        saveHistory(finalTimeMs);
        alert(`训练结束！\n用时：${formatTime(finalTimeMs)}`);
    }

    // 重置计时器
    function resetTimer() {
        clearInterval(timerInterval);
        isTiming = false;
        timerValue.textContent = '00:00.00';
        btnFinish.disabled = true;
        btnGenerate.disabled = false;
        gridSizeSelect.disabled = false;
    }

    // 历史记录相关功能
    function getHistory() {
        const history = localStorage.getItem('schulteHistory');
        return history ? JSON.parse(history) : [];
    }

    function saveHistory(timeMs) {
        const history = getHistory();
        const size = gridSizeSelect.value;
        const record = {
            id: Date.now(),
            date: new Date().toLocaleString('zh-CN', { 
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit' 
            }),
            size: `${size}×${size}`,
            timeStr: formatTime(timeMs),
            timeMs: timeMs
        };
        history.unshift(record); // 添加到开头
        // 最多保留 50 条记录
        if (history.length > 50) history.pop();
        localStorage.setItem('schulteHistory', JSON.stringify(history));
    }

    function renderHistory() {
        const history = getHistory();
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<li class="empty-state">暂无训练记录</li>';
            return;
        }

        history.forEach(record => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-info">
                    <span class="history-size">规格：${record.size}</span>
                    <span class="history-date">${record.date}</span>
                </div>
                <div class="history-time">${record.timeStr}</div>
            `;
            historyList.appendChild(li);
        });
    }

    // 弹窗控制
    btnHistory.addEventListener('click', () => {
        renderHistory();
        historyModal.classList.remove('hidden');
    });

    btnCloseModal.addEventListener('click', () => {
        historyModal.classList.add('hidden');
    });

    btnClearHistory.addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？此操作不可恢复。')) {
            localStorage.removeItem('schulteHistory');
            renderHistory();
        }
    });

    // 点击外部区域关闭弹窗
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.add('hidden');
        }
    });

    // 绑定结束按钮
    btnFinish.addEventListener('click', stopTimer);

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
            
            // 点击单元格开始计时
            cell.addEventListener('click', () => {
                if (!isTiming) {
                    startTimer();
                }
            });
            
            container.appendChild(cell);
        });

        return container;
    }

    // 生成屏幕显示的单个主网格
    function generateGrid() {
        // 生成前先重置可能在运行的计时器
        resetTimer();
        
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

    // 判断是否在微信内置浏览器中
    function isWechat() {
        const ua = navigator.userAgent.toLowerCase();
        return ua.indexOf('micromessenger') !== -1;
    }

    // 判断是否在移动端
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // 绑定打印/导出 PDF 按钮
    btnPrint.addEventListener('click', () => {
        if (isWechat()) {
            alert('微信内置浏览器不支持直接打印和导出 PDF 功能。\n\n请点击右上角「...」，选择「在浏览器打开」或「在 Safari 中打开」，然后再点击此按钮即可。');
            return;
        }
        
        // 尝试调用打印，如果抛出异常（部分特殊环境）给出提示
        try {
            preparePrintGrids(); // 每次打印前动态生成 4 个新的网格
            
            // Safari 移动端某些情况下调用 print() 后界面可能需要短暂延迟
            setTimeout(() => {
                window.print();
            }, 100);
        } catch (e) {
            alert('您的浏览器当前不支持打印功能，请尝试更换其他系统浏览器（如 Safari 或 Chrome）。');
        }
    });

    // 初始生成一次
    generateGrid();
});
