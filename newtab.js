(function() {
    'use strict';

    const STORAGE_KEYS = {
        DAILY_FOCUS: 'dailyFocus',
        DARK_MODE: 'darkMode'
    };

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
        dailyQuote: document.getElementById('dailyQuote')
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
        "Star Wars",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Hakuna Matata! - The Lion King",
        "Just do it! - Nike",
        "I will be the change that I wish to see in the world. - Gandhi",
        "May the Force be with you. - Star Wars",
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
            showSetFocusArea();
            showFireworks();
        } catch (error) {
            console.error('Error clearing focus:', error);
            showError('Failed to complete focus. Please try again.');
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
    };

    const init = () => {
        setupEventListeners();
        initializeDarkMode();
        initializeFocus();
        showRandomQuote();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
