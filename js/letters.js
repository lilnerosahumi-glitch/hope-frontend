// Letters page functionality with API - FIXED VERSION
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Letters page loaded, initializing...');
    
    const letterForm = document.getElementById('letter-form');
    const lettersFeed = document.getElementById('letters-feed'); // FIXED: Changed from 'letters-container'
    const searchInput = document.getElementById('letter-search');
    const searchBtn = document.getElementById('search-btn');
    const categorySelect = document.getElementById('category');
    
    // Display letters
    async function displayLetters() {
        try {
            const search = searchInput.value.trim();
            const category = categorySelect.value;
            
            // FIXED: API doesn't accept parameters
            const letters = await api.getLetters();
            lettersFeed.innerHTML = '';
            
            if (letters.length === 0) {
                lettersFeed.innerHTML = '<div class="empty-feed"><p>No letters found. Be the first to share some hope!</p></div>';
                return;
            }
            
            letters.forEach(letter => {
                const letterElement = createLetterElement(letter);
                lettersFeed.appendChild(letterElement);
            });
        } catch (error) {
            console.error('Error loading letters:', error);
            lettersFeed.innerHTML = '<div class="empty-feed"><p>Error loading letters. Please try again later.</p></div>';
        }
    }
    
    // Create a letter element
    function createLetterElement(letter) {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter-card';
        
        // Set custom border color if specified
        if (letter.color) {
            letterDiv.style.borderLeftColor = letter.color;
        }
        
        // FIXED: createdAt is already a year number
        const year = letter.createdAt;
        
        letterDiv.innerHTML = `
            <div class="letter-header">
                ${letter.recipient ? `<span class="letter-recipient">To: ${letter.recipient}</span>` : ''}
                ${letter.category ? `<span class="letter-category">${letter.category}</span>` : ''}
            </div>
            <div class="letter-message">${letter.message}</div>
            <div class="letter-footer">
                <span class="letter-time">${year}</span>
                <div class="letter-actions">
                    <button class="like-btn" data-id="${letter._id}">💗 ${letter.likes?.length || 0}</button>
                </div>
            </div>
        `;
        
        return letterDiv;
    }
    
    // Handle form submission
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
            await api.addLetter({
                recipient: recipient || '',
                category: category || '',
                color: color || '#CBB0FF',
                message: message
            });
            
            // Display the new letter
            await displayLetters();
            
            // Reset form
            document.getElementById('recipient').value = '';
            document.getElementById('category').value = '';
            document.getElementById('message').value = '';
            
            // Show success message
            alert('Your letter has been shared anonymously. Thank you for spreading hope!');
        } catch (error) {
            console.error('Error adding letter:', error);
            alert('Failed to submit letter. Please try again.');
        }
    });
    
    // Handle search (will need backend support later)
    searchBtn.addEventListener('click', displayLetters);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            displayLetters();
        }
    });
    
    // Handle category change
    categorySelect.addEventListener('change', displayLetters);
    
    // Handle likes
    async function handleLikeClick(e) {
        if (e.target.classList.contains('like-btn')) {
            const letterId = e.target.getAttribute('data-id');
            
            try {
                const result = await api.likeLetter(letterId);
                
                // Update like count
                e.target.textContent = `💗 ${result.likes || 0}`;
                
                // Show appreciation message
                showTemporaryMessage("💗 Thank you for liking this letter!");
            } catch (error) {
                console.error('Error liking letter:', error);
                showTemporaryMessage("⚠️ Could not record like. Please try again.");
            }
        }
    }
    
    lettersFeed.addEventListener('click', handleLikeClick);
    
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
    
    // Initial display
    await displayLetters();
    
    console.log('Letters page initialization complete');
});