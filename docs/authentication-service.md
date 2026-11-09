# Authentication Service Documentation

## 1. Introduction

The Authentication Service is responsible for managing user authentication and user-related operations in the Drawing Game application.

It is developed using **NestJS**, a Node.js framework that provides a modular and maintainable architecture.

The service helps ensure that users can access the application securely and that user information is properly managed.

## 2. Technologies Used

The Authentication Service is based on the following technologies, depending on the project's implementation:

- **Node.js:** JavaScript runtime environment.
- **NestJS:** Backend framework used to build the authentication API.
- **TypeScript:** Programming language used for backend development.
- **Database:** Used to store user information.
- **JWT (JSON Web Token):** Used for token-based authentication, if implemented.
- **Password Hashing:** Used to protect user passwords, if implemented.

## 3. Authentication Functionality

### 3.1 User Registration

User registration allows new users to create an account in the Drawing Game application.

The registration process generally includes:

1. Receiving user information from the client.
2. Validating the submitted information.
3. Checking whether the user already exists.
4. Protecting the password before storage.
5. Saving the new user in the database.
6. Returning an appropriate response.

### 3.2 User Login

The login functionality allows registered users to access their accounts.

The process generally includes:

1. Receiving the user's login credentials.
2. Searching for the user in the database.
3. Verifying the submitted password.
4. Authenticating the user if the credentials are valid.
5. Returning an authentication response or token, depending on the implementation.

### 3.3 Password Security

Passwords must be protected and should never be stored as plain text.

If password hashing is implemented, the service uses a hashing mechanism to protect stored credentials.

## 4. User Management

The User Management functionality handles user-related operations.

Depending on the available implementation, these operations may include:

- Creating user accounts.
- Retrieving user information.
- Updating user profiles.
- Searching for users.
- Deleting user accounts.

These operations allow the application to manage player information.

## 5. JWT Authentication

If JWT authentication is implemented, the service uses JSON Web Tokens to identify authenticated users.

The general process is:

1. A user successfully logs in.
2. The authentication service generates a token.
3. The client receives and stores the token according to the application's security design.
4. The client includes the token in subsequent protected requests.
5. The backend validates the token before granting access.

## 6. API Endpoints

The Authentication Service exposes API endpoints used by the frontend and other application components.

The following table is a template. Replace the example routes with the actual routes defined in the NestJS controllers.

| HTTP Method | Endpoint                  | Description                 |
| ----------- | ------------------------- | --------------------------- |
| POST        | Actual registration route | Register a new user         |
| POST        | Actual login route        | Authenticate a user         |
| GET         | Actual user route         | Retrieve user information   |
| PUT/PATCH   | Actual update route       | Update user information     |
| DELETE      | Actual delete route       | Delete a user, if supported |

## 7. Security and Validation

The service may use several security mechanisms depending on its implementation:

- Input validation to prevent invalid data.
- Password hashing to protect credentials.
- JWT verification to authenticate users.
- Authentication guards to protect restricted routes.
- Authorization checks to control access to specific operations.
- Appropriate error responses for invalid credentials and unauthorized requests.

## 8. Communication with Other Services

The Authentication Service is part of the Drawing Game backend architecture.

It is responsible for user authentication and identity management.

Other application services can rely on authenticated user information when handling game-related operations.

## 9. Conclusion

The NestJS Authentication Service plays an important role in the Drawing Game application.

It manages user authentication and user-related functionality while contributing to the security of the application.

Its modular architecture makes it easier to maintain, extend, and integrate with the other backend services.
