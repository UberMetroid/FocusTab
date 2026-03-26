(function() {
    'use strict';

    const STORAGE_KEYS = {
        MAX_QUESTS: 'maxQuests',
        DEFAULT_TIMER: 'defaultTimerMinutes',
        THEME: 'themePreference',
        BACKGROUND: 'backgroundPreference',
        ENABLE_SOUND: 'enableSound',
        ENABLE_ANIMATIONS: 'enableAnimations'
    };

    const get = (id) => {
        const element = document.getElementById(id);
        if (!element) console.warn(`Element with ID '${id}' not found`);
        return element;
    };

    const getStorage = (key) => {
        return new Promise((resolve) => {
            if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
                browser.storage.local.get(key).then((data) => {
                    resolve(data[key]);
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

    const loadSettings = async () => {
        try {
            const maxQuests = await getStorage(STORAGE_KEYS.MAX_QUESTS) || 3;
            const defaultTimer = await getStorage(STORAGE_KEYS.DEFAULT_TIMER) || 25;
            const theme = await getStorage(STORAGE_KEYS.THEME) || 'system';
            const background = await getStorage(STORAGE_KEYS.BACKGROUND) || 'seasonal';
            const enableSound = await getStorage(STORAGE_KEYS.ENABLE_SOUND) || false;
            const enableAnimations = await getStorage(STORAGE_KEYS.ENABLE_ANIMATIONS) || true;

            get('maxQuests').value = maxQuests;
            get('defaultTimer').value = defaultTimer;
            get('themeSelect').value = theme;
            get('backgroundPreset').value = background;
            get('enableSound').checked = enableSound;
            get('enableAnimations').checked = enableAnimations;
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async () => {
        try {
            const settings = {
                [STORAGE_KEYS.MAX_QUESTS]: parseInt(get('maxQuests').value),
                [STORAGE_KEYS.DEFAULT_TIMER]: parseInt(get('defaultTimer').value),
                [STORAGE_KEYS.THEME]: get('themeSelect').value,
                [STORAGE_KEYS.BACKGROUND]: get('backgroundPreset').value,
                [STORAGE_KEYS.ENABLE_SOUND]: get('enableSound').checked,
                [STORAGE_KEYS.ENABLE_ANIMATIONS]: get('enableAnimations').checked
            };

            for (const [key, value] of Object.entries(settings)) {
                await setStorage(key, value);
            }

            showStatusMessage('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            showStatusMessage('Error saving settings', 'error');
        }
    };

    const showStatusMessage = (message, type = 'info') => {
        // Implementation would create and show a temporary message
        console.log(`[${type.toUpperCase()}] ${message}`);
        alert(message); // Temporary until UI is implemented
    };

    const exportData = async () => {
        try {
            const data = {};
            const keys = Object.values(STORAGE_KEYS);
            
            for (const key of keys) {
                data[key] = await getStorage(key);
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `focustab-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showStatusMessage('Settings exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            showStatusMessage('Error exporting data', 'error');
        }
    };

    const importData = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    for (const [key, value] of Object.entries(data)) {
                        if (Object.values(STORAGE_KEYS).includes(key)) {
                            await setStorage(key, value);
                        }
                    }
                    
                    await loadSettings();
                    showStatusMessage('Settings imported successfully!', 'success');
                } catch (error) {
                    console.error('Error importing data:', error);
                    showStatusMessage('Error importing data', 'error');
                }
            };
            reader.readAsText(file);
        });
        
        input.click();
    };

    const resetStats = async () => {
        if (confirm('Are you sure you want to reset all stats? This cannot be undone.')) {
            try {
                // Reset all storage keys related to stats
                const keysToReset = [
                    'streakData',
                    'todos',
                    'timerMinutes'
                ];
                
                for (const key of keysToReset) {
                    await setStorage(key, null);
                    localStorage.removeItem(key);
                }
                
                showStatusMessage('All stats have been reset', 'success');
            } catch (error) {
                console.error('Error resetting stats:', error);
                showStatusMessage('Error resetting stats', 'error');
            }
        }
    };

    const init = () => {
        // Set up event listeners
        get('saveSettingsBtn')?.addEventListener('click', saveSettings);
        get('cancelSettingsBtn')?.addEventListener('click', () => {
            window.close();
        });
        get('exportDataBtn')?.addEventListener('click', exportData);
        get('importDataBtn')?.addEventListener('click', importData);
        get('resetStatsBtn')?.addEventListener('click', resetStats);

        // Load current settings
        loadSettings();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();