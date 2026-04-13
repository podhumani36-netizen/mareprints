const API_BASE_URL = "https://mareprints.com/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Token ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || JSON.stringify(data));
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async register(userData) {
    return this.request("/register/", {
      method: "POST",
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password2: userData.confirmPassword,
      }),
    });
  }

  async login(email, password) {
    const data = await this.request("/login/", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      this.setToken(data.token);
      this.setUser(data.user);
    }

    return data;
  }

  async logout() {
    await this.request("/logout/", {
      method: "POST",
    });
    this.removeToken();
    this.removeUser();
    if (typeof window !== "undefined") {
      localStorage.removeItem("isLoggedIn");
    }
  }

  async verifyEmail(token) {
    return this.request(`/verify-email/?token=${token}`, {
      method: "GET",
    });
  }

  async forgotPassword(email) {
    return this.request("/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token, password, confirmPassword) {
    return this.request("/reset-password/", {
      method: "POST",
      body: JSON.stringify({
        token,
        password,
        password2: confirmPassword,
      }),
    });
  }

  async getProfile() {
    return this.request("/profile/", {
      method: "GET",
    });
  }

  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  setUser(user) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  getUser() {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  removeUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }
  }

  isAuthenticated() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isLoggedIn") === "true" || !!this.getToken();
    }
    return false;
  }
}

const api = new ApiService();
export default api;
