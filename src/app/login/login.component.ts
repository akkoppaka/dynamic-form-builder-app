import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  selectedRole: 'admin' | 'user' = 'user';
  constructor(private authService: AuthService, private router: Router) { }

  login() {
    this.authService.setRole(this.selectedRole);
    this.router.navigate(['/forms']);
  }

  onRoleChange(role: 'admin' | 'user') {
    this.selectedRole = role;
  }
}
