// Boards functionality with smooth dragging and better editing
document.addEventListener('DOMContentLoaded', async function() {
    // DOM Elements
    const createBoardBtn = document.getElementById('create-board-btn');
    const createMyBoardBtn = document.getElementById('create-my-board-btn');
    const publicBoardsGrid = document.getElementById('public-boards-grid');
    const myBoardsGrid = document.getElementById('my-boards-grid');
    const boardEditor = document.getElementById('board-editor');
    const backToBoardsBtn = document.getElementById('back-to-boards-btn');
    const saveBoardBtn = document.getElementById('save-board-btn');
    const boardCanvas = document.getElementById('board-canvas');
    const toolButtons = document.querySelectorAll('.tool-btn[data-type]');
    const imageUpload = document.getElementById('image-upload');
    const gifUpload = document.getElementById('gif-upload');
    const boardVisibility = document.getElementById('board-visibility');
    const shareSection = document.getElementById('share-section');
    const shareLink = document.getElementById('share-link');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const loginPrompt = document.getElementById('login-prompt');
    const loginPromptBtn = document.getElementById('login-prompt-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const publicBoardsSection = document.getElementById('public-boards-section');
    const myBoardsSection = document.getElementById('my-boards-section');
    
    // Toolbar elements
    const fontFamilySelect = document.getElementById('font-family');
    const fontSizeInput = document.getElementById('font-size');
    const fontColorPicker = document.getElementById('font-color');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const underlineBtn = document.getElementById('underline-btn');
    const alignLeftBtn = document.getElementById('align-left-btn');
    const alignCenterBtn = document.getElementById('align-center-btn');
    const alignRightBtn = document.getElementById('align-right-btn');
    const backgroundColorPicker = document.getElementById('background-color');
    const applyBgColorBtn = document.getElementById('apply-bg-color');
    const textBgColorPicker = document.getElementById('text-bg-color');
    
    // Spotify modal
    const spotifyModal = document.getElementById('spotify-modal');
    const spotifyForm = document.getElementById('spotify-form');
    const spotifyLinkInput = document.getElementById('spotify-link');
    
    // State variables
    let currentBoard = null;
    let isDragging = false;
    let isResizing = false;
    let currentElement = null;
    let startX, startY, startLeft, startTop;
    let startWidth, startHeight;
    let selectedElement = null;
    let currentTab = 'public';
    let dragOverlay = null;
    let autoSaveTimeout = null;
    let lastSaveTime = null;
    
    // ===========================================
    // INITIALIZATION
    // ===========================================
    async function init() {
        await checkLoginStatus();
        setupEventListeners();
        createDragOverlay();
        addUtilityButtons();
        
        // Check for share token in URL
        const urlParams = new URLSearchParams(window.location.search);
        const shareToken = urlParams.get('share');
        if (shareToken) {
            try {
                const board = await api.getBoard(shareToken);
                await openBoard(board._id, false);
            } catch (error) {
                console.error('Failed to load shared board:', error);
            }
        }
    }
    
    function createDragOverlay() {
        dragOverlay = document.createElement('div');
        dragOverlay.className = 'drag-overlay';
        dragOverlay.innerHTML = '<i class="fas fa-arrows-alt"></i><span style="margin-left: 10px;">Drop anywhere</span>';
        document.body.appendChild(dragOverlay);
    }
    
    function addUtilityButtons() {
        // Add debug button
        const debugBtn = document.createElement('button');
        debugBtn.className = 'primary-btn';
        debugBtn.style.marginLeft = '10px';
        debugBtn.style.backgroundColor = '#666';
        debugBtn.innerHTML = '<i class="fas fa-bug"></i> Debug';
        debugBtn.addEventListener('click', debugBoardData);
        
        // Add force save button
        const forceSaveBtn = document.createElement('button');
        forceSaveBtn.className = 'primary-btn';
        forceSaveBtn.style.marginLeft = '10px';
        forceSaveBtn.style.backgroundColor = '#e74c3c';
        forceSaveBtn.innerHTML = '<i class="fas fa-save"></i> Force Save';
        forceSaveBtn.addEventListener('click', () => forceSave());
        
        // Add help button
        const helpBtn = document.createElement('button');
        helpBtn.className = 'primary-btn';
        helpBtn.style.marginLeft = '10px';
        helpBtn.style.backgroundColor = '#3498db';
        helpBtn.innerHTML = '<i class="fas fa-question-circle"></i> Help';
        helpBtn.addEventListener('click', showKeyboardShortcuts);
        
        const editorActions = document.querySelector('.editor-actions');
        if (editorActions) {
            editorActions.appendChild(debugBtn);
            editorActions.appendChild(forceSaveBtn);
            editorActions.appendChild(helpBtn);
        }
    }
    
    // ===========================================
    // AUTHENTICATION & UI
    // ===========================================
    async function checkLoginStatus() {
        const user = await api.checkAuth();
        
        if (user) {
            loginPrompt.classList.add('hidden');
            usernameDisplay.textContent = user.username;
        } else {
            usernameDisplay.textContent = '';
            loginPrompt.classList.remove('hidden');
        }
        
        // Load appropriate boards based on current tab
        if (currentTab === 'public') {
            await loadPublicBoards();
        } else if (currentTab === 'my-boards' && user) {
            await loadUserBoards();
        }
    }
    
    async function switchTab(tabName) {
        currentTab = tabName;
        
        // Update tab buttons
        tabButtons.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
        });
        
        const user = await api.checkAuth();
        
        if (tabName === 'my-boards') {
            if (user) {
                myBoardsSection.classList.remove('hidden');
                publicBoardsSection.classList.add('hidden');
                loginPrompt.classList.add('hidden');
                await loadUserBoards();
            } else {
                loginPrompt.classList.remove('hidden');
                publicBoardsSection.classList.add('hidden');
                myBoardsSection.classList.add('hidden');
            }
        } else {
            publicBoardsSection.classList.remove('hidden');
            myBoardsSection.classList.add('hidden');
            loginPrompt.classList.add('hidden');
            await loadPublicBoards();
        }
    }
    
    // ===========================================
    // BOARD MANAGEMENT - FIXED OPENBOARD FUNCTION
    // ===========================================
    async function loadPublicBoards() {
        try {
            publicBoardsGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading public boards...</p></div>';
            
            const boards = await api.getPublicBoards();
            
            if (boards.length === 0) {
                publicBoardsGrid.innerHTML = `
                    <div class="empty-boards">
                        <p>No public boards yet. Be the first to create one!</p>
                        <button class="primary-btn" style="margin-top: 1rem;">Create Public Board</button>
                    </div>
                `;
                publicBoardsGrid.querySelector('.primary-btn').addEventListener('click', createNewBoard);
                return;
            }
            
            renderBoards(boards, publicBoardsGrid, false);
        } catch (error) {
            publicBoardsGrid.innerHTML = `
                <div class="error-message">
                    <p>Error loading public boards</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    async function loadUserBoards() {
        try {
            myBoardsGrid.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading your boards...</p></div>';
            
            const boards = await api.getUserBoards();
            
            if (boards.length === 0) {
                myBoardsGrid.innerHTML = `
                    <div class="empty-boards">
                        <p>You don't have any boards yet.</p>
                        <button id="create-first-board" class="primary-btn" style="margin-top: 1rem;">Create Your First Board</button>
                    </div>
                `;
                
                document.getElementById('create-first-board')?.addEventListener('click', createNewBoard);
                return;
            }
            
            renderBoards(boards, myBoardsGrid, true);
        } catch (error) {
            myBoardsGrid.innerHTML = `
                <div class="error-message">
                    <p>Error loading your boards</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    function renderBoards(boards, container, isEditable) {
        container.innerHTML = '';
        
        boards.forEach(board => {
            const boardElement = document.createElement('div');
            boardElement.className = 'board-card';
            boardElement.setAttribute('data-id', board._id);
            
            const elementCount = board.elements?.length || 0;
            const previewText = elementCount === 0 ? 'Empty board' : 
                               elementCount === 1 ? '1 item' : 
                               `${elementCount} items`;
            
            boardElement.innerHTML = `
                <div class="board-thumbnail">
                    <div style="text-align: center;">
                        <i class="fas fa-palette" style="font-size: 2.5rem; margin-bottom: 0.5rem;"></i>
                        <p style="font-size: 1rem;">${previewText}</p>
                    </div>
                </div>
                <div class="board-info">
                    <div class="board-title">${board.title || 'Untitled Board'}</div>
                    <div class="board-meta">
                        <span>${formatDate(board.updatedAt || board.createdAt)}</span>
                        ${isEditable ? `<span class="board-visibility ${board.visibility || 'private'}">${board.visibility || 'private'}</span>` : ''}
                        ${!isEditable && board.owner ? `<span class="board-author">by ${board.owner.username}</span>` : ''}
                    </div>
                </div>
            `;
            
            boardElement.addEventListener('click', () => openBoard(board._id, isEditable));
            container.appendChild(boardElement);
        });
    }
    
    function formatDate(dateString) {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString();
    }
    
    async function createNewBoard() {
        const user = await api.checkAuth();
        
        if (!user) {
            loginModal.style.display = 'block';
            return;
        }
        
        const title = prompt('Enter a title for your new board:', 'My Inspiration Board');
        if (!title || title.trim() === '') return;
        
        try {
            console.log('🎨 Creating board with title:', title);
            const newBoard = await api.createBoard(title.trim());
            console.log('✅ Board created:', newBoard);
            
            // Switch to my-boards tab if not already there
            if (currentTab !== 'my-boards') {
                await switchTab('my-boards');
            } else {
                await loadUserBoards();
            }
            
            // Open the new board
            await openBoard(newBoard._id, true);
        } catch (error) {
            console.error('❌ Create board error:', error);
            alert(`Failed to create board: ${error.message}`);
        }
    }
    
    // ===========================================
    // FIXED: OPEN BOARD FUNCTION - visibility dropdown should work
    // ===========================================
    async function openBoard(boardId, editable) {
        try {
            console.log('📖 Opening board:', boardId);
            const board = await api.getBoard(boardId);
            currentBoard = board;
            
            console.log('📋 Board loaded:', {
                id: board._id,
                title: board.title,
                visibility: board.visibility,
                elements: board.elements?.length || 0
            });
            
            // Show editor, hide other sections
            boardEditor.classList.remove('hidden');
            publicBoardsSection.classList.add('hidden');
            myBoardsSection.classList.add('hidden');
            loginPrompt.classList.add('hidden');
            
            // Set board info
            document.getElementById('board-title').textContent = board.title || 'Untitled Board';
            
            // Set visibility - CRITICAL FIX: Always set this
            if (board.visibility) {
                boardVisibility.value = board.visibility;
            } else {
                boardVisibility.value = 'private';
            }
            
            console.log('👁️ Visibility dropdown set to:', boardVisibility.value);
            console.log('👁️ Board visibility from API:', board.visibility);
            
            // Check if user is owner
            const user = await api.checkAuth();
            let isOwner = false;
            
            if (user && board.owner) {
                // Check both possible formats of owner ID
                if (typeof board.owner === 'object') {
                    isOwner = board.owner._id === user.id;
                } else {
                    isOwner = board.owner === user.id;
                }
            }
            
            console.log('👤 Ownership check:', {
                user: user?.username,
                boardOwner: board.owner,
                isOwner: isOwner,
                editable: editable
            });
            
            // FIXED: Set edit permissions - ONLY disable if viewing shared board
            saveBoardBtn.disabled = !editable;
            boardVisibility.disabled = !editable;
            
            // Update share section immediately
            updateShareSection();
            
            // Load board elements
            loadBoardElements(editable);
            
            // Reset selected element
            selectedElement = null;
            updateTextToolbar(null);
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log('✅ Board opened successfully');
            console.log('🔧 Permissions:', {
                saveBtnDisabled: saveBoardBtn.disabled,
                visibilityDisabled: boardVisibility.disabled,
                canEdit: editable
            });
            
        } catch (error) {
            console.error('❌ Failed to open board:', error);
            alert(`Failed to open board: ${error.message}`);
        }
    }
    
    function loadBoardElements(editable) {
        boardCanvas.innerHTML = '';
        
        // Set background
        if (currentBoard.backgroundColor) {
            boardCanvas.style.backgroundColor = currentBoard.backgroundColor;
            backgroundColorPicker.value = currentBoard.backgroundColor;
        } else {
            boardCanvas.style.backgroundColor = '#f9f9f9';
            backgroundColorPicker.value = '#f9f9f9';
        }
        
        // Load elements
        if (currentBoard.elements && currentBoard.elements.length > 0) {
            console.log(`🖼️ Loading ${currentBoard.elements.length} elements`);
            currentBoard.elements.forEach(element => {
                const elementDiv = createElementDiv(element, editable);
                boardCanvas.appendChild(elementDiv);
            });
        } else if (editable) {
            console.log('📝 Adding welcome text for empty board');
            addElementToBoard('text');
        }
    }
    
    function createElementDiv(element, editable) {
        const div = document.createElement('div');
        div.className = 'draggable';
        div.setAttribute('data-id', element.id || element._id);
        div.style.left = `${element.x || 50}px`;
        div.style.top = `${element.y || 50}px`;
        div.style.zIndex = element.zIndex || 1;
        
        // Set width and height with units
        const width = typeof element.width === 'number' ? `${element.width}px` : element.width || '200px';
        const height = typeof element.height === 'number' ? `${element.height}px` : element.height || '200px';
        div.style.width = width;
        div.style.height = height;
        
        switch (element.type) {
            case 'text':
                div.className += ' draggable-text';
                if (editable) {
                    div.contentEditable = true;
                    div.spellcheck = false;
                }
                div.textContent = element.content || 'Double click to edit';
                
                // Apply text styles
                div.style.fontFamily = element.fontFamily || 'Merriweather';
                div.style.fontSize = `${element.fontSize || 16}px`;
                div.style.color = element.color || '#000000';
                div.style.backgroundColor = element.backgroundColor || 'rgba(255, 255, 255, 0.95)';
                div.style.fontWeight = element.fontWeight || 'normal';
                div.style.fontStyle = element.fontStyle || 'normal';
                div.style.textDecoration = element.textDecoration || 'none';
                div.style.textAlign = element.textAlign || 'left';
                div.style.lineHeight = '1.4';
                div.style.overflow = 'auto';
                
                break;
                
            case 'image':
            case 'gif':
                const img = document.createElement('img');
                img.src = element.content || 'https://via.placeholder.com/200';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                div.appendChild(img);
                break;
                
            case 'sticker':
                div.className += ' draggable-sticker';
                div.innerHTML = element.content || '⭐';
                div.style.fontSize = '3rem';
                div.style.display = 'flex';
                div.style.justifyContent = 'center';
                div.style.alignItems = 'center';
                break;
                
            case 'music':
                div.className += ' draggable-music';
                
                // Add drag handle
                const dragHandle = document.createElement('div');
                dragHandle.className = 'music-drag-handle';
                dragHandle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
                div.appendChild(dragHandle);
                
                if (element.content && (element.content.includes('spotify') || element.content.includes('embed'))) {
                    // Clean up Spotify URL
                    let spotifyUrl = element.content;
                    if (spotifyUrl.includes('spotify.com/track/')) {
                        const trackId = spotifyUrl.split('track/')[1]?.split('?')[0];
                        if (trackId) {
                            spotifyUrl = `https://open.spotify.com/embed/track/${trackId}`;
                        }
                    }
                    
                    // Create a container for the iframe
                    const iframeContainer = document.createElement('div');
                    iframeContainer.style.width = '100%';
                    iframeContainer.style.height = 'calc(100% - 40px)';
                    iframeContainer.style.position = 'absolute';
                    iframeContainer.style.bottom = '0';
                    iframeContainer.style.left = '0';
                    
                    const iframe = document.createElement('iframe');
                    iframe.src = spotifyUrl;
                    iframe.width = '100%';
                    iframe.height = '100%';
                    iframe.frameBorder = '0';
                    iframe.allowtransparency = 'true';
                    iframe.allow = 'encrypted-media';
                    iframe.style.pointerEvents = 'none';
                    
                    iframeContainer.appendChild(iframe);
                    div.appendChild(iframeContainer);
                } else {
                    div.innerHTML = `
                        <div class="music-placeholder">
                            <i class="fas fa-music"></i>
                            <p>${element.content || 'Music Track'}</p>
                            <small>Drag from the top bar</small>
                        </div>
                    `;
                }
                break;
                
            case 'shape':
                div.className += ' draggable-shape';
                div.style.backgroundColor = element.color || '#CBB0FF';
                if (element.shape === 'circle') {
                    div.classList.add('circle');
                }
                break;
        }
        
        // Add controls for editable elements
        if (editable) {
            const controls = document.createElement('div');
            controls.className = 'draggable-controls';
            controls.innerHTML = `
                <button class="bring-forward" title="Bring Forward"><i class="fas fa-arrow-up"></i></button>
                <button class="send-backward" title="Send Backward"><i class="fas fa-arrow-down"></i></button>
                <button class="delete-element" title="Delete"><i class="fas fa-times"></i></button>
            `;
            div.appendChild(controls);
            
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            div.appendChild(resizeHandle);
            
            makeElementInteractive(div);
            
            // Add click handler for selection
            div.addEventListener('click', (e) => {
                if (e.target.closest('.draggable-controls') || e.target.classList.contains('resize-handle')) return;
                selectElement(div);
            });
        }
        
        return div;
    }
    
    // ===========================================
    // ELEMENT INTERACTION & DRAGGING
    // ===========================================
    function makeElementInteractive(element) {
        // Make draggable
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDragTouch, { passive: false });
        
        // Make text elements editable on double click
        if (element.classList.contains('draggable-text')) {
            element.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                selectElement(element);
                element.focus();
            });
            
            element.addEventListener('blur', () => {
                scheduleAutoSave();
            });
        }
        
        // Add resize handle functionality
        const resizeHandle = element.querySelector('.resize-handle');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', startResize);
            resizeHandle.addEventListener('touchstart', startResizeTouch, { passive: false });
        }
    }
    
    function selectElement(element) {
        // Deselect previous element
        if (selectedElement) {
            selectedElement.classList.remove('selected');
        }
        
        // Select new element
        selectedElement = element;
        element.classList.add('selected');
        
        // Update toolbar if it's a text element
        if (element.classList.contains('draggable-text')) {
            updateTextToolbar(element);
        } else {
            updateTextToolbar(null);
        }
    }
    
    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const element = e.currentTarget;
        
        // Special handling for music elements
        if (element.classList.contains('draggable-music')) {
            // Check if we clicked on the drag handle
            const dragHandle = element.querySelector('.music-drag-handle');
            if (!dragHandle.contains(e.target) && e.target !== dragHandle) {
                // Only allow dragging from the drag handle for music elements
                return;
            }
        }
        
        if (e.target.closest('.draggable-controls') || e.target.classList.contains('resize-handle')) {
            return;
        }
        
        selectElement(element);
        
        isDragging = true;
        currentElement = element;
        
        const rect = element.getBoundingClientRect();
        const canvasRect = boardCanvas.getBoundingClientRect();
        
        if (e.type === 'mousedown') {
            startX = e.clientX;
            startY = e.clientY;
        } else if (e.touches) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
        
        startLeft = rect.left - canvasRect.left;
        startTop = rect.top - canvasRect.top;
        
        // Show drag overlay
        dragOverlay.classList.add('active');
        
        // Add event listeners
        document.addEventListener('mousemove', dragElement);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', dragElementTouch, { passive: false });
        document.addEventListener('touchend', stopDrag);
    }
    
    function startDragTouch(e) {
        startDrag(e);
    }
    
    function dragElement(e) {
        if (!isDragging || !currentElement) return;
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        
        const canvasRect = boardCanvas.getBoundingClientRect();
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        let newLeft = startLeft + deltaX;
        let newTop = startTop + deltaY;
        
        // Constrain to canvas bounds
        const maxLeft = canvasRect.width - currentElement.offsetWidth;
        const maxTop = canvasRect.height - currentElement.offsetHeight;
        
        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));
        
        currentElement.style.left = `${newLeft}px`;
        currentElement.style.top = `${newTop}px`;
        
        // Update drag overlay position
        dragOverlay.style.left = `${clientX - 50}px`;
        dragOverlay.style.top = `${clientY - 50}px`;
    }
    
    function dragElementTouch(e) {
        dragElement(e);
    }
    
    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Hide drag overlay
        dragOverlay.classList.remove('active');
        
        // Remove event listeners
        document.removeEventListener('mousemove', dragElement);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', dragElementTouch);
        document.removeEventListener('touchend', stopDrag);
        
        // Schedule auto-save
        scheduleAutoSave();
    }
    
    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        currentElement = e.currentTarget.parentElement;
        
        const rect = currentElement.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;
        
        if (e.type === 'mousedown') {
            startX = e.clientX;
            startY = e.clientY;
        } else if (e.touches) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }
        
        // Add a visual indicator for resizing
        currentElement.style.border = '2px dashed #CBB0FF';
        
        document.addEventListener('mousemove', resizeElement);
        document.addEventListener('mouseup', stopResize);
        document.addEventListener('touchmove', resizeElementTouch, { passive: false });
        document.addEventListener('touchend', stopResize);
    }
    
    function startResizeTouch(e) {
        startResize(e);
    }
    
    function resizeElement(e) {
        if (!isResizing || !currentElement) return;
        
        let clientX, clientY;
        if (e.type === 'mousemove') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }
        
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;
        
        const newWidth = Math.max(50, startWidth + deltaX);
        const newHeight = Math.max(50, startHeight + deltaY);
        
        currentElement.style.width = `${newWidth}px`;
        currentElement.style.height = `${newHeight}px`;
    }
    
    function resizeElementTouch(e) {
        resizeElement(e);
    }
    
    function stopResize() {
        isResizing = false;
        
        if (currentElement) {
            currentElement.style.border = '';
        }
        
        document.removeEventListener('mousemove', resizeElement);
        document.removeEventListener('mouseup', stopResize);
        document.removeEventListener('touchmove', resizeElementTouch);
        document.removeEventListener('touchend', stopResize);
        
        scheduleAutoSave();
    }
    
    // ===========================================
    // BOARD EDITING TOOLS
    // ===========================================
    function addElementToBoard(type) {
        if (!currentBoard) return;
        
        const elementId = 'element_' + Date.now();
        let elementData = {
            id: elementId,
            type: type,
            x: Math.random() * 200 + 50,
            y: Math.random() * 200 + 50,
            zIndex: 1,
            width: 200,
            height: type === 'text' ? 'auto' : 200
        };
        
        switch (type) {
            case 'text':
                elementData.content = 'Double click to edit';
                elementData.fontFamily = 'Merriweather';
                elementData.fontSize = 16;
                elementData.color = '#000000';
                elementData.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                elementData.textAlign = 'left';
                elementData.width = 250;
                elementData.height = 'auto';
                break;
            case 'sticker':
                const stickers = ['⭐', '❤️', '🌸', '✨', '😊', '🌈', '🎨', '🎵', '📚', '🌻'];
                elementData.content = stickers[Math.floor(Math.random() * stickers.length)];
                elementData.width = 100;
                elementData.height = 100;
                break;
            case 'music':
                spotifyModal.style.display = 'block';
                return;
            case 'image':
                imageUpload.click();
                return;
            case 'gif':
                gifUpload.click();
                return;
            case 'shape':
                elementData.color = '#CBB0FF';
                elementData.shape = Math.random() > 0.5 ? 'circle' : 'rectangle';
                elementData.width = 150;
                elementData.height = 150;
                break;
        }
        
        if (!currentBoard.elements) currentBoard.elements = [];
        currentBoard.elements.push(elementData);
        
        const elementDiv = createElementDiv(elementData, true);
        boardCanvas.appendChild(elementDiv);
        
        if (type === 'text') {
            selectElement(elementDiv);
            setTimeout(() => {
                elementDiv.focus();
                // Place cursor at end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(elementDiv);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }, 100);
        } else {
            selectElement(elementDiv);
        }
        
        scheduleAutoSave();
    }
    
    // ===========================================
    // SAVING & AUTO-SAVE
    // ===========================================
    function scheduleAutoSave() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        
        autoSaveTimeout = setTimeout(async () => {
            await saveBoard(true); // Auto-save
        }, 1000); // 1 second delay
    }
    
    async function saveBoard(isAutoSave = false) {
        if (!currentBoard) {
            console.error('❌ No board to save');
            return;
        }
        
        console.log('💾 SAVE PROCESS STARTED:');
        console.log('Board ID:', currentBoard._id);
        console.log('Current user:', api.getCurrentUser());
        console.log('Token in localStorage:', localStorage.getItem('hope_token'));
        
        // Collect ALL elements data
        const elements = [];
        const draggables = document.querySelectorAll('.draggable');
        
        console.log(`📦 Found ${draggables.length} elements to save`);
        
        draggables.forEach((draggable, index) => {
            const elementId = draggable.getAttribute('data-id');
            
            const elementData = {
                id: elementId,
                type: draggable.classList.contains('draggable-text') ? 'text' :
                      draggable.classList.contains('draggable-sticker') ? 'sticker' :
                      draggable.classList.contains('draggable-music') ? 'music' :
                      draggable.classList.contains('draggable-shape') ? 'shape' : 'image',
                x: parseInt(draggable.style.left) || 0,
                y: parseInt(draggable.style.top) || 0,
                zIndex: parseInt(draggable.style.zIndex) || 1,
                width: parseInt(draggable.offsetWidth) || 200,
                height: parseInt(draggable.offsetHeight) || 200
            };
            
            // Type-specific data
            if (elementData.type === 'text') {
                elementData.content = draggable.textContent || 'Double click to edit';
                elementData.fontFamily = draggable.style.fontFamily || 'Merriweather';
                elementData.fontSize = parseInt(draggable.style.fontSize) || 16;
                elementData.color = draggable.style.color || '#000000';
                elementData.backgroundColor = draggable.style.backgroundColor || 'rgba(255, 255, 255, 0.95)';
                elementData.fontWeight = draggable.style.fontWeight || 'normal';
                elementData.fontStyle = draggable.style.fontStyle || 'normal';
                elementData.textDecoration = draggable.style.textDecoration || 'none';
                elementData.textAlign = draggable.style.textAlign || 'left';
            } else if (elementData.type === 'image' || elementData.type === 'gif') {
                const img = draggable.querySelector('img');
                elementData.content = img ? img.src : '';
            } else if (elementData.type === 'sticker') {
                elementData.content = draggable.innerHTML || '⭐';
            } else if (elementData.type === 'music') {
                const iframe = draggable.querySelector('iframe');
                elementData.content = iframe ? iframe.src : 'Custom Music';
            } else if (elementData.type === 'shape') {
                elementData.color = draggable.style.backgroundColor || '#CBB0FF';
                elementData.shape = draggable.classList.contains('circle') ? 'circle' : 'rectangle';
            }
            
            elements.push(elementData);
        });
        
        const boardData = {
            title: document.getElementById('board-title').textContent,
            visibility: boardVisibility.value,
            backgroundColor: boardCanvas.style.backgroundColor || '#f9f9f9',
            elements: elements
        };
        
        console.log('📤 Data to save:', {
            title: boardData.title,
            visibility: boardData.visibility,
            elementCount: boardData.elements.length,
            backgroundColor: boardData.backgroundColor
        });
        
        try {
            // Update save button state
            if (!isAutoSave) {
                saveBoardBtn.classList.add('saving');
                saveBoardBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                saveBoardBtn.disabled = true;
            }
            
            const updatedBoard = await api.updateBoard(currentBoard._id, boardData);
            currentBoard = updatedBoard;
            lastSaveTime = new Date();
            
            console.log('✅ SAVE SUCCESSFUL:', {
                id: updatedBoard._id,
                title: updatedBoard.title,
                visibility: updatedBoard.visibility,
                elements: updatedBoard.elements?.length || 0
            });
            
            // FIXED: Always update share section after save
            updateShareSection();
            
            if (!isAutoSave) {
                saveBoardBtn.classList.remove('saving');
                saveBoardBtn.classList.add('saved');
                saveBoardBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
                saveBoardBtn.disabled = false;
                
                // Reset button after 2 seconds
                setTimeout(() => {
                    saveBoardBtn.classList.remove('saved');
                    saveBoardBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                }, 2000);
            }
            
            return updatedBoard;
        } catch (error) {
            console.error('❌ SAVE FAILED:', error);
            
            if (!isAutoSave) {
                saveBoardBtn.classList.remove('saving');
                saveBoardBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Save Failed';
                saveBoardBtn.disabled = false;
                
                setTimeout(() => {
                    saveBoardBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                }, 3000);
                
                alert(`Save failed: ${error.message}\n\nCheck console for details.`);
            }
            throw error;
        }
    }
    
    async function forceSave() {
        if (!currentBoard) {
            alert('No board to save');
            return;
        }
        
        const confirmSave = confirm('Force save current board? This will overwrite any unsaved changes.');
        if (confirmSave) {
            await saveBoard(false);
        }
    }
    
    // ===========================================
    // TEXT FORMATTING
    // ===========================================
    function updateTextToolbar(element) {
        if (!element || !element.classList.contains('draggable-text')) {
            // Disable toolbar
            fontFamilySelect.disabled = true;
            fontSizeInput.disabled = true;
            fontColorPicker.disabled = true;
            textBgColorPicker.disabled = true;
            boldBtn.disabled = italicBtn.disabled = underlineBtn.disabled = true;
            alignLeftBtn.disabled = alignCenterBtn.disabled = alignRightBtn.disabled = true;
            return;
        }
        
        // Enable toolbar
        fontFamilySelect.disabled = false;
        fontSizeInput.disabled = false;
        fontColorPicker.disabled = false;
        textBgColorPicker.disabled = false;
        boldBtn.disabled = italicBtn.disabled = underlineBtn.disabled = false;
        alignLeftBtn.disabled = alignCenterBtn.disabled = alignRightBtn.disabled = false;
        
        // Update values
        fontFamilySelect.value = element.style.fontFamily || 'Merriweather';
        fontSizeInput.value = parseInt(element.style.fontSize) || 16;
        fontColorPicker.value = rgbToHex(element.style.color) || '#000000';
        textBgColorPicker.value = rgbToHex(element.style.backgroundColor) || '#ffffff';
        
        boldBtn.classList.toggle('active', element.style.fontWeight === 'bold');
        italicBtn.classList.toggle('active', element.style.fontStyle === 'italic');
        underlineBtn.classList.toggle('active', element.style.textDecoration === 'underline');
        
        const align = element.style.textAlign || 'left';
        alignLeftBtn.classList.toggle('active', align === 'left');
        alignCenterBtn.classList.toggle('active', align === 'center');
        alignRightBtn.classList.toggle('active', align === 'right');
    }
    
    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent') return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        return '#ffffff';
    }
    
    function applyTextFormatting(property, value) {
        if (!selectedElement || !selectedElement.classList.contains('draggable-text')) return;
        
        if (property === 'fontWeight') {
            selectedElement.style.fontWeight = selectedElement.style.fontWeight === 'bold' ? 'normal' : 'bold';
        } else if (property === 'fontStyle') {
            selectedElement.style.fontStyle = selectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
        } else if (property === 'textDecoration') {
            selectedElement.style.textDecoration = selectedElement.style.textDecoration === 'underline' ? 'none' : 'underline';
        } else if (property === 'textAlign') {
            selectedElement.style.textAlign = value;
        } else {
            selectedElement.style[property] = value;
        }
        
        updateTextToolbar(selectedElement);
        scheduleAutoSave();
    }
    
    // ===========================================
    // SHARE FUNCTIONALITY - FIXED
    // ===========================================
    function updateShareSection() {
        console.log('🔗 Updating share section. Visibility:', boardVisibility.value);
        
        if (currentBoard && boardVisibility.value === 'public') {
            shareSection.classList.remove('hidden');
            const shareToken = currentBoard._id;
            const baseUrl = window.location.origin + window.location.pathname;
            shareLink.value = `${baseUrl}?share=${shareToken}`;
            console.log('🔗 Share link generated:', shareLink.value);
        } else {
            shareSection.classList.add('hidden');
            console.log('🔗 Share section hidden (private board)');
        }
    }
    
    // ===========================================
    // FILE UPLOAD HANDLERS
    // ===========================================
    function handleImageUpload(e) {
        handleFileUpload(e, 'image');
    }
    
    function handleGifUpload(e) {
        handleFileUpload(e, 'gif');
    }
    
    function handleFileUpload(e, type) {
        if (!currentBoard) return;
        
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Please choose a file smaller than 5MB.');
            e.target.value = '';
            return;
        }
        
        // Check file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, GIF, or WebP).');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            const elementId = 'element_' + Date.now();
            const elementData = {
                id: elementId,
                type: type,
                content: event.target.result,
                x: Math.random() * 300 + 50,
                y: Math.random() * 300 + 50,
                zIndex: 1,
                width: 200,
                height: 200
            };
            
            if (!currentBoard.elements) currentBoard.elements = [];
            currentBoard.elements.push(elementData);
            
            const elementDiv = createElementDiv(elementData, true);
            boardCanvas.appendChild(elementDiv);
            selectElement(elementDiv);
            
            scheduleAutoSave();
        };
        
        reader.onerror = function() {
            alert('Error reading file. Please try again.');
            e.target.value = '';
        };
        
        reader.readAsDataURL(file);
    }
    
    // ===========================================
    // DELETE CONFIRMATION
    // ===========================================
    function showDeleteConfirmation(element) {
        // Remove any existing confirmation
        const existingConfirm = document.querySelector('.delete-confirmation');
        if (existingConfirm) {
            existingConfirm.remove();
        }
        
        const rect = element.getBoundingClientRect();
        
        const confirmation = document.createElement('div');
        confirmation.className = 'delete-confirmation';
        confirmation.style.position = 'fixed';
        confirmation.style.top = `${rect.top - 60}px`;
        confirmation.style.left = `${rect.left}px`;
        
        confirmation.innerHTML = `
            <p>Delete this element?</p>
            <div class="delete-confirmation-buttons">
                <button class="delete-cancel-btn">Cancel</button>
                <button class="delete-confirm-btn">Delete</button>
            </div>
        `;
        
        document.body.appendChild(confirmation);
        
        // Add event listeners
        confirmation.querySelector('.delete-confirm-btn').addEventListener('click', () => {
            const elementId = element.getAttribute('data-id');
            element.remove();
            confirmation.remove();
            
            if (currentBoard.elements) {
                currentBoard.elements = currentBoard.elements.filter(el => 
                    el.id !== elementId && el._id !== elementId
                );
            }
            
            if (selectedElement === element) {
                selectedElement = null;
                updateTextToolbar(null);
            }
            
            scheduleAutoSave();
        });
        
        confirmation.querySelector('.delete-cancel-btn').addEventListener('click', () => {
            confirmation.remove();
        });
        
        // Close confirmation if clicking outside
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!confirmation.contains(e.target) && e.target.closest('.delete-element') !== element.querySelector('.delete-element')) {
                    confirmation.remove();
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    // ===========================================
    // DEBUG & HELP FUNCTIONS
    // ===========================================
    function debugBoardData() {
        console.log('🔍 BOARD DEBUG INFO:');
        console.log('Current Board ID:', currentBoard?._id);
        console.log('Current Visibility (select):', boardVisibility.value);
        console.log('Board Title:', document.getElementById('board-title')?.textContent);
        console.log('Canvas Background:', boardCanvas.style.backgroundColor);
        console.log('Elements on canvas:', document.querySelectorAll('.draggable').length);
        
        // Check localStorage
        console.log('🔑 Token:', localStorage.getItem('hope_token'));
        console.log('👤 User:', JSON.parse(localStorage.getItem('hope_user') || 'null'));
        
        // Test backend
        fetch('http://localhost:5001/health')
            .then(r => r.json())
            .then(health => {
                console.log('🏥 Backend health:', health);
            })
            .catch(e => {
                console.log('❌ Backend not reachable');
            });
        
        // Show in alert
        alert(`Debug Info:\n
Board ID: ${currentBoard?._id || 'None'}
Visibility: ${boardVisibility.value}
Elements: ${document.querySelectorAll('.draggable').length}
User: ${localStorage.getItem('hope_user') ? JSON.parse(localStorage.getItem('hope_user')).username : 'None'}
Token: ${localStorage.getItem('hope_token') ? 'Present' : 'None'}
        `);
    }
    
    function showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Delete/Backspace', action: 'Delete selected element' },
            { key: 'Esc', action: 'Deselect element' },
            { key: 'Ctrl+S', action: 'Save board' },
            { key: 'Double-click', action: 'Edit text' },
            { key: 'Drag handle', action: 'Move element (top bar for music)' },
            { key: 'Resize handle', action: 'Resize element (bottom-right corner)' }
        ];
        
        let message = '📋 Keyboard & Mouse Shortcuts:\n\n';
        shortcuts.forEach(shortcut => {
            message += `• ${shortcut.key}: ${shortcut.action}\n`;
        });
        
        message += '\n💡 Tips:\n';
        message += '• Click "Force Save" if auto-save fails\n';
        message += '• Use "Debug" button to check saved data\n';
        message += '• Spotify: Drag from the top blue bar\n';
        message += '• Delete: Click trash icon or press Delete key\n';
        message += '• Save frequently with Ctrl+S or Save button';
        
        alert(message);
    }
    
    // ===========================================
    // EVENT LISTENERS SETUP - FIXED
    // ===========================================
    function setupEventListeners() {
        // Board creation
        createBoardBtn?.addEventListener('click', createNewBoard);
        createMyBoardBtn?.addEventListener('click', createNewBoard);
        
        // Tab switching
        tabButtons.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
        });
        
        // Board editor
        backToBoardsBtn?.addEventListener('click', async () => {
            boardEditor.classList.add('hidden');
            await switchTab(currentTab);
        });
        
        saveBoardBtn?.addEventListener('click', () => saveBoard(false));
        
        // Tool buttons
        toolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                addElementToBoard(type);
            });
        });
        
        // File uploads
        imageUpload?.addEventListener('change', handleImageUpload);
        gifUpload?.addEventListener('change', handleGifUpload);
        
        // Text formatting
        fontFamilySelect?.addEventListener('change', () => {
            applyTextFormatting('fontFamily', fontFamilySelect.value);
        });
        
        fontSizeInput?.addEventListener('change', () => {
            applyTextFormatting('fontSize', `${fontSizeInput.value}px`);
        });
        
        fontColorPicker?.addEventListener('input', () => {
            applyTextFormatting('color', fontColorPicker.value);
        });
        
        textBgColorPicker?.addEventListener('input', () => {
            applyTextFormatting('backgroundColor', textBgColorPicker.value);
        });
        
        boldBtn?.addEventListener('click', () => applyTextFormatting('fontWeight'));
        italicBtn?.addEventListener('click', () => applyTextFormatting('fontStyle'));
        underlineBtn?.addEventListener('click', () => applyTextFormatting('textDecoration'));
        
        alignLeftBtn?.addEventListener('click', () => applyTextFormatting('textAlign', 'left'));
        alignCenterBtn?.addEventListener('click', () => applyTextFormatting('textAlign', 'center'));
        alignRightBtn?.addEventListener('click', () => applyTextFormatting('textAlign', 'right'));
        
        // Background color
        applyBgColorBtn?.addEventListener('click', () => {
            boardCanvas.style.backgroundColor = backgroundColorPicker.value;
            scheduleAutoSave();
        });
        
        // FIXED: Visibility changes - SAVE IMMEDIATELY
        boardVisibility?.addEventListener('change', async () => {
            console.log('👁️ Visibility changed to:', boardVisibility.value);
            
            // Immediately update the share section
            updateShareSection();
            
            // Save the board with new visibility
            try {
                await saveBoard(false);
                console.log('✅ Visibility saved successfully');
            } catch (error) {
                console.error('❌ Failed to save visibility:', error);
                alert('Failed to update visibility. Please try saving manually.');
            }
        });
        
        // Share link
        copyLinkBtn?.addEventListener('click', () => {
            shareLink.select();
            shareLink.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            // Show feedback
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        });
        
        // Login/Logout
        loginPromptBtn?.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });
        
        closeModalBtn?.addEventListener('click', () => {
            loginModal.style.display = 'none';
            spotifyModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === loginModal || e.target === spotifyModal) {
                loginModal.style.display = 'none';
                spotifyModal.style.display = 'none';
            }
        });
        
        // Canvas click to deselect
        boardCanvas?.addEventListener('click', (e) => {
            if (e.target === boardCanvas) {
                if (selectedElement) {
                    selectedElement.classList.remove('selected');
                    selectedElement = null;
                    updateTextToolbar(null);
                }
            }
        });
        
        // Element deletion
        boardCanvas?.addEventListener('click', (e) => {
            if (e.target.closest('.delete-element')) {
                e.stopPropagation();
                const element = e.target.closest('.draggable');
                showDeleteConfirmation(element);
            }
            
            // Layer controls
            if (e.target.closest('.bring-forward')) {
                e.stopPropagation();
                const element = e.target.closest('.draggable');
                const currentZ = parseInt(element.style.zIndex) || 1;
                element.style.zIndex = currentZ + 1;
                
                const elementId = element.getAttribute('data-id');
                const elementData = currentBoard.elements?.find(el => 
                    el.id === elementId || el._id === elementId
                );
                if (elementData) elementData.zIndex = currentZ + 1;
                
                scheduleAutoSave();
            }
            
            if (e.target.closest('.send-backward')) {
                e.stopPropagation();
                const element = e.target.closest('.draggable');
                const currentZ = parseInt(element.style.zIndex) || 1;
                if (currentZ > 1) {
                    element.style.zIndex = currentZ - 1;
                    
                    const elementId = element.getAttribute('data-id');
                    const elementData = currentBoard.elements?.find(el => 
                        el.id === elementId || el._id === elementId
                    );
                    if (elementData) elementData.zIndex = currentZ - 1;
                    
                    scheduleAutoSave();
                }
            }
        });
        
        // Text content changes
        boardCanvas?.addEventListener('input', (e) => {
            if (e.target.classList.contains('draggable-text')) {
                scheduleAutoSave();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Delete selected element
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && document.activeElement !== selectedElement) {
                e.preventDefault();
                showDeleteConfirmation(selectedElement);
            }
            
            // Save with Ctrl+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveBoard(false);
            }
            
            // Escape to deselect
            if (e.key === 'Escape' && selectedElement) {
                selectedElement.classList.remove('selected');
                selectedElement = null;
                updateTextToolbar(null);
            }
        });
        
        loginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            if (!username) {
                alert('Please enter a username');
                return;
            }
            
            try {
                await api.login(username, password);
                loginModal.style.display = 'none';
                await checkLoginStatus();
                alert(`Welcome ${username}!`);
            } catch (error) {
                alert(`Login failed: ${error.message}`);
            }
        });
        
        logoutBtn?.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                api.logout();
                checkLoginStatus();
                alert('Logged out successfully');
            }
        });
        
        // Spotify form
        spotifyForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const link = spotifyLinkInput.value.trim();
            if (!link) return;
            
            // Validate Spotify URL
            if (!link.includes('spotify.com')) {
                alert('Please enter a valid Spotify URL');
                return;
            }
            
            const elementId = 'element_' + Date.now();
            const elementData = {
                id: elementId,
                type: 'music',
                content: link,
                x: Math.random() * 300 + 50,
                y: Math.random() * 300 + 50,
                zIndex: 1,
                width: 300,
                height: 80
            };
            
            if (!currentBoard.elements) currentBoard.elements = [];
            currentBoard.elements.push(elementData);
            
            const elementDiv = createElementDiv(elementData, true);
            boardCanvas.appendChild(elementDiv);
            selectElement(elementDiv);
            
            spotifyModal.style.display = 'none';
            spotifyLinkInput.value = '';
            
            scheduleAutoSave();
        });
    }
    
    // ===========================================
    // START THE APPLICATION
    // ===========================================
    init();
});