# dynamic-form-builder-app

**Overview**

This Angular project includes two main components:

  1. Login Component
  
    Provides a simple user login screen where a user selects a role (Admin or User).

        On login, the selected role is saved using an AuthService and the user is routed to the form builder page.

        Login page is styled with Angular Material card and components, centered on the screen.

  2. Form Builder Component
    
    A drag-and-drop dynamic form builder power by Angular CDK and reactive forms.

        Admin users can add, edit, reorder, and delete form fields.

        Users can only view and fill out the generated form.

        Supports multiple field types (text, textarea, select, checkbox, radio, date).

        Form validation rules are configurable per field.

        Form submission sends data to a mock API and displays submitted results.

**Roles and Permissions**

    Admin
    Can drag and drop fields, edit and delete them, save templates.

    User
    Can drag and drop fields, fill inputs, and submit data.

Role enforcement is implemented via AuthService, AuthGuard, and UI conditionals (canEdit() checks).

**Code Highlights**

  1. Login Component

    Interface for role selection and login.

    Navigation to form builder after login.

    Role stored in AuthService.

  2. Form Builder Component

    Uses FormArray to manage dynamic fields.

    DragDrop connected lists for palette and form canvas.

    Dynamic reactive form controls with validators.

    Field editing panel with save/cancel.

    Delete buttons on fields with confirmation.

    Role-based UI and action authorization.

**Setup and Usage**
  Installation

    bash
    npm install

  Run Development Server

    bash
    ng serve

Open http://localhost:4200 to use the app.


