import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private role: 'admin' | 'user' | null = null;

  setRole(role: 'admin' | 'user') {
    this.role = role;
  }

  getRole(): 'admin' | 'user' | null {
    return this.role;
  }

  isAdmin(): boolean {
    return this.role === 'admin';
  }

  isUser(): boolean {
    return this.role === 'user';
  }

  isLoggedIn(): boolean {
    return this.role !== null;
  }
}
