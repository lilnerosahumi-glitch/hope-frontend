//BOARDS 
document.addEventListener('DOMContentLoaded', function () {

    /*DEVICE TOKEN — replaces login*/
    let TOKEN = localStorage.getItem('hope_token');
    if (!TOKEN) {
        TOKEN = 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('hope_token', TOKEN);
    }
    if (window.api && typeof api.setToken === 'function') api.setToken(TOKEN);

    // 1. CONSTANTS
    const LOGICAL_W = 1200;
    const LOGICAL_H = 800;
    const DEFAULT_BG = '#f7f7fb';

    //  2. DOM 
    const publicGrid    = document.getElementById('public-boards-grid');
    const myGrid        = document.getElementById('my-boards-grid');
    const publicSection = document.getElementById('public-boards-section');
    const mySection     = document.getElementById('my-boards-section');
    const editor        = document.getElementById('board-editor');

    const createBoardBtn   = document.getElementById('create-board-btn');
    const createMyBoardBtn = document.getElementById('create-my-board-btn');
    const backBtn          = document.getElementById('back-to-boards-btn');
    const saveBtn          = document.getElementById('save-board-btn');
    const copyLinkBtn      = document.getElementById('copy-link-btn');

    const boardTitleInput = document.getElementById('board-title');
    const boardVisibility = document.getElementById('board-visibility');
    const bgColorPicker   = document.getElementById('background-color');

    const tabButtons = document.querySelectorAll('.tab-btn');

    const canvas          = document.getElementById('board-canvas');
    const canvasContainer = document.querySelector('.board-canvas-container');
    const canvasHint      = document.getElementById('canvas-hint');

    const addButtons  = document.querySelectorAll('.tool-btn[data-add]');
    const imageUpload = document.getElementById('image-upload');
    const gifUpload   = document.getElementById('gif-upload');

    const textToolbar    = document.getElementById('text-toolbar');
    const fontFamily     = document.getElementById('font-family');
    const fontSize       = document.getElementById('font-size');
    const fontColor      = document.getElementById('font-color');
    const boldBtn        = document.getElementById('bold-btn');
    const italicBtn      = document.getElementById('italic-btn');
    const underlineBtn   = document.getElementById('underline-btn');
    const alignLeftBtn   = document.getElementById('align-left-btn');
    const alignCenterBtn = document.getElementById('align-center-btn');
    const alignRightBtn  = document.getElementById('align-right-btn');
    const textBgColor    = document.getElementById('text-bg-color');
    const clearBgBtn     = document.getElementById('clear-bg-btn');

    const spotifyModal = document.getElementById('spotify-modal');
    const spotifyForm  = document.getElementById('spotify-form');
    const spotifyLink  = document.getElementById('spotify-link');

    
    //  3. STATE
    
    let currentBoard = null;
    let currentTab   = 'public';
    let selectedEl   = null;
    let scale        = 1;
    let saveTimer    = null;
    let isSaving     = false;

    function cleanSticker(text) {
    if (!text) return '⭐';
    // Strip any HTML tags 
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    const plain = (tmp.textContent || tmp.innerText || '').trim();
    // If it's empty after stripping, fall back
    return plain || '⭐';
}
    
    //  4. CANVAS SCALING (keeps board fully visible anywhere)
    
    function fitCanvas() {
        const w = canvasContainer.clientWidth;
        if (!w) return;
        scale = w / LOGICAL_W;
        canvas.style.transform = `scale(${scale})`;
        canvas.style.width  = LOGICAL_W + 'px';
        canvas.style.height = LOGICAL_H + 'px';
        canvasContainer.style.height = (LOGICAL_H * scale) + 'px';
    }
    window.addEventListener('resize', fitCanvas);
    if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(canvasContainer);

    function toLogical(clientX, clientY) {
        const r = canvas.getBoundingClientRect();
        return { x: (clientX - r.left) / scale, y: (clientY - r.top) / scale };
    }

   
    //  5. TABS
   
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
    });

    function switchTab(tab) {
        currentTab = tab;
        tabButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tab));
        if (tab === 'public') {
            publicSection.classList.remove('hidden');
            mySection.classList.add('hidden');
            loadPublicBoards();
        } else {
            publicSection.classList.add('hidden');
            mySection.classList.remove('hidden');
            loadMyBoards();
        }
    }


    //  6. BOARD LIST + PREVIEWS

    async function loadPublicBoards() {
        publicGrid.innerHTML = loadingHTML('Loading public boards…');
        try {
            const boards = await api.getPublicBoards();
            renderBoardList(boards, publicGrid, false);
        } catch (e) {
            console.error(e);
            publicGrid.innerHTML = errorHTML('Could not load public boards.');
        }
    }

    async function loadMyBoards() {
        myGrid.innerHTML = loadingHTML('Loading your boards…');
        try {
            const boards = await api.getUserBoards();
            renderBoardList(boards, myGrid, true);
        } catch (e) {
            console.error(e);
            myGrid.innerHTML = errorHTML('Could not load your boards.');
        }
    }

    const loadingHTML = t => `<div class="loading-spinner"><div class="spinner"></div><p>${t}</p></div>`;
    const errorHTML   = t => `<div class="error-message"><p>${t}</p></div>`;

    function emptyHTML(text, id, label) {
        return `<div class="empty-boards"><p>${text}</p>
                <button class="primary-btn" id="${id}">${label}</button></div>`;
    }

    function renderBoardList(boards, container, editable) {
        container.innerHTML = '';
        if (!boards || boards.length === 0) {
            if (editable) {
                container.innerHTML = emptyHTML("You don't have any boards yet.", 'empty-mine', 'Create your first board');
                document.getElementById('empty-mine')?.addEventListener('click', createBoard);
            } else {
                container.innerHTML = emptyHTML('No public boards yet. Be the first!', 'empty-public', 'Create a public board');
                document.getElementById('empty-public')?.addEventListener('click', createBoard);
            }
            return;
        }
            
    const shuffled = [...boards].sort(() => Math.random() - 0.5);
    shuffled.forEach(b => container.appendChild(makeBoardCard(b, editable)));
}

    function makeBoardCard(board, editable) {
        const card = document.createElement('div');
        card.className = 'board-card';

        const thumb = document.createElement('div');
        thumb.className = 'board-thumbnail';

        if (board.elements && board.elements.length) {
            renderPreview(board, thumb);
        } else {
            thumb.innerHTML = `<div class="board-thumbnail-empty">
                <i class="fas fa-palette"></i><p>Empty board</p></div>`;
        }

        const info = document.createElement('div');
        info.className = 'board-info';

        const title = document.createElement('div');
        title.className = 'board-title';
        title.textContent = board.title || 'Untitled Board';

        const meta = document.createElement('div');
        meta.className = 'board-meta';

        const dateSpan = document.createElement('span');
        dateSpan.textContent = formatDate(board.updatedAt || board.createdAt);
        meta.appendChild(dateSpan);

        if (editable && board.visibility) {
            const vis = document.createElement('span');
            vis.className = 'board-visibility ' + board.visibility;
            vis.textContent = board.visibility;
            meta.appendChild(vis);
        } else if (!editable && board.owner) {
            const a = document.createElement('span');
            a.className = 'board-author';
            a.textContent = 'by ' + (typeof board.owner === 'object' ? board.owner.username : 'Anonymous');
            meta.appendChild(a);
        }

        info.appendChild(title);
        info.appendChild(meta);
        card.appendChild(thumb);
        card.appendChild(info);
        card.addEventListener('click', () => openBoard(board._id));
        return card;
    }

    function renderPreview(board, thumbEl) {
        const inner = document.createElement('div');
        inner.className = 'board-thumbnail-inner';
        inner.style.width  = LOGICAL_W + 'px';
        inner.style.height = LOGICAL_H + 'px';
        inner.style.background = board.backgroundColor || DEFAULT_BG;
        inner.style.transformOrigin = 'top left';

        requestAnimationFrame(() => {
            const w = thumbEl.clientWidth || 300;
            inner.style.transform = `scale(${w / LOGICAL_W})`;
        });

        (board.elements || []).forEach(el => inner.appendChild(buildPreviewElement(el)));
        thumbEl.appendChild(inner);
    }

    function buildPreviewElement(el) {
        const d = document.createElement('div');
        d.style.position = 'absolute';
        d.style.left   = (el.x || 0) + 'px';
        d.style.top    = (el.y || 0) + 'px';
        d.style.width  = (typeof el.width === 'number' ? el.width : parseFloat(el.width) || 200) + 'px';
        d.style.height = (typeof el.height === 'number' ? el.height : parseFloat(el.height) || 200) + 'px';
        d.style.zIndex = el.zIndex || 1;
        d.style.overflow = 'hidden';

        switch (el.type) {
            case 'text':
                d.style.color = el.color || '#2f2a3a';
                d.style.fontFamily = el.fontFamily || 'Merriweather, serif';
                d.style.fontSize = (el.fontSize || 28) + 'px';
                d.style.fontWeight = el.fontWeight || 'normal';
                d.style.fontStyle = el.fontStyle || 'normal';
                d.style.textDecoration = el.textDecoration || 'none';
                d.style.textAlign = el.textAlign || 'left';
                d.style.background = el.backgroundColor || 'transparent';
                d.style.lineHeight = '1.3';
                d.style.padding = '4px 6px';
                d.style.whiteSpace = 'pre-wrap';
                d.style.wordBreak = 'break-word';
                d.textContent = el.content || '';
                break;
            case 'image':
            case 'gif': {
                const img = document.createElement('img');
                img.src = el.content || '';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                d.appendChild(img);
                break;
            }
            case 'sticker':
                d.style.display = 'flex';
                d.style.alignItems = 'center';
                d.style.justifyContent = 'center';
                d.style.fontSize = '64px';
                d.textContent = el.content || '⭐';
                break;
            case 'music':
                d.style.background = '#f0eaff';
                d.style.borderRadius = '8px';
                d.style.display = 'flex';
                d.style.alignItems = 'center';
                d.style.justifyContent = 'center';
                d.style.color = '#7a5fd1';
                d.innerHTML = '<i class="fas fa-music" style="font-size:32px"></i>';
                break;
            case 'shape':
                d.style.background = el.color || '#CBB0FF';
                d.style.borderRadius = el.shape === 'circle' ? '50%' : '8px';
                break;
        }
        return d;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Recently';
        try {
            const d = new Date(dateStr);
            if (isNaN(d)) return 'Recently';
            const days = Math.floor((Date.now() - d) / 86400000);
            if (days <= 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return days + ' days ago';
            if (days < 30) return Math.floor(days / 7) + ' weeks ago';
            return d.toLocaleDateString();
        } catch { return 'Recently'; }
    }

    
    //  7. CREATE / OPEN
   
    createBoardBtn?.addEventListener('click', createBoard);
    createMyBoardBtn?.addEventListener('click', createBoard);

    async function createBoard() {
        const title = prompt('Board title:', 'My Inspiration Board');
        if (!title || !title.trim()) return;
        try {
            const board = await api.createBoard(title.trim());
            if (currentTab !== 'my-boards') {
                await switchTab('my-boards');
            } else {
                await loadMyBoards();
            }
            await openBoard(board._id);
        } catch (e) {
            console.error(e);
            alert('Could not create board: ' + e.message);
        }
    }

    async function openBoard(id) {
        try {
            const board = await api.getBoard(id);
            currentBoard = board;

            publicSection.classList.add('hidden');
            mySection.classList.add('hidden');
            editor.classList.remove('hidden');

            boardTitleInput.value = board.title || 'Untitled Board';
            boardVisibility.value = board.visibility || 'private';
            bgColorPicker.value = board.backgroundColor || DEFAULT_BG;
            canvas.style.backgroundColor = board.backgroundColor || DEFAULT_BG;
            
            const isViewOnly = board.visibility === 'public';
            editor.classList.toggle('view-only', isViewOnly);
            boardTitleInput.readOnly = isViewOnly;

            updateShareSection();

            canvas.innerHTML = '';
            (board.elements || []).forEach(el => canvas.appendChild(buildElement(el)));

            requestAnimationFrame(fitCanvas);
            deselect();
            updateTextToolbar();
            setSaveState('idle');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error(e);
            alert('Could not open board: ' + e.message);
        }
    }

    backBtn?.addEventListener('click', async () => {
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; await saveBoard(); }
        editor.classList.add('hidden');
        currentBoard = null;
        if (currentTab === 'my-boards') {
            mySection.classList.remove('hidden');
            loadMyBoards();
        } else {
            publicSection.classList.remove('hidden');
            loadPublicBoards();
        }
    });

   
    //  8. BUILD ELEMENTS
    
    function buildElement(el) {
        const d = document.createElement('div');
        d.className = 'draggable';
        d.setAttribute('data-id', el.id || el._id || ('e-' + Date.now() + Math.random()));
        d.style.left   = (el.x || 0) + 'px';
        d.style.top    = (el.y || 0) + 'px';
        d.style.zIndex = el.zIndex || 1;

        const w = typeof el.width === 'number' ? el.width : parseFloat(el.width) || 200;
        const h = typeof el.height === 'number' ? el.height : parseFloat(el.height) || 200;
        d.style.width  = w + 'px';
        d.style.height = h + 'px';

        switch (el.type) {
            case 'text':
                d.classList.add('draggable-text');
                d.contentEditable = 'false';
                d.style.fontFamily = el.fontFamily || 'Merriweather, serif';
                d.style.fontSize = (el.fontSize || 28) + 'px';
                d.style.color = el.color || '#2f2a3a';
                d.style.background = el.backgroundColor || 'transparent';
                d.style.fontWeight = el.fontWeight || 'normal';
                d.style.fontStyle = el.fontStyle || 'normal';
                d.style.textDecoration = el.textDecoration || 'none';
                d.style.textAlign = el.textAlign || 'left';
                d.textContent = el.content || 'Double-click to edit';

                d.addEventListener('dblclick', e => { e.stopPropagation(); enterTextEdit(d); });
                d.addEventListener('blur', () => {
                    d.contentEditable = 'false';
                    scheduleSave();
                });
                break;

            case 'image':
            case 'gif': {
                const img = document.createElement('img');
                img.src = el.content || '';
                img.draggable = false;
                d.appendChild(img);
                break;
            }

            case 'sticker':
                d.classList.add('draggable-sticker');
                d.textContent = cleanSticker(el.content);
            break;

            case 'music': {
                d.classList.add('draggable-music');
                const handle = document.createElement('div');
                handle.className = 'music-drag-handle';
                handle.innerHTML = '<i class="fas fa-arrows-alt"></i>';
                d.appendChild(handle);

                if (el.content && el.content.includes('spotify.com')) {
                    const iframe = document.createElement('iframe');
                    iframe.className = 'music-embed';
                    iframe.src = normalizeSpotify(el.content);
                    iframe.loading = 'lazy';
                    iframe.allow = 'encrypted-media';
                    d.appendChild(iframe);
                } else {
                    const ph = document.createElement('div');
                    ph.className = 'music-placeholder';
                    ph.innerHTML = '<i class="fas fa-music"></i><p>Music</p>';
                    d.appendChild(ph);
                }
                break;
            }

            case 'shape':
                d.classList.add('draggable-shape');
                d.style.backgroundColor = el.color || '#CBB0FF';
                if (el.shape === 'circle') d.classList.add('circle');
                break;
        }

        // Skip interactive controls if the board is public (view-only mode)

if (!editor.classList.contains('view-only')) {
    const controls = document.createElement('div');
    controls.className = 'draggable-controls';
    controls.innerHTML = `
        <button class="bring-forward" title="Bring forward"><i class="fas fa-arrow-up"></i></button>
        <button class="send-backward" title="Send backward"><i class="fas fa-arrow-down"></i></button>
        <button class="delete-element" title="Delete"><i class="fas fa-trash"></i></button>
    `;
    d.appendChild(controls);

    const resize = document.createElement('div');
    resize.className = 'resize-handle';
    d.appendChild(resize);

    makeDraggable(d);
    makeResizable(d, resize);
}
return d;
    }

    function normalizeSpotify(url) {
        if (!url) return url;
        if (url.includes('/embed/')) return url;
        const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
        return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : url;
    }

    //  9. SELECTION
    
    function selectElement(el) {
        if (selectedEl === el) return;
        if (selectedEl) selectedEl.classList.remove('selected');
        selectedEl = el;
        if (el) el.classList.add('selected');
        updateTextToolbar();
    }

    function deselect() {
        if (selectedEl) selectedEl.classList.remove('selected');
        selectedEl = null;
        updateTextToolbar();
    }

    canvas.addEventListener('pointerdown', e => {
        if (e.target === canvas) deselect();
    });

    
    // 10. DRAG (pointer events = mouse + touch)
    
    function makeDraggable(el) {
        el.addEventListener('pointerdown', e => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            if (e.target.closest('.draggable-controls')) return;
            if (e.target.classList.contains('resize-handle')) return;
            if (el.classList.contains('draggable-text') && el.isContentEditable) return;

            if (el.classList.contains('draggable-music')) {
                const h = el.querySelector('.music-drag-handle');
                if (!h || !h.contains(e.target)) return;
            }

            e.preventDefault();
            selectElement(el);
            el.classList.add('dragging');
            el.setPointerCapture(e.pointerId);

            const start = toLogical(e.clientX, e.clientY);
            const startLeft = parseFloat(el.style.left) || 0;
            const startTop  = parseFloat(el.style.top)  || 0;

            const onMove = ev => {
                const p = toLogical(ev.clientX, ev.clientY);
                let nl = startLeft + (p.x - start.x);
                let nt = startTop  + (p.y - start.y);
                nl = Math.max(0, Math.min(nl, LOGICAL_W - el.offsetWidth));
                nt = Math.max(0, Math.min(nt, LOGICAL_H - el.offsetHeight));
                el.style.left = nl + 'px';
                el.style.top  = nt + 'px';
            };
            const onUp = () => {
                el.classList.remove('dragging');
                try { el.releasePointerCapture(e.pointerId); } catch {}
                el.removeEventListener('pointermove', onMove);
                el.removeEventListener('pointerup', onUp);
                el.removeEventListener('pointercancel', onUp);
                scheduleSave();
            };

            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerup', onUp);
            el.addEventListener('pointercancel', onUp);
        });
    }


    // 11. RESIZE
    
    function makeResizable(el, handle) {
        handle.addEventListener('pointerdown', e => {
            e.preventDefault();
            e.stopPropagation();
            if (el.classList.contains('draggable-text') && el.isContentEditable) return;

            selectElement(el);
            handle.setPointerCapture(e.pointerId);

            const start = toLogical(e.clientX, e.clientY);
            const startW = el.offsetWidth;
            const startH = el.offsetHeight;

            const onMove = ev => {
                const p = toLogical(ev.clientX, ev.clientY);
                const w = Math.max(30, startW + (p.x - start.x));
                const h = Math.max(20, startH + (p.y - start.y));
                el.style.width  = w + 'px';
                el.style.height = h + 'px';
            };
            const onUp = () => {
                try { handle.releasePointerCapture(e.pointerId); } catch {}
                handle.removeEventListener('pointermove', onMove);
                handle.removeEventListener('pointerup', onUp);
                handle.removeEventListener('pointercancel', onUp);
                scheduleSave();
            };

            handle.addEventListener('pointermove', onMove);
            handle.addEventListener('pointerup', onUp);
            handle.addEventListener('pointercancel', onUp);
        });
    }

    
    // 12. TEXT EDIT
 
    function enterTextEdit(el) {
        if (el.isContentEditable) return;
        el.contentEditable = 'true';
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

   
    // 13. CONTROL BUTTONS
   
    canvas.addEventListener('click', e => {
        const el = e.target.closest('.draggable');
        if (!el) return;

        if (e.target.closest('.delete-element')) {
            e.stopPropagation();
            el.remove();
            if (selectedEl === el) deselect();
            scheduleSave();
        } else if (e.target.closest('.bring-forward')) {
            e.stopPropagation();
            el.style.zIndex = (parseInt(el.style.zIndex) || 1) + 1;
            scheduleSave();
        } else if (e.target.closest('.send-backward')) {
            e.stopPropagation();
            const z = parseInt(el.style.zIndex) || 1;
            if (z > 1) el.style.zIndex = z - 1;
            scheduleSave();
        }
    });

    
    // 14. TEXT TOOLBAR
    
    function updateTextToolbar() {
        const isText = selectedEl && selectedEl.classList.contains('draggable-text');
        textToolbar.classList.toggle('is-disabled', !isText);
        if (!isText) return;

        const s = selectedEl.style;
        [...fontFamily.options].forEach(o => {
            const key = o.value.split(',')[0].replace(/['"]/g, '').trim();
            if ((s.fontFamily || '').includes(key)) fontFamily.value = o.value;
        });
        fontSize.value = parseInt(s.fontSize) || 28;
        fontColor.value = rgbToHex(s.color) || '#2f2a3a';
        textBgColor.value = rgbToHex(s.backgroundColor) || '#ffffff';

        boldBtn.classList.toggle('active', s.fontWeight === 'bold');
        italicBtn.classList.toggle('active', s.fontStyle === 'italic');
        underlineBtn.classList.toggle('active', (s.textDecoration || '').includes('underline'));

        const align = s.textAlign || 'left';
        alignLeftBtn.classList.toggle('active', align === 'left');
        alignCenterBtn.classList.toggle('active', align === 'center');
        alignRightBtn.classList.toggle('active', align === 'right');
    }

    function rgbToHex(rgb) {
        if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return '#ffffff';
        if (rgb.startsWith('#')) return rgb;
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return '#ffffff';
        return '#' + (+m[1]).toString(16).padStart(2, '0')
                   + (+m[2]).toString(16).padStart(2, '0')
                   + (+m[3]).toString(16).padStart(2, '0');
    }

    function applyTextStyle(prop, value) {
        if (!selectedEl || !selectedEl.classList.contains('draggable-text')) return;
        selectedEl.style[prop] = value;
        updateTextToolbar();
        scheduleSave();
    }

    fontFamily?.addEventListener('change', () => applyTextStyle('fontFamily', fontFamily.value));
    fontSize?.addEventListener('input',  () => applyTextStyle('fontSize', fontSize.value + 'px'));
    fontColor?.addEventListener('input', () => applyTextStyle('color', fontColor.value));
    textBgColor?.addEventListener('input', () => applyTextStyle('backgroundColor', textBgColor.value));
    clearBgBtn?.addEventListener('click', () => applyTextStyle('backgroundColor', 'transparent'));

    boldBtn?.addEventListener('click', () => {
        if (!selectedEl) return;
        applyTextStyle('fontWeight', selectedEl.style.fontWeight === 'bold' ? 'normal' : 'bold');
    });
    italicBtn?.addEventListener('click', () => {
        if (!selectedEl) return;
        applyTextStyle('fontStyle', selectedEl.style.fontStyle === 'italic' ? 'normal' : 'italic');
    });
    underlineBtn?.addEventListener('click', () => {
        if (!selectedEl) return;
        const on = (selectedEl.style.textDecoration || '').includes('underline');
        applyTextStyle('textDecoration', on ? 'none' : 'underline');
    });
    alignLeftBtn?.addEventListener('click',   () => applyTextStyle('textAlign', 'left'));
    alignCenterBtn?.addEventListener('click', () => applyTextStyle('textAlign', 'center'));
    alignRightBtn?.addEventListener('click',  () => applyTextStyle('textAlign', 'right'));


    // 15. ADD ELEMENT BUTTONS
    
    addButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentBoard) return;
            const kind = btn.getAttribute('data-add');
            if (kind === 'image')   return imageUpload.click();
            if (kind === 'gif')     return gifUpload.click();
            if (kind === 'sticker') return addSticker();
            if (kind === 'text')    return addText();
            if (kind === 'music')   return (spotifyModal.style.display = 'block');
            if (kind === 'shape')   return addShape();
        });
    });

    function addText() {
        const el = buildElement({
            id: 'e-' + Date.now(),
            type: 'text',
            content: 'New text',
            x: 80, y: 80, zIndex: 10,
            width: 320, height: 60,
            fontFamily: 'Merriweather, serif',
            fontSize: 32,
            color: '#2f2a3a',
            backgroundColor: 'transparent',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left'
        });
        canvas.appendChild(el);
        selectElement(el);
        setTimeout(() => enterTextEdit(el), 60);
        scheduleSave();
    }

    function addSticker() {
        const stickers = ['⭐','❤️','🌸','✨','😊','🌈','🎨','🎵','📚','🌻','🦋','☀️'];
        const el = buildElement({
            id: 'e-' + Date.now(),
            type: 'sticker',
            content: stickers[Math.floor(Math.random() * stickers.length)],
            x: 100, y: 100, zIndex: 5,
            width: 100, height: 100
        });
        canvas.appendChild(el);
        selectElement(el);
        scheduleSave();
    }

    function addShape() {
        const el = buildElement({
            id: 'e-' + Date.now(),
            type: 'shape',
            shape: Math.random() > 0.5 ? 'circle' : 'rect',
            color: '#CBB0FF',
            x: 100, y: 100, zIndex: 3,
            width: 160, height: 160
        });
        canvas.appendChild(el);
        selectElement(el);
        scheduleSave();
    }

    imageUpload?.addEventListener('change', e => handleFileUpload(e, 'image'));
    gifUpload?.addEventListener('change',   e => handleFileUpload(e, 'gif'));

    function handleFileUpload(e, kind) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('File is too large (max 5 MB).');
            e.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = ev => {
            const el = buildElement({
                id: 'e-' + Date.now(),
                type: kind,
                content: ev.target.result,
                x: 80, y: 80, zIndex: 4,
                width: 260, height: 260
            });
            canvas.appendChild(el);
            selectElement(el);
            scheduleSave();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    }

    spotifyForm?.addEventListener('submit', e => {
        e.preventDefault();
        const url = spotifyLink.value.trim();
        if (!url) return;
        const el = buildElement({
            id: 'e-' + Date.now(),
            type: 'music',
            content: url,
            x: 100, y: 100, zIndex: 6,
            width: 320, height: 100
        });
        canvas.appendChild(el);
        selectElement(el);
        spotifyModal.style.display = 'none';
        spotifyLink.value = '';
        scheduleSave();
    });

    document.querySelectorAll('[data-close], .close-modal').forEach(x => {
        x.addEventListener('click', () => x.closest('.modal').style.display = 'none');
    });
    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });

    bgColorPicker?.addEventListener('input', () => {
        canvas.style.backgroundColor = bgColorPicker.value;
        scheduleSave();
    });

    
    // 16. SAVE
    
    function scheduleSave() {
        if (!currentBoard) return;
        setSaveState('pending');
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(saveBoard, 900);
    }

    function setSaveState(state) {
        if (!saveBtn) return;
        if (state === 'pending') {
            saveBtn.classList.remove('saved', 'saving');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        } else if (state === 'saving') {
            saveBtn.classList.remove('saved');
            saveBtn.classList.add('saving');
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving…';
        } else if (state === 'saved') {
            saveBtn.classList.remove('saving');
            saveBtn.classList.add('saved');
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved';
            setTimeout(() => {
                saveBtn.classList.remove('saved');
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
            }, 1500);
        } else {
            saveBtn.classList.remove('saving', 'saved');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
        }
    }

    async function saveBoard() {
        if (!currentBoard || isSaving) return;
        isSaving = true;
        setSaveState('saving');

        const elements = [];
        canvas.querySelectorAll('.draggable').forEach(d => {
            const type =
                d.classList.contains('draggable-text')    ? 'text'    :
                d.classList.contains('draggable-sticker') ? 'sticker' :
                d.classList.contains('draggable-music')   ? 'music'   :
                d.classList.contains('draggable-shape')   ? 'shape'   :
                (d.querySelector('img') && d.querySelector('img').src.startsWith('data:image/gif')) ? 'gif' :
                'image';

            const data = {
                id: d.getAttribute('data-id'),
                type,
                x: Math.round(parseFloat(d.style.left) || 0),
                y: Math.round(parseFloat(d.style.top)  || 0),
                zIndex: parseInt(d.style.zIndex) || 1,
                width: d.offsetWidth,
                height: d.offsetHeight
            };

            if (type === 'text') {
                data.content = d.textContent;
                data.fontFamily = d.style.fontFamily || 'Merriweather, serif';
                data.fontSize = parseInt(d.style.fontSize) || 28;
                data.color = d.style.color || '#2f2a3a';
                data.backgroundColor = d.style.backgroundColor || 'transparent';
                data.fontWeight = d.style.fontWeight || 'normal';
                data.fontStyle  = d.style.fontStyle || 'normal';
                data.textDecoration = d.style.textDecoration || 'none';
                data.textAlign = d.style.textAlign || 'left';
            } else if (type === 'image' || type === 'gif') {
                const img = d.querySelector('img');
                data.content = img ? img.src : '';
            } else if (type === 'sticker') {
                data.content = d.textContent;
            } else if (type === 'music') {
                const f = d.querySelector('iframe');
                data.content = f ? f.src : '';
            } else if (type === 'shape') {
                data.color = d.style.backgroundColor || '#CBB0FF';
                data.shape = d.classList.contains('circle') ? 'circle' : 'rect';
            }

            elements.push(data);
        });

        const payload = {
            title: boardTitleInput.value.trim() || 'Untitled Board',
            visibility: boardVisibility.value,
            backgroundColor: canvas.style.backgroundColor || DEFAULT_BG,
            elements
        };

                try {
            const updated = await api.updateBoard(currentBoard._id, payload);
            currentBoard = updated || { ...currentBoard, ...payload };
            setSaveState('saved');
        } catch (e) {
            console.error('Save failed:', e);
            setSaveState('idle');
            if (saveBtn) {
                saveBtn.classList.remove('saving', 'saved');
                saveBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Save failed';
                saveBtn.style.background = '#e74c3c';
                setTimeout(() => {
                    saveBtn.style.background = '';
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save';
                }, 2500);
            }
        } finally {
            isSaving = false;
            saveTimer = null;
        }
    }

    saveBtn?.addEventListener('click', () => {
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
        saveBoard();
    });

    window.addEventListener('beforeunload', () => {
        if (saveTimer && currentBoard) saveBoard();
    });

   
    // 17. VISIBILITY / SHARE
    
   boardVisibility?.addEventListener('change', async () => {
    const isViewOnly = boardVisibility.value === 'public';
    editor.classList.toggle('view-only', isViewOnly);
    boardTitleInput.readOnly = isViewOnly;
    updateShareSection();
    await saveBoard();
    
    // Rebuild elements so controls appear or disappear
    if (currentBoard) {
        canvas.innerHTML = '';
        (currentBoard.elements || []).forEach(el => canvas.appendChild(buildElement(el)));
        requestAnimationFrame(fitCanvas);
        deselect();
    }
});

    function updateShareSection() {
        if (!currentBoard) return;
        copyLinkBtn.classList.toggle('hidden', boardVisibility.value !== 'public');
    }

    copyLinkBtn?.addEventListener('click', () => {
        if (!currentBoard) return;
        const url = window.location.origin + window.location.pathname + '?share=' + currentBoard._id;
        navigator.clipboard.writeText(url).then(
            () => {
                const old = copyLinkBtn.innerHTML;
                copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Copied';
                setTimeout(() => copyLinkBtn.innerHTML = old, 1500);
            },
            () => prompt('Copy this link:', url)
        );
    });

    boardTitleInput?.addEventListener('input', scheduleSave);

   
    // 18. INIT
  
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('share');
    if (shared) {
        openBoard(shared);
    } else {
        switchTab('public');
    }

    // 19. KEYBOARD
    document.addEventListener('keydown', e => {
        if (editor.classList.contains('hidden')) return;
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEl && !selectedEl.isContentEditable) {
            if (document.activeElement !== boardTitleInput && document.activeElement !== selectedEl) {
                e.preventDefault();
                selectedEl.remove();
                deselect();
                scheduleSave();
            }
        }
        if (e.key === 'Escape') deselect();
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
            saveBoard();
        }
    });

    //  20. CAT BUBBLE 
    document.querySelector('.close-bubble')?.addEventListener('click', () => {
        const b = document.querySelector('.speech-bubble');
        if (b) b.style.display = 'none';
    });
});