(function() {
    'use strict';

    const STORAGE_KEYS = {
        DARK_MODE: 'darkMode',
        STREAK_DATA: 'streakData',
        TODOS: 'todos',
        QUICK_LINKS: 'quickLinks',
        TIMER_MINUTES: 'timerMinutes'
    };

    const getSeasonalGradient = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'linear-gradient(135deg, #e056fd 0%, #be2edd 100%)';
        if (month >= 5 && month <= 7) return 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)';
        if (month >= 8 && month <= 10) return 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)';
        return 'linear-gradient(135deg, #a29bfe 0%, #2d1b4e 100%)';
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

    const get = (id) => document.getElementById(id);

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
                    resolve(error ? localStorage.getItem(key) : data[key]);
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
                storage.local.set({ [key]: value }, resolve);
            } else {
                localStorage.setItem(key, value);
                resolve();
            }
        });
    };

    const showFireworks = () => {
        const fireworks = get('fireworks');
        if (fireworks) {
            fireworks.style.display = 'block';
            setTimeout(() => { fireworks.style.display = 'none'; }, 3000);
        }
    };

    const updateTime = () => {
        const now = new Date();
        const timeEl = get('currentTime');
        const dateEl = get('currentDate');
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false });
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
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

        if (streakData.current > streakData.longest) streakData.longest = streakData.current;
        streakData.lastCompleted = today;
        streakData.totalCompleted += 1;
        streakData.weeklyHistory[today] = (streakData.weeklyHistory[today] || 0) + 1;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        Object.keys(streakData.weeklyHistory).forEach(key => {
            if (new Date(key) < sevenDaysAgo) delete streakData.weeklyHistory[key];
        });

        await setStorage(STORAGE_KEYS.STREAK_DATA, streakData);
    };

    const renderProgress = async () => {
        const streakData = await getStreakData();
        const streakCount = get('streakCount');
        const longestStreak = get('longestStreak');
        const totalCompleted = get('totalCompleted');
        const weeklyBars = get('weeklyBars');

        if (streakCount) streakCount.textContent = streakData.current;
        if (longestStreak) longestStreak.textContent = streakData.longest;
        if (totalCompleted) totalCompleted.textContent = streakData.totalCompleted;

        if (!weeklyBars) return;

        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }

        const maxCount = Math.max(1, ...Object.values(streakData.weeklyHistory));

        weeklyBars.innerHTML = days.map(day => {
            const count = streakData.weeklyHistory[day] || 0;
            const height = Math.max(4, (count / maxCount) * 80);
            const dayName = new Date(day).toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
            const isToday = day === getTodayKey();
            return `<div class="bar-wrapper"><div class="bar-fill" style="height: ${height}px"></div><span class="bar-label ${isToday ? 'today' : ''}">${dayName}</span></div>`;
        }).join('');
    };

    const toggleProgressPanel = async () => {
        const panel = get('progressPanel');
        if (!panel) return;
        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) await renderProgress();
    };

    const loadTodos = async () => {
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        renderTodos(todos);
    };

    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const renderTodos = (todos) => {
        const todoList = get('todoList');
        const questCount = get('questCount');
        if (!todoList) return;

        const incomplete = todos.filter(t => !t.completed);
        const completed = todos.filter(t => t.completed);

        todoList.innerHTML = [...incomplete, ...completed].map((todo, index) => `
            <li class="quest-item ${todo.completed ? 'completed' : ''}">
                <div class="quest-checkbox ${todo.completed ? 'checked' : ''}" data-index="${index}"></div>
                <span class="quest-text">${escapeHtml(todo.text)}</span>
                <button class="quest-delete" data-index="${index}">&times;</button>
            </li>
        `).join('');

        if (questCount) questCount.textContent = todos.filter(t => !t.completed).length;

        todoList.querySelectorAll('.quest-checkbox').forEach(cb => {
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

        todoList.querySelectorAll('.quest-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                todos.splice(parseInt(e.target.dataset.index), 1);
                await setStorage(STORAGE_KEYS.TODOS, todos);
                renderTodos(todos);
            });
        });
    };

    const addTodo = async (text) => {
        if (!text || !text.trim()) return;
        const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
        const active = todos.filter(t => !t.completed);
        if (active.length >= 3) {
            alert('Maximum 3 active quests at a time. Complete one first!');
            return;
        }
        todos.push({ text: text.trim(), completed: false });
        await setStorage(STORAGE_KEYS.TODOS, todos);
        renderTodos(todos);
    };

    const updateTimerDisplay = () => {
        const minsEl = get('timerMinutes');
        const secsEl = get('timerSeconds');
        if (!minsEl || !secsEl) return;
        const mins = Math.floor(timerSecondsRemaining / 60);
        const secs = timerSecondsRemaining % 60;
        minsEl.textContent = mins.toString().padStart(2, '0');
        secsEl.textContent = secs.toString().padStart(2, '0');
    };

    const toggleTimer = () => {
        const btn = get('startTimerBtn');
        if (!btn) return;
        const btnText = btn.querySelector('.btn-text');
        if (!btnText) return;

        if (timerRunning) {
            clearInterval(timerInterval);
            timerRunning = false;
            btnText.textContent = 'Start';
        } else {
            timerRunning = true;
            btnText.textContent = 'Pause';
            timerInterval = setInterval(() => {
                if (timerSecondsRemaining > 0) {
                    timerSecondsRemaining--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    btnText.textContent = 'Start';
                    showFireworks();
                }
            }, 1000);
        }
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerRunning = false;
        const btn = get('startTimerBtn');
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Start';
        }
        setTimerDuration(25);
    };

    const setTimerDuration = async (minutes) => {
        clearInterval(timerInterval);
        timerRunning = false;
        const btn = get('startTimerBtn');
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Start';
        }
        totalTimerSeconds = minutes * 60;
        timerSecondsRemaining = minutes * 60;
        await setStorage(STORAGE_KEYS.TIMER_MINUTES, minutes);
        updateTimerDisplay();

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
        });
    };

    const applyBackground = (background) => {
        if (background?.type === 'custom' && background.image) {
            document.body.style.background = `url(${background.image}) center/cover no-repeat fixed`;
        } else if (background?.preset && background.preset !== 'default') {
            const preset = BACKGROUND_PRESETS.find(p => p.id === background.preset);
            if (preset) document.body.style.background = preset.gradient;
        } else {
            document.body.style.background = getSeasonalGradient();
        }
    };

    const initializeBackground = async () => {
        try {
            const background = await getStorage('background');
            applyBackground(background || { preset: 'default' });
        } catch (e) {
            applyBackground({ preset: 'default' });
        }
    };

    const toggleDarkMode = async () => {
        const isDark = document.body.classList.toggle('dark-mode');
        await setStorage(STORAGE_KEYS.DARK_MODE, isDark);
    };

    const initializeDarkMode = async () => {
        try {
            const darkMode = await getStorage(STORAGE_KEYS.DARK_MODE);
            if (darkMode) document.body.classList.add('dark-mode');
        } catch (e) {}
    };

    const showRandomQuote = () => {
        const quoteEl = get('dailyQuote');
        if (quoteEl) quoteEl.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    };

    const exportData = async () => {
        const data = {
            todos: await getStorage(STORAGE_KEYS.TODOS),
            streakData: await getStorage(STORAGE_KEYS.STREAK_DATA),
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `focustab-backup-${getTodayKey()}.json`;
        a.click();
    };

    const init = async () => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                toggleProgressPanel();
            }
        });

        get('darkModeToggle')?.addEventListener('click', toggleDarkMode);
        
        get('addQuestForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = get('newQuestInput');
            if (input) {
                addTodo(input.value);
                input.value = '';
            }
        });

        get('startTimerBtn')?.addEventListener('click', toggleTimer);
        get('resetTimerBtn')?.addEventListener('click', resetTimer);

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => setTimerDuration(parseInt(btn.dataset.minutes)));
        });

        get('statsToggle')?.addEventListener('click', toggleProgressPanel);
        get('closeProgressPanel')?.addEventListener('click', () => { get('progressPanel').style.display = 'none'; });
        get('exportDataBtn')?.addEventListener('click', exportData);

        initializeDarkMode();
        initializeBackground();
        updateTime();
        setInterval(updateTime, 1000);
        loadTodos();
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
