// HOPE PROJECT API CLIENT
class HopeAPI {
  constructor() {
    // Your live worker URL
    this.baseURL = 'https://hope-project.lilnerosahumi.workers.dev';
    this.token = localStorage.getItem('hope_token');

    // Auto-generate a device token on first visit
    if (!this.token) {
      this.token = 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('hope_token', this.token);
    }
  }

  // TOKEN HELPERS

  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('hope_token', token);
  }

  getToken() {
    return this.token;
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('hope_token');
  }

  // Kept only so nothing else that references it crashes.
  // Always returns a fake "user" based on the device token.
  getCurrentUser() {
    return { id: this.token, username: 'Guest' };
  }

  // LOW-LEVEL REQUEST

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  // BOARDS
  
  async getPublicBoards() {
    try {
      return await this.request('/api/boards/public');
    } catch (e) {
      console.warn('getPublicBoards failed:', e.message);
      return [];
    }
  }

  async getUserBoards() {
    try {
      return await this.request('/api/boards/user');
    } catch (e) {
      console.warn('getUserBoards failed:', e.message);
      return [];
    }
  }

  async createBoard(title) {
    return await this.request('/api/boards', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async getBoard(boardId) {
    return await this.request(`/api/boards/${boardId}`);
  }

  async updateBoard(boardId, data) {
    return await this.request(`/api/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
 
  // LETTERS

  async getLetters(search = '', category = '') {
    const params = new URLSearchParams();
    if (search && search.trim() !== '') params.append('search', search);
    if (category && category.trim() !== '') params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/api/letters${query}`);
  }

  async addLetter(letterData) {
    return await this.request('/api/letters', {
      method: 'POST',
      body: JSON.stringify(letterData)
    });
  }

  async likeLetter(letterId) {
    return await this.request(`/api/letters/${letterId}/like`, {
      method: 'POST'
    });
  }

  // RESOURCES
 
  async getResources(tag = 'all') {
    const query = tag !== 'all' ? `?tag=${tag}` : '';
    return await this.request(`/api/resources${query}`);
  }

  async addResource(resourceData) {
    return await this.request('/api/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  }

  async deleteResource(id) {
    return await this.request(`/api/resources/${id}`, {
      method: 'DELETE'
    });
  }

  // DEBUG
 
  async debugBackend() {
    try {
      const health = await fetch(`${this.baseURL}/api/health`).then(r => r.json());
      console.log('Health:', health);
      return health;
    } catch (e) {
      console.error('Backend not reachable:', e.message);
      return null;
    }
  }
}
const api = new HopeAPI();
window.api = api;