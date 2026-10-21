// Letters page functionality with API - DEBUG VERSION
document.addEventListener('DOMContentLoaded', async function() {
    console.log('📝 Letters page loaded, initializing...');

   const MOD_STORAGE_KEY = 'hope_mod_password';
        
    const letterForm = document.getElementById('letter-form');
    const lettersFeed = document.getElementById('letters-feed');
    const searchInput = document.getElementById('letter-search');
    const searchBtn = document.getElementById('search-btn');
    const categorySelect = document.getElementById('category');
    
    // Test if elements exist
    console.log('🔍 Element check:', {
        letterForm: !!letterForm,
        lettersFeed: !!lettersFeed,
        searchInput: !!searchInput,
        categorySelect: !!categorySelect,
        api: typeof api
    });
    
    // Display letters with detailed error handling
    async function displayLetters() {
            const search = (searchInput?.value || '').trim();
            const category = (categorySelect?.value || '').trim();

            try {
                const letters = await api.getLetters(search, category);
            
            lettersFeed.innerHTML = '';
            
            if (!letters || !Array.isArray(letters)) {
                console.error('❌ Letters is not an array:', letters);
                lettersFeed.innerHTML = '<div class="empty-feed"><p>Invalid data received from server.</p></div>';
                return;
            }
            
            if (letters.length === 0) {
                lettersFeed.innerHTML = '<div class="empty-feed"><p>No letters found. Be the first to share some hope!</p></div>';
                console.log('ℹ️ No letters in database');
                const feedHeading = document.querySelector('.feed-header h2');
                if (feedHeading) feedHeading.textContent = 'Letters of Hope (0)';
                return;
            }
            
           const isFiltered = !!search || (category && category !== '');
            if (!isFiltered) {
                for (let i = letters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [letters[i], letters[j]] = [letters[j], letters[i]];
                }
            }

            console.log(`🎉 Displaying ${letters.length} letters (shuffled)`);
            const feedHeading = document.querySelector('.feed-header h2');
           if (feedHeading) {
                feedHeading.textContent = isFiltered
                    ? `Search results (${letters.length.toLocaleString()})`
                    : `Letters of Hope (${letters.length.toLocaleString()})`;
            }
            letters.forEach((letter, index) => {
                const letterElement = createLetterElement(letter);
                lettersFeed.appendChild(letterElement);
            });
            
        } catch (error) {
            console.error('❌ ERROR in displayLetters:', error);
            console.error('❌ Error stack:', error.stack);
            lettersFeed.innerHTML = `
                <div class="error-feed">
                    <p>Error loading letters: ${error.message}</p>
                    <p><small>Please check console for details</small></p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }

        // Create a letter element
        function createLetterElement(letter) {
            const letterDiv = document.createElement('div');
            letterDiv.className = 'letter-card';
            letterDiv.setAttribute('data-letter-id', letter._id);

            if (letter.color) {
                letterDiv.style.borderLeftColor = letter.color;
            }

            // createdAt is already a year number
            const year = letter.createdAt || new Date().getFullYear();

            letterDiv.innerHTML = `
                <div class="letter-header">
                    ${letter.recipient ? `<span class="letter-recipient">To: ${letter.recipient}</span>` : ''}
                    ${letter.category ? `<span class="letter-category">${letter.category}</span>` : ''}
                </div>
                <div class="letter-message">${letter.message || 'No message'}</div>
                <div class="letter-footer">
                    <span class="letter-time">${year}</span>
                    <div class="letter-actions">
                        <button class="like-btn" data-id="${letter._id}">💗 ${letter.likes?.length || 0}</button>
                    </div>
                </div>
            `;

            // Delete button added AFTER innerHTML 
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.setAttribute('data-delete-letter', letter._id);
            deleteBtn.setAttribute('title', 'Delete letter');
            deleteBtn.textContent = 'X';
            letterDiv.appendChild(deleteBtn);

            return letterDiv;
        }

    // Handle form submission
    if (letterForm) {
        letterForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const recipient = document.getElementById('recipient').value.trim();
            const category = document.getElementById('category').value;
            const color = document.getElementById('letter-color').value;
            const message = document.getElementById('message').value.trim();
            
            if (!message) {
                alert('Please write a message before submitting.');
                return;
            }
            
            try {
                console.log('📤 Submitting new letter...');
                await api.addLetter({
                    recipient: recipient || '',
                    category: category || '',
                    color: color || '#CBB0FF',
                    message: message
                });
                
                console.log('✅ Letter submitted successfully');
                await displayLetters();
                
                // Reset form
                document.getElementById('recipient').value = '';
                document.getElementById('category').value = '';
                document.getElementById('message').value = '';
                
                alert('Your letter has been shared anonymously. Thank you for spreading hope!');
            } catch (error) {
                console.error('❌ Error adding letter:', error);
                alert('Failed to submit letter. Please try again.');
            }
        });
    } else {
        console.error('❌ letterForm element not found!');
    }
    
    // Handle search
    if (searchBtn) {
        searchBtn.addEventListener('click', displayLetters);
    }

    if (searchInput) {
        let searchTimer = null;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(displayLetters, 350);
        });
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimer);
                displayLetters();
            }
        });
    }
    
    // Handle category change
    if (categorySelect) {
        categorySelect.addEventListener('change', displayLetters);
    }
    
    // Handle likes
    async function handleLikeClick(e) {
        if (e.target.classList.contains('like-btn')) {
            const letterId = e.target.getAttribute('data-id');
            console.log('💗 Liking letter:', letterId);
            
            try {
                const result = await api.likeLetter(letterId);
                e.target.textContent = `💗 ${result.likes || 0}`;
                showTemporaryMessage("💗 Thank you for liking this letter!");
            } catch (error) {
                console.error('Error liking letter:', error);
                showTemporaryMessage("⚠️ Could not record like. Please try again.");
            }
        }
    }
    
    if (lettersFeed) {
        lettersFeed.addEventListener('click', handleLikeClick);
    }
    
    // Show temporary message
    function showTemporaryMessage(message) {
        const tempMsg = document.createElement('div');
        tempMsg.textContent = message;
        tempMsg.style.position = 'fixed';
        tempMsg.style.top = '20px';
        tempMsg.style.left = '50%';
        tempMsg.style.transform = 'translateX(-50%)';
        tempMsg.style.backgroundColor = '#CBB0FF';
        tempMsg.style.color = 'white';
        tempMsg.style.padding = '10px 20px';
        tempMsg.style.borderRadius = '5px';
        tempMsg.style.zIndex = '1000';
        tempMsg.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
        
        document.body.appendChild(tempMsg);
        
        setTimeout(() => {
            document.body.removeChild(tempMsg);
        }, 3000);
    }
    
// ===========================================
// MODERATOR MODE
// ===========================================

async function initializeModeratorMode() {
    const adminToggle = document.getElementById('admin-toggle');
    const adminModal = document.getElementById('admin-modal');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminPassword = document.getElementById('admin-password');
    const adminError = document.getElementById('admin-error');
    const adminLogout = document.getElementById('admin-logout');

    if (!adminToggle || !adminModal) return;

    // Restore session from sessionStorage (per-tab)
    if (sessionStorage.getItem(MOD_STORAGE_KEY)) {
        document.body.classList.add('admin-mode');
    }

    adminToggle.addEventListener('click', function (e) {
        e.preventDefault();
        if (document.body.classList.contains('admin-mode')) {
            alert('You are already in moderator mode.');
            return;
        }
        adminPassword.value = '';
        adminError.textContent = '';
        adminModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        setTimeout(() => adminPassword.focus(), 100);
    });

    async function tryLogin() {
        const pw = adminPassword.value;
        if (!pw) return;

        adminLoginBtn.disabled = true;
        adminLoginBtn.textContent = 'Checking…';

        try {
            const result = await api.verifyModPassword(pw);
            if (result && result.ok) {
                sessionStorage.setItem(MOD_STORAGE_KEY, pw);
                document.body.classList.add('admin-mode');
                adminModal.classList.remove('open');
                document.body.style.overflow = '';
            } else {
                adminError.textContent = 'Incorrect password.';
                adminPassword.value = '';
                adminPassword.focus();
            }
        } catch (err) {
            adminError.textContent = 'Could not verify. Try again.';
        } finally {
            adminLoginBtn.disabled = false;
            adminLoginBtn.textContent = 'Log in';
        }
    }

    adminLoginBtn.addEventListener('click', tryLogin);
    adminPassword.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') tryLogin();
    });

    adminLogout.addEventListener('click', function () {
        sessionStorage.removeItem(MOD_STORAGE_KEY);
        document.body.classList.remove('admin-mode');
    });

    document.querySelectorAll('#admin-modal [data-close]').forEach(el => {
        el.addEventListener('click', () => {
            adminModal.classList.remove('open');
            document.body.style.overflow = '';
        });
    });
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && adminModal.classList.contains('open')) {
            adminModal.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

function initializeDeleteButtons() {
    document.addEventListener('click', async function (e) {
        const btn = e.target.closest('.delete-btn');
        if (!btn) return;
        if (!document.body.classList.contains('admin-mode')) return;

        const id = btn.getAttribute('data-delete-letter');
        const card = btn.closest('.letter-card');
        const password = sessionStorage.getItem(MOD_STORAGE_KEY);

        if (!password) {
            alert('Session expired. Please log in again.');
            document.body.classList.remove('admin-mode');
            return;
        }

        if (!id) return;
        if (!confirm('Delete this letter? This cannot be undone.')) return;

        try {
            const res = await api.deleteLetter(id, password);
            if (card) {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                setTimeout(() => card.remove(), 300);
            }
            const feedHeading = document.querySelector('.feed-header h2');
            if (feedHeading && typeof res.remaining === 'number') {
                feedHeading.textContent = `Letters of Hope (${res.remaining.toLocaleString()})`;
            }
        } catch (err) {
            if (err.message && err.message.includes('401')) {
                alert('Session expired. Please log in again.');
                sessionStorage.removeItem(MOD_STORAGE_KEY);
                document.body.classList.remove('admin-mode');
            } else {
                alert('Could not delete letter. Check your connection.');
            }
        }
    });
}

initializeModeratorMode();
initializeDeleteButtons();

    // Initial display
    console.log('🚀 Starting initial display...');
    await displayLetters();
    console.log('✅ Letters page initialization complete');
});