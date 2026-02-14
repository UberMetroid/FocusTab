(function() {
    'use strict';

    const STORAGE_KEYS = {
        DARK_MODE: 'darkMode',
        STREAK_DATA: 'streakData',
        TODOS: 'todos',
        QUICK_LINKS: 'quickLinks',
        TIMER_MINUTES: 'timerMinutes'
    };

    const BACKGROUND_PRESETS = [
        { id: 'default', name: 'Seasonal', gradient: getSeasonalGradient() },
        { id: 'spring', name: 'Spring', gradient: 'linear-gradient(135deg, #e056fd 0%, #be2edd 100%)' },
        { id: 'summer', name: 'Summer', gradient: 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' },
        { id: 'autumn', name: 'Autumn', gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)' },
        { id: 'winter', name: 'Winter', gradient: 'linear-gradient(135deg, #a29bfe 0%, #2d1b4e 100%)' },
        { id: 'sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
        { id: 'ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
        { id: 'forest', name: 'Forest', gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
        { id: 'purple', name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { id: 'pink', name: 'Sakura', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
    ];

    const getSeasonalGradient = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'linear-gradient(135deg, #e056fd 0%, #be2edd 100%)';
        if (month >= 5 && month <= 7) return 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)';
        if (month >= 8 && month <= 10) return 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
        return 'linear-gradient(135deg, #a29bfe 0%, #2d1b4e 100%)';
    };

    const elements = {
        darkModeToggle: document.getElementById('darkModeToggle'),
        todoList: document.getElementById('todoList'),
        addTodoBtn: document.getElementById('addTodoBtn'),
        newQuestInput: document.getElementById('newQuestInput'),
        addQuestForm: document.getElementById('addQuestForm'),
        timerMinutes: document.getElementById('timerMinutes'),
        timerSeconds: document.getElementById('timerSeconds'),
        timerProgress: document.getElementById('timerProgress'),
        startTimerBtn: document.getElementById('startTimerBtn'),
        quickLinks: document.getElementById('quickLinks'),
        addLinkBtn: document.getElementById('addLinkBtn'),
        weatherDisplay: document.getElementById('weatherDisplay'),
        locationDisplay: document.getElementById('locationDisplay'),
        dailyQuote: document.getElementById('dailyQuote'),
        progressPanel: document.getElementById('progressPanel'),
        statsToggle: document.getElementById('statsToggle'),
        closeProgressPanel: document.getElementById('closeProgressPanel'),
        streakCount: document.getElementById('streakCount'),
        longestStreak: document.getElementById('longestStreak'),
        totalCompleted: document.getElementById('totalCompleted'),
        weeklyBars: document.getElementById('weeklyBars'),
        questCount: document.getElementById('questCount'),
        exportDataBtn: document.getElementById('exportDataBtn'),
        currentTime: document.getElementById('currentTime'),
        currentDate: document.getElementById('currentDate')
    };

    let timerInterval = null;
    let timerSecondsRemaining = 25 * 60;
    let timerRunning = false;
    let totalTimerSeconds = 25 * 60;

    const QUOTES = [
        "One step at a time. You've got this!",
        "Focus is the key to all success.",
        "Small progress is still progress.",
        "You're doing great! Keep going!",
        "Every moment counts. Make it matter.",
        "The best time to start is now.",
        "Dream big, work hard, stay focused.",
        "Progress, not perfection.",
        "You've survived 100% of your hardest days.",
        "Success is built one task at a time.",
        "Keep showing up. That's the secret.",
        "Your future self will thank you.",
        "Be present. Be focused. Be grateful.",
        "Done is better than perfect.",
        "You are capable of amazing things."
    ];

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

    const getStorage = (key) => {
        return new Promise((resolve) => {
            const storage = window.browser?.storage || window.chrome.storage;
            if (storage) {
                storage.local.get(key, (data) => {
                    const error = window.browser?.runtime?.lastError || window.chrome.runtime?.lastError;
                    if (error) {
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
                    resolve();
                });
            } else {
                localStorage.setItem(key, value);
                resolve();
            }
        });
    };

    const showFireworks = () => {
        const fireworks = document.getElementById('fireworks');
        if (fireworks) {
            fireworks.style.display = 'block';
            setTimeout(() => {
                fireworks.style.display = 'none';
            }, 3000);
        }
    };

    const updateTime = () => {
        const now = new Date();
        if (elements.currentTime) {
            elements.currentTime.textContent = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
        if (elements.currentDate) {
            elements.currentDate.textContent = now.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
        }
    };

    const loadTodos = async () => {
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        renderTodos(todos);
    };

    const renderTodos = (todos) => {
        if (!elements.todoList) return;
        
        const incomplete = todos.filter(t => !t.completed);
        const completed = todos.filter(t => t.completed);
        
        elements.todoList.innerHTML = [...incomplete, ...completed].map((todo, index) => `
            <li class="quest-item ${todo.completed ? 'completed' : ''}">
                <div class="quest-checkbox ${todo.completed ? 'checked' : ''}" data-index="${index}"></div>
                <span class="quest-text">${escapeHtml(todo.text)}</span>
                <button class="quest-delete" data-index="${index}">&times;</button>
            </li>
        `).join('');

        elements.questCount.textContent = todos.filter(t => !t.completed).length;

        elements.todoList.querySelectorAll('.quest-checkbox').forEach(cb => {
            cb.addEventListener('click', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                const idx = parseInt(e.target.dataset.index);
                const todo = todos[idx];
                if (todo && !todo.completed) {
                    todo.completed = true;
                    await setStorage(STORAGE_KEYS.TODOS, todos);
                    await updateProgress();
                    showFireworks();
                    renderTodos(todos);
                }
            });
        });

        elements.todoList.querySelectorAll('.quest-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                const idx = parseInt(e.target.dataset.index);
                todos.splice(idx, 1);
                await setStorage(STORAGE_KEYS.TODOS, todos);
                renderTodos(todos);
            });
        });
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const addTodo = async (text) => {
        if (!text || !text.trim()) return;
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        todos.push({ text: text.trim(), completed: false });
        await setStorage(STORAGE_KEYS.TODOS, todos);
        renderTodos(todos);
    };

    const updateTimerDisplay = () => {
        if (!elements.timerMinutes || !elements.timerSeconds) return;
        const mins = Math.floor(timerSecondsRemaining / 60);
        const secs = timerSecondsRemaining % 60;
        elements.timerMinutes.textContent = mins.toString().padStart(2, '0');
        elements.timerSeconds.textContent = secs.toString().padStart(2, '0');
        
        const progress = ((totalTimerSeconds - timerSecondsRemaining) / totalTimerSeconds) * 565.48;
        if (elements.timerProgress) {
            elements.timerProgress.style.strokeDashoffset = 565.48 - progress;
        }
    };

    const toggleTimer = () => {
        const btn = elements.startTimerBtn.querySelector('.btn-text');
        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            btn.textContent = 'Start';
        } else {
            timerRunning = true;
            btn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                if (timerSecondsRemaining > 0) {
                    timerSecondsRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    btn.textContent = 'Start';
                    showFireworks();
                }
            }, 1000);
        }
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerRunning = false;
        const btn = elements.startTimerBtn.querySelector('.btn-text');
        btn.textContent = 'Start';
        setTimerDuration(25);
    };

    const setTimerDuration = async (minutes) => {
        clearInterval(timerInterval);
        timerRunning = false;
        const btn = elements.startTimerBtn.querySelector('.btn-text');
        btn.textContent = 'Start';
        totalTimerSeconds = minutes * 60;
        timerSecondsRemaining = minutes * 60;
        await setStorage(STORAGE_KEYS.TIMER_MINUTES, minutes);
        updateTimerDisplay();
        
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
        });
    };

    const loadQuickLinks = async () => {
        const links = await getStorage(STORAGE_KEYS.QUICK_LINKS) || [];
        renderQuickLinks(links);
    };

    const renderQuickLinks = (links) => {
        if (!elements.quickLinks) return;
        elements.quickLinks.innerHTML = links.map((link, index) => `
            <a href="${escapeHtml(link.url)}" class="link-item" target="_blank">
                ${escapeHtml(link.name)}
                <button class="link-delete" data-index="${index}">&times;</button>
            </a>
        `).join('');

        elements.quickLinks.querySelectorAll('.link-delete').forEach(btn => {
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
                    ? `https://wttr.in/${location}?format=%l+%t`
                    : 'https://wttr.in/?format=%l+%t';
                const response = await fetch(url);
                if (response.ok) {
                    const text = await response.text();
                    const parts = text.trim().split(' ');
                    if (parts.length >= 2) {
                        elements.locationDisplay.textContent = parts[0];
                        elements.weatherDisplay.textContent = parts.slice(1).join(' ');
                    }
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
                () => fetchWeather(null)
            );
        } else {
            fetchWeather(null);
        }
    };

    const getStreakData = async () => {
        const data = await getStorage(STORAGE_KEYS.STREAK_DATA);
        return data || getDefaultStreakData();
    };

    const updateProgress = async () => {
        const streakData = await getStreakData();
        const today = getTodayKey();
        const yesterday = getYesterdayKey();

        if (streakData.lastCompleted === today) return;

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

        await setStorage(STORAGE_KEYS.STREAK_DATA, streakData);
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
            const height = Math.max(4, (count / maxCount) * 80);
            const dayName = new Date(day).toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
            const isToday = day === getTodayKey();
            return `
                <div class="bar-wrapper">
                    <div class="bar-fill" style="height: ${height}px"></div>
                    <span class="bar-label ${isToday ? 'today' : ''}">${dayName}</span>
                </div>
            `;
        }).join('');
    };

    const toggleProgressPanel = async () => {
        const isVisible = elements.progressPanel.style.display === 'block';
        elements.progressPanel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            await renderProgress();
        }
    };

    const exportData = async () => {
        const data = {
            todos: await getStorage(STORAGE_KEYS.TODOS),
            quickLinks: await getStorage(STORAGE_KEYS.QUICK_LINKS),
            streakData: await getStorage(STORAGE_KEYS.STREAK_DATA),
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

    const applyBackground = (background) => {
        if (background?.type === 'custom' && background.image) {
            document.body.style.background = `url(${background.image}) center/cover no-repeat fixed`;
        } else if (background?.preset && background.preset !== 'default') {
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
            const background = await getStorage('background');
            if (background) {
                applyBackground(background);
            } else {
                applyBackground({ preset: 'default' });
            }
        } catch (error) {
            applyBackground({ preset: 'default' });
        }
    };

    const toggleDarkMode = async (isDarkMode) => {
        document.body.classList.toggle('dark-mode', isDarkMode);
        await setStorage(STORAGE_KEYS.DARK_MODE, isDarkMode);
    };

    const initializeDarkMode = async () => {
        try {
            const darkMode = await getStorage(STORAGE_KEYS.DARK_MODE);
            if (darkMode) {
                document.body.classList.add('dark-mode');
            }
        } catch (error) {
            console.error('Error loading dark mode preference:', error);
        }
    };

    const showRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        elements.dailyQuote.textContent = QUOTES[randomIndex];
    };

    const setupEventListeners = () => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                toggleProgressPanel();
            }
        });

        elements.darkModeToggle?.addEventListener('click', () => {
            toggleDarkMode(document.body.classList.contains('dark-mode') ? false : true);
        });

        elements.addQuestForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            addTodo(elements.newQuestInput.value);
            elements.newQuestInput.value = '';
        });

        elements.startTimerBtn?.addEventListener('click', toggleTimer);

        elements.resetTimerBtn?.addEventListener('click', resetTimer);

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimerDuration(parseInt(btn.dataset.minutes));
            });
        });

        elements.addLinkBtn?.addEventListener('click', addQuickLink);

        elements.statsToggle?.addEventListener('click', toggleProgressPanel);

        elements.closeProgressPanel?.addEventListener('click', () => {
            elements.progressPanel.style.display = 'none';
        });

        elements.exportDataBtn?.addEventListener('click', exportData);
    };

    const init = async () => {
        setupEventListeners();
        initializeDarkMode();
        initializeBackground();
        updateTime();
        setInterval(updateTime, 1000);
        loadTodos();
        loadQuickLinks();
        loadWeather();
        showRandomQuote();
        
        const timerMinutes = await getStorage(STORAGE_KEYS.TIMER_MINUTES) || 25;
        setTimerDuration(timerMinutes);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
