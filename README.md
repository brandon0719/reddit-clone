# Reddit Clone

A full-stack web application that replicates core features of Reddit, allowing users to create posts, join communities, comment, and upvote or downvote posts. This project is built using modern web development technologies, including React, Node.js, Express, MongoDB, and JWT for authentication.

## Features

- **Community Management**: Create and join communities.
- **Post Creation**: Add and manage posts within communities.
- **Comment System**: Threaded comments with reply functionality.
- **Voting System**: Upvote and downvote posts and comments, including unvote functionality.
- **Search System**: Search through posts, comments, and communities based on inputted keyword.
- **User Authentication**: Login, register, and guest access.
- **Profile Page**: Manage personal posts, comments, and communities, allowing editing and deleting of posts.
- **Admin Panel**: Manage users, all posts, communities, and comments, allowing the editing and deleting of all posts.
- **Reputation System**: Users gain or lose reputation based on their voting activity.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Other Tools**: UML design practices

## Installation and Setup

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/brandon0719/reddit-clone.git
   cd reddit-clone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory and add the following:
   ```plaintext
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   PORT=your_port_number
   ```

4. Start the backend server:
   ```bash
   npm run server
   ```

5. Navigate to the `client` directory, install dependencies, and start the frontend:
   ```bash
   cd client
   npm install
   npm start
   ```

## Usage

1. **Log In**:
   - Register or log in using valid credentials.
   - Guest users can browse but have limited permissions (e.g., no voting).

2. **Create Communities**:
   - Click "Create Community" and provide a unique name and description.

3. **Engage with Posts**:
   - Create new posts or browse existing ones within communities.
   - Use the upvote/downvote buttons to express opinions.

4. **Interact with Comments**:
   - Reply to posts or other comments with threaded replies.
   - Vote on comments similarly to posts.

5. **Reputation System**:
   - Gain or lose reputation based on votes you receive on posts and comments.

## UML

