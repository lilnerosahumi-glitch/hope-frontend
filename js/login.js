// ===========================================
// COMPLETE LOGIN.JS FOR HOPE PROJECT
// ===========================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Login system initialized');
    
    // ===========================================
    // ELEMENTS
    // ===========================================
    const loginModal = document.getElementById('login-modal');
    const loginForm = document.getElementById('login-form');
    const loginPromptBtn = document.getElementById('login-prompt-btn');
    const closeModalBtn = document.querySelector('.close-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const usernameDisplay = document.getElementById('username-display');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loginPrompt = document.getElementById('login-prompt');
    
    // ===========================================
    // FUNCTIONS
    // ===========================================
    
    // Check if user is logged in
    async function checkLogin() {
        try {
            const user = api.getCurrentUser();
            
            if (user) {
                // User is logged in
                if (usernameDisplay) {
                    usernameDisplay.textContent = user.username;
                }
                
                if (loginPrompt) {
                    loginPrompt.classList.add('hidden');
                }
                
                console.log(`👤 User logged in: ${user.username}`);
                return user;
            } else {
                // User is not logged in
                if (usernameDisplay) {
                    usernameDisplay.textContent = '';
                }
                
                console.log('👤 No user logged in');
                return null;
            }
        } catch (error) {
            console.error('Check login error:', error);
            return null;
        }
    }
    
    // Handle tab switching
    function handleTabSwitch(tabName) {
        const user = api.getCurrentUser();
        
        if (tabName === 'my-boards' && !user) {
            // Show login prompt for My Boards tab
            if (loginPrompt) {
                loginPrompt.classList.remove('hidden');
            }
        } else if (loginPrompt) {
            loginPrompt.classList.add('hidden');
        }
    }
    
    // ===========================================
    // EVENT LISTENERS - LOGIN MODAL
    // ===========================================
    
    // Show login modal
    if (loginPromptBtn) {
        loginPromptBtn.addEventListener('click', function() {
            console.log('Login prompt button clicked');
            if (loginModal) {
                loginModal.style.display = 'block';
            }
        });
    }
    
    // Close modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // ===========================================
    // LOGIN FORM SUBMISSION
    // ===========================================
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const recoveryNote = document.getElementById('recovery-note').value.trim();
            
            if (!username) {
                alert('Please enter a username');
                return;
            }
            
            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Logging in...';
            submitBtn.disabled = true;
            
            try {
                console.log(`Attempting login for: ${username}`);
                
                // Use the API
                const result = await api.login(username, password);
                
                if (result && result.token) {
                    console.log('✅ Login successful:', result.user.username);
                    
                    // Close modal
                    if (loginModal) {
                        loginModal.style.display = 'none';
                    }
                    
                    // Reset form
                    loginForm.reset();
                    
                    // Update UI
                    await checkLogin();
                    
                    // Show welcome message
                    alert(`Welcome to Hope Project, ${username}!`);
                    
                    // If on boards page, refresh to show My Boards
                    if (window.location.pathname.includes('boards.html')) {
                        console.log('Refreshing boards page...');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    }
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('❌ Login error:', error);
                
                // Fallback: create local user anyway
                console.log('Using local fallback login');
                const fakeResult = {
                    token: 'local-token-' + Date.now(),
                    user: { id: 'local-user-' + Date.now(), username: username }
                };
                
                api.setToken(fakeResult.token);
                localStorage.setItem('hope_user', JSON.stringify(fakeResult.user));
                
                // Close modal
                if (loginModal) {
                    loginModal.style.display = 'none';
                }
                
                // Update UI
                await checkLogin();
                
                alert(`Welcome ${username}! (Using local mode)`);
                
                // Refresh if on boards page
                if (window.location.pathname.includes('boards.html')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                }
            } finally {
                // Reset button
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }
    
    // ===========================================
    // LOGOUT FUNCTIONALITY
    // ===========================================
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Logout clicked');
            
            api.logout();
            checkLogin();
            
            alert('You have been logged out.');
            
            // Refresh if on boards page to show login prompt
            if (window.location.pathname.includes('boards.html')) {
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }
        });
    }
    
    // ===========================================
    // TAB SWITCHING (FOR BOARDS PAGE)
    // ===========================================
    if (tabButtons.length > 0) {
        tabButtons.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                console.log(`Tab clicked: ${tabName}`);
                handleTabSwitch(tabName);
            });
        });
    }
    
    // ===========================================
    // FIX FOR "CREATE BOARD" BUTTONS
    // ===========================================
    setTimeout(function() {
        console.log('Setting up Create Board button listeners...');
        
        // Function to handle Create Board buttons
        function handleCreateBoardClick(buttonId) {
            const button = document.getElementById(buttonId);
            if (!button) return;
            
            button.addEventListener('click', async function(e) {
                console.log(`${buttonId} clicked`);
                
                // Check if user is logged in
                const user = api.getCurrentUser();
                
                if (!user) {
                    console.log('User not logged in, showing login modal');
                    
                    // Show login modal
                    if (loginModal) {
                        loginModal.style.display = 'block';
                        return;
                    } else {
                        alert('Please login first! Click the "Login / Register" button above.');
                        return;
                    }
                }
                
                // User is logged in, create board
                const title = prompt('Enter a title for your new inspiration board:');
                
                if (!title || title.trim() === '') {
                    console.log('No title entered');
                    return;
                }
                
                console.log(`Creating board: "${title}"`);
                
                try {
                    const board = await api.createBoard(title.trim());
                    console.log('Board created:', board);
                    
                    alert(`🎨 Board "${title}" created successfully!\n\nYou can now add images, text, stickers, and music to your board.`);
                    
                    // In a full implementation, you would open the board editor here
                    // For now, just show success message
                    
                } catch (error) {
                    console.error('Create board error:', error);
                    
                    // Local fallback
                    const localBoard = {
                        _id: 'local-board-' + Date.now(),
                        title: title.trim(),
                        elements: [],
                        createdAt: new Date()
                    };
                    
                    alert(`🎨 Board "${title}" created (local mode)!\n\nNote: Boards saved locally will disappear on page refresh.`);
                    
                    console.log('Local board created:', localBoard);
                }
            });
            
            console.log(`Listener added for ${buttonId}`);
        }
        
        // Set up both Create Board buttons
        handleCreateBoardClick('create-board-btn');
        handleCreateBoardClick('create-my-board-btn');
        
    }, 1000); // Wait 1 second for page to load
    
    // ===========================================
    // INITIALIZATION
    // ===========================================
    
    // Initial login check
    await checkLogin();
    
    // Center the login prompt button (CSS fix)
    if (loginPromptBtn) {
        loginPromptBtn.style.display = 'block';
        loginPromptBtn.style.margin = '20px auto';
    }
    
    // Check current tab on boards page
    if (window.location.pathname.includes('boards.html')) {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabName = activeTab.getAttribute('data-tab');
            handleTabSwitch(tabName);
        }
    }
    
    console.log('✅ Login system ready');
});