# Drawing-Game
Harir mahmoud
Hamadouche Achraf
Elhamer Ayoub

Drawing-Game is a browser-based multiplayer drawing-and-guessing game built using a distributed architecture. The project consists of a React frontend, a Laravel backend responsible for drawing and lobby management, a NestJS service for user management and authentication, and a Node.js game service responsible for game logic and data storage.

The application allows players to join lobbies, participate in games, draw pictures, and guess what other players are drawing. The main workflow starts with lobby entry and game lookup, followed by live game interactions involving drawing, guessing, and round progression.

The React frontend provides the user interface and allows players to interact with the game. The Laravel Drawing Service handles lobby operations and drawing-related events, while communicating with other services through established backend communication paths, including gRPC. The NestJS service manages users and authentication, and the Node.js Game Service handles game logic, player actions, rounds, HTTP operations, and data storage.

Real-time communication allows game events and drawing updates to be distributed to participants in the same room, creating an interactive multiplayer experience.

The project follows a modular, service-oriented architecture, separating frontend interactions, user management, drawing operations, and game logic into independent components. This structure makes the application easier to maintain, extend, and develop.

Main Technologies: React, Laravel, NestJS, Node.js, HTTP, gRPC, and real-time event communication.
