(function() {
    'use strict';

    const STORAGE_KEYS = {
        DAILY_FOCUS: 'dailyFocus',
        DARK_MODE: 'darkMode',
        STREAK_DATA: 'streakData',
        BACKGROUND: 'background',
        TODOS: 'todos',
        QUICK_LINKS: 'quickLinks',
        TIMER_MINUTES: 'timerMinutes'
    };

    const getSeasonalGradient = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
        if (month >= 5 && month <= 7) return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
        if (month >= 8 && month <= 10) return 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)';
        return 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)';
    };

    const BACKGROUND_PRESETS = [
        { id: 'default', name: 'Seasonal', gradient: getSeasonalGradient() },
        { id: 'spring', name: 'Spring', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
        { id: 'summer', name: 'Summer', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
        { id: 'autumn', name: 'Autumn', gradient: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)' },
        { id: 'winter', name: 'Winter', gradient: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)' },
        { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
        { id: 'ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
        { id: 'forest', name: 'Forest', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
        { id: 'purple', name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'pink', name: 'Sakura', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
    ];

    const elements = {
        darkModeToggle: document.getElementById('darkModeToggle'),
        setFocusArea: document.getElementById('setFocusArea'),
        activeFocusArea: document.getElementById('activeFocusArea'),
        setFocusButton: document.getElementById('setFocusButton'),
        newFocusInput: document.getElementById('newFocusInput'),
        focusText: document.getElementById('focusText'),
        completeFocusButton: document.getElementById('completeFocusButton'),
        fireworks: document.getElementById('fireworks'),
        inputError: document.getElementById('inputError'),
        dailyQuote: document.getElementById('dailyQuote'),
        progressPanel: document.getElementById('progressPanel'),
        streakCount: document.getElementById('streakCount'),
        longestStreak: document.getElementById('longestStreak'),
        totalCompleted: document.getElementById('totalCompleted'),
        weeklyBars: document.getElementById('weeklyBars'),
        closeProgressPanel: document.getElementById('closeProgressPanel'),
        backgroundPresets: document.getElementById('backgroundPresets'),
        currentTime: document.getElementById('currentTime'),
        currentDate: document.getElementById('currentDate'),
        todoList: document.getElementById('todoList'),
        addTodoBtn: document.getElementById('addTodoBtn'),
        timerMinutes: document.getElementById('timerMinutes'),
        timerSeconds: document.getElementById('timerSeconds'),
        startTimerBtn: document.getElementById('startTimerBtn'),
        resetTimerBtn: document.getElementById('resetTimerBtn'),
        quickLinks: document.getElementById('quickLinks'),
        addLinkBtn: document.getElementById('addLinkBtn'),
        weatherDisplay: document.getElementById('weatherDisplay'),
        exportDataBtn: document.getElementById('exportDataBtn')
    };

    let timerInterval = null;
    let timerSecondsRemaining = 25 * 60;
    let timerRunning = false;

    const getTodayKey = () => new Date().toISOString().split('T')[0];

    const getYesterdayKey = () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().split('T')[0];
    };

    const getDefaultStreakData = () => ({
        current: 0,
        longest: 0,
        lastCompleted: null,
        weeklyHistory: {},
        totalCompleted: 0
    });

    const getStreakData = async () => {
        const data = await getStorage(STORAGE_KEYS.STREAK_DATA);
        return data || getDefaultStreakData();
    };

    const saveStreakData = async (data) => {
        await setStorage(STORAGE_KEYS.STREAK_DATA, data);
    };

    const QUOTES = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Focus on being productive instead of busy. - Tim Ferriss",
        "Success is the sum of small efforts, repeated day in and day out. - Robert Collier",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "The secret of getting ahead is getting started. - Mark Twain",
        "It does not matter how slowly you go as long as you do not stop. - Confucius",
        "Believe you can and you're halfway there. - Theodore Roosevelt",
        "Your focus determines your reality. - George Lucas",
        "May the Force be with you. - Star Wars",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Hakuna Matata! - The Lion King",
        "Just do it! - Nike",
        "I will be the change that I wish to see in the world. - Gandhi",
        "With great power comes great responsibility. - Spider-Man",
        "A journey of a thousand miles begins with a single step. - Lao Tzu",
        "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
        "Action is the foundational key to all success. - Pablo Picasso",
        "Hard work beats talent when talent doesn't work hard. - Tim Notke",
        "Dream big and dare to fail. - Norman Vaughan"
    ];

    const getStorage = (key) => {
        return new Promise((resolve) => {
            const storage = window.browser?.storage || window.chrome.storage;
            if (storage) {
                storage.local.get(key, (data) => {
                    const error = window.browser?.runtime?.lastError || window.chrome.runtime?.lastError;
                    if (error) {
                        console.warn('Storage error, falling back to localStorage:', error);
                        resolve(localStorage.getItem(key));
                    } else {
                        resolve(data[key]);
                    }
                });
            } else {
                resolve(localStorage.getItem(key));
            }
        });
    };

    const setStorage = (key, value) => {
        return new Promise((resolve) => {
            const storage = window.browser?.storage || window.chrome.storage;
            if (storage) {
                storage.local.set({ [key]: value }, () => {
                    const error = window.browser?.runtime?.lastError || window.chrome.runtime?.lastError;
                    if (error) {
                        console.warn('Storage error, falling back to localStorage:', error);
                        localStorage.setItem(key, value);
                    }
                    resolve();
                });
            } else {
                localStorage.setItem(key, value);
                resolve();
            }
        });
    };

    const showError = (message) => {
        elements.inputError.textContent = message;
        elements.inputError.style.display = 'block';
        setTimeout(() => {
            elements.inputError.style.display = 'none';
            elements.inputError.textContent = '';
        }, 3000);
    };

    const clearError = () => {
        elements.inputError.textContent = '';
        elements.inputError.style.display = 'none';
    };

    const showFireworks = () => {
        elements.fireworks.style.display = 'block';
        elements.fireworks.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
            elements.fireworks.style.display = 'none';
            elements.fireworks.setAttribute('aria-hidden', 'true');
        }, 3000);
    };

    const showSetFocusArea = () => {
        elements.setFocusArea.style.display = 'block';
        elements.activeFocusArea.style.display = 'none';
        elements.newFocusInput.value = '';
        elements.newFocusInput.focus();
        elements.completeFocusButton.textContent = 'Complete';
        clearError();
    };

    const showActiveFocusArea = (focus) => {
        elements.setFocusArea.style.display = 'none';
        elements.activeFocusArea.style.display = 'flex';
        elements.focusText.textContent = `Focus with all your power! ${focus}`;
    };

    const saveFocus = async () => {
        const focus = elements.newFocusInput.value.trim();
        
        if (focus.length > 200) {
            showError('Focus task is too long (max 200 characters)');
            return false;
        }

        try {
            await setStorage(STORAGE_KEYS.DAILY_FOCUS, focus);
            if (focus) {
                showActiveFocusArea(focus);
            } else {
                showRestDayArea();
            }
            return true;
        } catch (error) {
            console.error('Error saving focus:', error);
            showError('Failed to save focus. Please try again.');
            return false;
        }
    };

    const showRestDayArea = () => {
        elements.setFocusArea.style.display = 'none';
        elements.activeFocusArea.style.display = 'flex';
        elements.focusText.textContent = 'Take a rest, senpai! You deserve it.';
        elements.completeFocusButton.textContent = 'Set Focus';
    };

    const completeFocus = async () => {
        try {
            await setStorage(STORAGE_KEYS.DAILY_FOCUS, '');
            await updateProgress();
            showSetFocusArea();
            showFireworks();
        } catch (error) {
            console.error('Error clearing focus:', error);
            showError('Failed to complete focus. Please try again.');
        }
    };

    const updateProgress = async () => {
        const streakData = await getStreakData();
        const today = getTodayKey();
        const yesterday = getYesterdayKey();

        if (streakData.lastCompleted === today) {
            return;
        }

        if (streakData.lastCompleted === yesterday) {
            streakData.current += 1;
        } else {
            streakData.current = 1;
        }

        if (streakData.current > streakData.longest) {
            streakData.longest = streakData.current;
        }

        streakData.lastCompleted = today;
        streakData.totalCompleted += 1;

        streakData.weeklyHistory[today] = (streakData.weeklyHistory[today] || 0) + 1;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        Object.keys(streakData.weeklyHistory).forEach(key => {
            if (new Date(key) < sevenDaysAgo) {
                delete streakData.weeklyHistory[key];
            }
        });

        await saveStreakData(streakData);
    };

    const renderProgress = async () => {
        const streakData = await getStreakData();
        elements.streakCount.textContent = streakData.current;
        elements.longestStreak.textContent = streakData.longest;
        elements.totalCompleted.textContent = streakData.totalCompleted;

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const maxCount = Math.max(1, ...Object.values(streakData.weeklyHistory));

        elements.weeklyBars.innerHTML = days.map(day => {
            const count = streakData.weeklyHistory[day] || 0;
            const height = Math.max(10, (count / maxCount) * 100);
            const dayName = new Date(day).toLocaleDateString('en', { weekday: 'short' });
            const isToday = day === getTodayKey();
            return `<div class="week-bar-container">
                <div class="week-bar" style="height: ${height}%" title="${count} completed"></div>
                <span class="week-day${isToday ? ' today' : ''}">${dayName}</span>
            </div>`;
        }).join('');
    };

    const toggleProgressPanel = async () => {
        const isVisible = elements.progressPanel.style.display === 'block';
        elements.progressPanel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            await renderProgress();
            await renderBackgroundSelector();
        }
    };

    const setFocusFromRest = () => {
        elements.setFocusArea.style.display = 'block';
        elements.activeFocusArea.style.display = 'none';
        elements.newFocusInput.value = '';
        elements.newFocusInput.focus();
    };

    const toggleDarkMode = async (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        try {
            await setStorage(STORAGE_KEYS.DARK_MODE, isDarkMode);
        } catch (error) {
            console.error('Error saving dark mode preference:', error);
        }
    };

    const initializeDarkMode = async () => {
        try {
            const darkMode = await getStorage(STORAGE_KEYS.DARK_MODE);
            if (darkMode) {
                document.body.classList.add('dark-mode');
                elements.darkModeToggle.checked = true;
            }
        } catch (error) {
            console.error('Error loading dark mode preference:', error);
        }
    };

    const applyBackground = (background) => {
        if (background.type === 'custom' && background.image) {
            document.body.style.background = `url(${background.image}) center/cover no-repeat fixed`;
        } else if (background.preset && background.preset !== 'default') {
            const preset = BACKGROUND_PRESETS.find(p => p.id === background.preset);
            if (preset) {
                document.body.style.background = preset.gradient;
            }
        } else {
            document.body.style.background = getSeasonalGradient();
        }
    };

    const initializeBackground = async () => {
        try {
            const background = await getStorage(STORAGE_KEYS.BACKGROUND);
            if (background) {
                applyBackground(background);
            } else {
                applyBackground({ preset: 'default' });
            }
        } catch (error) {
            console.error('Error loading background preference:', error);
            applyBackground({ preset: 'default' });
        }
    };

    const setBackground = async (background) => {
        try {
            await setStorage(STORAGE_KEYS.BACKGROUND, background);
            applyBackground(background);
        } catch (error) {
            console.error('Error saving background preference:', error);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please select an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showError('Image must be under 2MB');
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => {
            showError('Failed to read image file');
        };
        reader.onload = async (e) => {
            try {
                await setBackground({ type: 'custom', image: e.target.result });
                renderBackgroundSelector();
            } catch (err) {
                showError('Failed to save image (may be too large for storage)');
            }
        };
        reader.readAsDataURL(file);
    };

    const renderBackgroundSelector = async () => {
        const container = elements.backgroundPresets;
        if (!container) return;

        const current = await getStorage(STORAGE_KEYS.BACKGROUND) || { preset: 'default', type: 'preset' };

        container.innerHTML = BACKGROUND_PRESETS.map(preset => `
            <button class="preset-btn ${current.type === 'preset' && current.preset === preset.id ? 'active' : ''}"
                    data-preset="${preset.id}"
                    style="background: ${preset.gradient}"
                    title="${preset.name}"></button>
        `).join('') + `
            <label class="upload-btn" title="Upload custom image">
                <input type="file" id="bgUpload" accept="image/*" style="display: none;">
                <span>+</span>
            </label>
        `;

        container.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await setBackground({ type: 'preset', preset: btn.dataset.preset });
                renderBackgroundSelector();
            });
        });

        const uploadInput = document.getElementById('bgUpload');
        if (uploadInput) {
            uploadInput.replaceWith(uploadInput.cloneNode(true));
            document.getElementById('bgUpload')?.addEventListener('change', handleImageUpload);
        }
    };

    const initializeFocus = async () => {
        try {
            const dailyFocus = await getStorage(STORAGE_KEYS.DAILY_FOCUS);
            if (dailyFocus && dailyFocus.trim()) {
                showActiveFocusArea(dailyFocus);
            } else if (dailyFocus === '') {
                showRestDayArea();
            } else {
                showSetFocusArea();
            }
        } catch (error) {
            console.error('Error loading focus:', error);
            showSetFocusArea();
        }
    };

    const showRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        elements.dailyQuote.textContent = QUOTES[randomIndex];
    };

    const setupEventListeners = () => {
        let darkModeDebounceTimer;

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                toggleProgressPanel();
            }
        });

        elements.darkModeToggle.addEventListener('change', () => {
            clearTimeout(darkModeDebounceTimer);
            darkModeDebounceTimer = setTimeout(() => {
                toggleDarkMode(elements.darkModeToggle.checked);
            }, 150);
        });

        elements.setFocusButton.addEventListener('click', () => {
            saveFocus();
        });

        elements.newFocusInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveFocus();
            }
        });

        elements.newFocusInput.addEventListener('input', () => {
            clearError();
        });

        elements.completeFocusButton.addEventListener('click', () => {
            if (elements.completeFocusButton.textContent === 'Set Focus') {
                setFocusFromRest();
            } else {
                completeFocus();
            }
        });

        if (elements.closeProgressPanel) {
            elements.closeProgressPanel.addEventListener('click', () => {
                elements.progressPanel.style.display = 'none';
            });
        }

        if (elements.addTodoBtn) {
            elements.addTodoBtn.addEventListener('click', addTodo);
        }

        if (elements.startTimerBtn) {
            elements.startTimerBtn.addEventListener('click', toggleTimer);
        }

        if (elements.resetTimerBtn) {
            elements.resetTimerBtn.addEventListener('click', resetTimer);
        }

        document.querySelectorAll('.timer-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimerDuration(parseInt(btn.dataset.minutes));
            });
        });

        if (elements.addLinkBtn) {
            elements.addLinkBtn.addEventListener('click', addQuickLink);
        }

        if (elements.exportDataBtn) {
            elements.exportDataBtn.addEventListener('click', exportData);
        }
    };

    const updateTime = () => {
        const now = new Date();
        if (elements.currentTime) {
            elements.currentTime.textContent = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        if (elements.currentDate) {
            elements.currentDate.textContent = now.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
        }
    };

    const loadTodos = async () => {
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        renderTodos(todos);
    };

    const renderTodos = (todos) => {
        if (!elements.todoList) return;
        elements.todoList.innerHTML = todos.map((todo, index) => `
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${index}">
                <label>${todo.text}</label>
                <button class="delete-todo" data-index="${index}">&times;</button>
            </li>
        `).join('');

        elements.todoList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                todos[e.target.dataset.index].completed = e.target.checked;
                await setStorage(STORAGE_KEYS.TODOS, todos);
                renderTodos(todos);
            });
        });

        elements.todoList.querySelectorAll('.delete-todo').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                todos.splice(e.target.dataset.index, 1);
                await setStorage(STORAGE_KEYS.TODOS, todos);
                renderTodos(todos);
            });
        });
    };

    const addTodo = async () => {
        const text = prompt('Enter a todo:');
        if (!text) return;
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        todos.push({ text, completed: false });
        await setStorage(STORAGE_KEYS.TODOS, todos);
        renderTodos(todos);
    };

    const updateTimerDisplay = () => {
        if (!elements.timerMinutes || !elements.timerSeconds) return;
        const mins = Math.floor(timerSecondsRemaining / 60);
        const secs = timerSecondsRemaining % 60;
        elements.timerMinutes.textContent = mins.toString().padStart(2, '0');
        elements.timerSeconds.textContent = secs.toString().padStart(2, '0');
    };

    const toggleTimer = () => {
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            elements.startTimerBtn.textContent = 'Start';
        } else {
            timerRunning = true;
            elements.startTimerBtn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                if (timerSecondsRemaining > 0) {
                    timerSecondsRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    elements.startTimerBtn.textContent = 'Start';
                    showFireworks();
                }
            }, 1000);
        }
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerRunning = false;
        elements.startTimerBtn.textContent = 'Start';
        setTimerDuration(25);
    };

    const setTimerDuration = async (minutes) => {
        clearInterval(timerInterval);
        timerRunning = false;
        elements.startTimerBtn.textContent = 'Start';
        timerSecondsRemaining = minutes * 60;
        await setStorage(STORAGE_KEYS.TIMER_MINUTES, minutes);
        updateTimerDisplay();
    };

    const loadQuickLinks = async () => {
        const links = await getStorage(STORAGE_KEYS.QUICK_LINKS) || [];
        renderQuickLinks(links);
    };

    const renderQuickLinks = (links) => {
        if (!elements.quickLinks) return;
        elements.quickLinks.innerHTML = links.map((link, index) => `
            <a href="${link.url}" class="quick-link" target="_blank">
                ${link.name}
                <button class="delete-link" data-index="${index}">&times;</button>
            </a>
        `).join('');

        elements.quickLinks.querySelectorAll('.delete-link').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const links = await getStorage(STORAGE_KEYS.QUICK_LINKS) || [];
                links.splice(e.target.dataset.index, 1);
                await setStorage(STORAGE_KEYS.QUICK_LINKS, links);
                renderQuickLinks(links);
            });
        });
    };

    const addQuickLink = async () => {
        const name = prompt('Link name:');
        if (!name) return;
        const url = prompt('URL:');
        if (!url) return;
        const links = await getStorage(STORAGE_KEYS.QUICK_LINKS) || [];
        links.push({ name, url: url.startsWith('http') ? url : 'https://' + url });
        await setStorage(STORAGE_KEYS.QUICK_LINKS, links);
        renderQuickLinks(links);
    };

    const loadWeather = async () => {
        if (!elements.weatherDisplay) return;
        
        const fetchWeather = async (location) => {
            try {
                const url = location 
                    ? `https://wttr.in/${location}?format=%c%t`
                    : 'https://wttr.in/?format=%c%t';
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    elements.weatherDisplay.textContent = text.trim();
                }
            } catch (e) {
                elements.weatherDisplay.textContent = '';
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeather(`${latitude},${longitude}`);
                },
                () => {
                    fetchWeather(null);
                }
            );
        } else {
            fetchWeather(null);
        }
    };

    const exportData = async () => {
        const data = {
            focus: await getStorage(STORAGE_KEYS.DAILY_FOCUS),
            darkMode: await getStorage(STORAGE_KEYS.DARK_MODE),
            streakData: await getStorage(STORAGE_KEYS.STREAK_DATA),
            background: await getStorage(STORAGE_KEYS.BACKGROUND),
            todos: await getStorage(STORAGE_KEYS.TODOS),
            quickLinks: await getStorage(STORAGE_KEYS.QUICK_LINKS),
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focustab-backup-${getTodayKey()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const init = () => {
        setupEventListeners();
        initializeDarkMode();
        initializeBackground();
        initializeFocus();
        showRandomQuote();
        updateTime();
        setInterval(updateTime, 1000);
        loadTodos();
        loadQuickLinks();
        loadWeather();
        
        (async () => {
            const timerMinutes = await getStorage(STORAGE_KEYS.TIMER_MINUTES) || 25;
            timerSecondsRemaining = timerMinutes * 60;
            updateTimerDisplay();
        })();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
