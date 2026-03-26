(function() {
    'use strict';

    const STORAGE_KEYS = {
        DARK_MODE: 'darkMode',
        STREAK_DATA: 'streakData',
        TODOS: 'todos',
        QUICK_LINKS: 'quickLinks',
        TIMER_MINUTES: 'timerMinutes',
        MAX_QUESTS: 'maxQuests',
        DEFAULT_TIMER: 'defaultTimerMinutes',
        THEME: 'themePreference',
        BACKGROUND: 'backgroundPreference',
        ENABLE_SOUND: 'enableSound',
        ENABLE_ANIMATIONS: 'enableAnimations'
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

    const get = (id) => {
        const element = document.getElementById(id);
        if (!element) console.warn(`Element with ID '${id}' not found`);
        return element;
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
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                browser.storage.local.get(key).then((data) => {
                    if (data[key] === undefined) {
                        console.warn(`Storage key '${key}' not found, falling back to localStorage`);
                        resolve(localStorage.getItem(key));
                    } else {
                        resolve(data[key]);
                    }
                }).catch((error) => {
                    console.error(`Storage get error for key '${key}':`, error);
                    resolve(localStorage.getItem(key));
                });
            } else {
                resolve(localStorage.getItem(key));
            }
        });
    };

    const setStorage = (key, value) => {
        return new Promise((resolve) => {
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                browser.storage.local.set({ [key]: value }).then(resolve).catch((error) => {
                    console.error(`Storage set error for key '${key}':`, error);
                    localStorage.setItem(key, JSON.stringify(value));
                    resolve();
                });
            } else {
                localStorage.setItem(key, JSON.stringify(value));
                resolve();
            }
        });
    };

    const showFireworks = async () => {
        const enableAnimations = await getStorage(STORAGE_KEYS.ENABLE_ANIMATIONS) || true;
        if (!enableAnimations) return;
        
        const fireworks = get('fireworks');
        if (fireworks) {
            fireworks.style.display = 'block';
            setTimeout(() => { fireworks.style.display = 'none'; }, 3000);
        }
    };

    const updateTime = () => {
        // Time display elements not present in current HTML
        // Keeping function for potential future use
    };

    const getStreakData = async () => {
        const data = await getStorage(STORAGE_KEYS.STREAK_DATA);
        return data || getDefaultStreakData();
    };

    const updateProgress = async () => {
        const streakData = await getStreakData();
        const today = getTodayKey();
        const yesterday = getYesterdayKey();

        if (streakData.lastCompleted !== today && streakData.lastCompleted !== yesterday) {
            streakData.current = 1;
        } else if (streakData.lastCompleted === yesterday) {
            streakData.current += 1;
        } else {
            streakData.current += 1;
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

        weeklyBars.innerHTML = '';
        days.forEach(day => {
            const count = streakData.weeklyHistory[day] || 0;
            const height = Math.max(4, (count / maxCount) * 80);
            const dayName = new Date(day).toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
            const isToday = day === getTodayKey();
            
            const wrapper = document.createElement('div');
            wrapper.className = 'bar-wrapper';
            
            const fill = document.createElement('div');
            fill.className = 'bar-fill';
            fill.style.height = height + 'px';
            
            const label = document.createElement('span');
            label.className = 'bar-label' + (isToday ? ' today' : '');
            label.textContent = dayName;
            
            wrapper.appendChild(fill);
            wrapper.appendChild(label);
            weeklyBars.appendChild(wrapper);
        });
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

    const renderTodos = async (todos) => {
        const todoList = get('todoList');
        const questCount = get('questCount');
        if (!todoList) return;

        // Clean up existing event listeners
        const existingCheckboxes = todoList.querySelectorAll('.quest-checkbox');
        existingCheckboxes.forEach(cb => {
            const clone = cb.cloneNode(true);
            cb.parentNode.replaceChild(clone, cb);
        });

        const existingDeleteBtns = todoList.querySelectorAll('.quest-delete');
        existingDeleteBtns.forEach(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
        });

        todoList.innerHTML = '';
        
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = 'quest-item';
            
            const checkbox = document.createElement('div');
            checkbox.className = 'quest-checkbox';
            checkbox.dataset.index = index;
            
            const span = document.createElement('span');
            span.className = 'quest-text';
            span.textContent = todo.text;
            
            const btn = document.createElement('button');
            btn.className = 'quest-delete';
            btn.dataset.index = index;
            btn.textContent = '\u00D7';
            
            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(btn);
            todoList.appendChild(li);
        });

        const streakData = await getStreakData();
        if (questCount) questCount.textContent = streakData.totalCompleted;

        todoList.querySelectorAll('.quest-checkbox').forEach(cb => {
            cb.addEventListener('click', async (e) => {
                const todos = await getStorage(STORAGE_KEYS.TODOS) || [];
                const idx = parseInt(e.target.dataset.index);
                const todo = todos[idx];
                if (todo && !todo.completed) {
                    const questItem = e.target.closest('.quest-item');
                    questItem.classList.add('completing');
                    setTimeout(async () => {
                        todos.splice(idx, 1);
                        await setStorage(STORAGE_KEYS.TODOS, todos);
                        await updateProgress();
                        showFireworks();
                        renderTodos(todos);
                    }, 400);
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
        const maxQuests = await getStorage(STORAGE_KEYS.MAX_QUESTS) || 3;
        if (todos.length >= maxQuests) {
            alert(`Maximum ${maxQuests} active quests at a time. Complete one first!`);
            return;
        }
        todos.push({ text: text.trim() });
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
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerRunning = false;
        const btn = get('startTimerBtn');
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Start';
        }
        setTimerDuration(25);
    };

    const setTimerDuration = async (minutes) => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerRunning = false;
        const btn = get('startTimerBtn');
        if (btn) {
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Start';
        }
        totalTimerSeconds = minutes * 60;
        timerSecondsRemaining = minutes * 60;
        await setStorage(STORAGE_KEYS.TIMER_MINUTES, minutes);
        await setStorage(STORAGE_KEYS.DEFAULT_TIMER, minutes);
        updateTimerDisplay();

        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.minutes) === minutes);
        });
    };

    const applyBackground = async () => {
        try {
            const backgroundPref = await getStorage(STORAGE_KEYS.BACKGROUND) || 'seasonal';
            
            if (backgroundPref === 'seasonal') {
                document.body.style.background = getSeasonalGradient();
            } else {
                const preset = BACKGROUND_PRESETS.find(p => p.id === backgroundPref);
                if (preset) {
                    document.body.style.background = preset.gradient;
                } else {
                    document.body.style.background = getSeasonalGradient();
                }
            }
        } catch (error) {
            console.error('Error applying background:', error);
            document.body.style.background = getSeasonalGradient();
        }
    };

    const initializeBackground = applyBackground;

    const toggleDarkMode = async () => {
        const currentTheme = await getStorage(STORAGE_KEYS.THEME) || 'system';
        let newTheme;
        
        if (currentTheme === 'light') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'system';
        } else {
            newTheme = 'light';
        }
        
        await setStorage(STORAGE_KEYS.THEME, newTheme);
        await initializeDarkMode();
    };

    const initializeDarkMode = async () => {
        try {
            const themePref = await getStorage(STORAGE_KEYS.THEME) || 'system';
            const darkMode = themePref === 'dark' || (themePref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            if (darkMode) document.body.classList.add('dark-mode');
        } catch (e) {
            console.error('Error initializing dark mode:', e);
        }
    };

    const showRandomQuote = () => {
        // Quote display element not present in current HTML
        // Keeping function for potential future use
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

    const cleanupEventListeners = () => {
        const darkModeToggle = get('darkModeToggle');
        const addQuestForm = get('addQuestForm');
        const startTimerBtn = get('startTimerBtn');
        const resetTimerBtn = get('resetTimerBtn');
        const statsToggle = get('statsToggle');
        const closeProgressPanel = get('closeProgressPanel');
        const exportDataBtn = get('exportDataBtn');

        if (darkModeToggle) {
            const clone = darkModeToggle.cloneNode(true);
            darkModeToggle.parentNode.replaceChild(clone, darkModeToggle);
        }
        if (addQuestForm) {
            const clone = addQuestForm.cloneNode(true);
            addQuestForm.parentNode.replaceChild(clone, addQuestForm);
        }
        if (startTimerBtn) {
            const clone = startTimerBtn.cloneNode(true);
            startTimerBtn.parentNode.replaceChild(clone, startTimerBtn);
        }
        if (resetTimerBtn) {
            const clone = resetTimerBtn.cloneNode(true);
            resetTimerBtn.parentNode.replaceChild(clone, resetTimerBtn);
        }
        if (statsToggle) {
            const clone = statsToggle.cloneNode(true);
            statsToggle.parentNode.replaceChild(clone, statsToggle);
        }
        if (closeProgressPanel) {
            const clone = closeProgressPanel.cloneNode(true);
            closeProgressPanel.parentNode.replaceChild(clone, closeProgressPanel);
        }
        if (exportDataBtn) {
            const clone = exportDataBtn.cloneNode(true);
            exportDataBtn.parentNode.replaceChild(clone, exportDataBtn);
        }

        document.querySelectorAll('.preset-btn').forEach(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
        });
    };

    const init = async () => {
        // Clean up any existing event listeners
        cleanupEventListeners();

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

        // Clean up timer on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(timerInterval);
        });

        initializeDarkMode();
        initializeBackground();
        // updateTime();
        // setInterval(updateTime, 1000);
        loadTodos();
        // showRandomQuote();

        const timerMinutes = await getStorage(STORAGE_KEYS.TIMER_MINUTES) || (await getStorage(STORAGE_KEYS.DEFAULT_TIMER) || 25);
        setTimerDuration(timerMinutes);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
