// ===========================================
// HOPE PROJECT API CLIENT - SIMPLE WORKING VERSION
// ===========================================
class HopeAPI {
  constructor() {
   this.baseURL = 'https://hope-project.lilnerosahumi.workers.dev';
    this.token = localStorage.getItem('hope_token');
  }

  // ===========================================
  // HELPER METHODS
  // ===========================================
  setToken(token) {
    this.token = token;
    localStorage.setItem('hope_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('hope_token');
    localStorage.removeItem('hope_user');
  }

  async request(endpoint, options = {}) {
    console.log(`🔗 API Call: ${endpoint}`);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Always send token if we have it
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔑 Sending token:', this.token);
    }
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers,
        ...options
      });
      
      console.log(`📥 Response: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error details:', errorText);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Success');
      return data;
    } catch (error) {
      console.error(`❌ API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // ===========================================
  // AUTHENTICATION
  // ===========================================
  async checkAuth() {
    try {
      const user = localStorage.getItem('hope_user');
      if (!user || !this.token) return null;
      
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  async login(username, password = 'any') {
    console.log(`👤 Login attempt: ${username}`);
    
    try {
      const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      console.log('✅ Login successful:', data);
      
      // Token is just the user ID
      this.setToken(data.token);
      localStorage.setItem('hope_user', JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      console.log('❌ Login failed, using offline mode');
      
      // Fallback
      const fakeData = {
        token: 'user-' + Date.now(),
        user: { 
          id: 'user-' + Date.now(), 
          username: username || 'guest'
        }
      };
      
      this.setToken(fakeData.token);
      localStorage.setItem('hope_user', JSON.stringify(fakeData.user));
      
      return fakeData;
    }
  }

  getCurrentUser() {
    try {
      const user = localStorage.getItem('hope_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  logout() {
    console.log('👋 Logging out');
    this.removeToken();
  }

  // ===========================================
  // BOARDS - SIMPLE VERSION
  // ===========================================
  async getPublicBoards() {
    try {
      const boards = await this.request('/boards/public');
      console.log(`📋 Got ${boards.length} public boards`);
      return boards;
    } catch (error) {
      console.log('No public boards available');
      return [];
    }
  }

  async getUserBoards() {
    try {
      const user = this.getCurrentUser();
      if (!user) {
        console.log('No user logged in');
        return [];
      }
      
      const boards = await this.request('/boards/user');
      console.log(`📋 Got ${boards.length} user boards for ${user.username}`);
      return boards;
    } catch (error) {
      console.log('Error getting user boards:', error.message);
      return [];
    }
  }

  async createBoard(title) {
    console.log(`🎨 Creating board: "${title}"`);
    
    const user = this.getCurrentUser();
    if (!user) throw new Error('Please login first');
    
    return await this.request('/boards', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async getBoard(boardId) {
    console.log(`📖 Getting board: ${boardId}`);
    return await this.request(`/boards/${boardId}`);
  }

  async updateBoard(boardId, data) {
    console.log(`💾 Saving board ${boardId}:`, {
      title: data.title,
      visibility: data.visibility,
      elements: data.elements?.length || 0
    });
    
    return await this.request(`/boards/${boardId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // ===========================================
  // OTHER ENDPOINTS
  // ===========================================
  async getLetters(search = '', category = '') {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/letters${query}`);
  }

  async addLetter(letterData) {
    return await this.request('/letters', {
      method: 'POST',
      body: JSON.stringify(letterData)
    });
  }

  async likeLetter(letterId) {
    return await this.request(`/letters/${letterId}/like`, {
      method: 'POST'
    });
  }

  async getResources(tag = 'all') {
    const query = tag !== 'all' ? `?tag=${tag}` : '';
    return await this.request(`/resources${query}`);
  }

  async addResource(resourceData) {
    return await this.request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  }

  // ===========================================
  // DEBUG HELPERS
  // ===========================================
  async debugBackend() {
    console.log('🔍 DEBUG BACKEND:');
    console.log('Token:', this.token);
    console.log('User:', this.getCurrentUser());
    
    try {
      const health = await fetch('https://hope-project.lilnerosahumi.workers.dev').then(r => r.json());
      console.log('Health check:', health);
    } catch (e) {
      console.log('Backend not reachable');
    }
  }
}

// ===========================================
// CREATE GLOBAL API INSTANCE
// ===========================================
const api = new HopeAPI();

// Add to window for debugging
window.api = api;

// Auto-check on load
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Hope Project API Loaded');
  console.log('Current user:', api.getCurrentUser());
  console.log('Token:', api.token);
});