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
        inputError: document.getElementById('inputError')
    };

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
        clearError();
    };

    const showActiveFocusArea = (focus) => {
        elements.setFocusArea.style.display = 'none';
        elements.activeFocusArea.style.display = 'flex';
        elements.focusText.textContent = `Focus with all your power! ${focus}`;
    };

    const saveFocus = async () => {
        const focus = elements.newFocusInput.value.trim();
        
        if (!focus) {
            showError('Please enter a focus task');
            elements.newFocusInput.focus();
            return false;
        }

        if (focus.length > 200) {
            showError('Focus task is too long (max 200 characters)');
            return false;
        }

        try {
            await setStorage(STORAGE_KEYS.DAILY_FOCUS, focus);
            showActiveFocusArea(focus);
            return true;
        } catch (error) {
            console.error('Error saving focus:', error);
            showError('Failed to save focus. Please try again.');
            return false;
        }
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
            } else {
                showSetFocusArea();
            }
        } catch (error) {
            console.error('Error loading focus:', error);
            showSetFocusArea();
        }
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
            completeFocus();
        });
    };

    const init = () => {
        setupEventListeners();
        initializeDarkMode();
        initializeFocus();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
