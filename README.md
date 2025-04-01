# README for Code Editor Project

## Overview
This README provides guidance for setting up, configuring, and using the Notifications microservice. This communicates with the other services and receives REST requests to send notifications to users.

## Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)

## Installation
```bash
# Clone the repository
git clone https://github.com/ChamberFellas/notifications.git

# Navigate to the project directory
cd notifications

# Install dependencies
yarn
```

## Configuration
1. Create a `.env` file in the root directory
2. Add your configuration variables:
   ```
   MONGO_URI=mongodb://localhost:27017/notifications
   USERS_URL=http://localhost:3001/users
   BILLS_URL=http://localhost:3002/bills
   ```

# Build with Docker

docker build -t notifications .

docker run -d -p 3000:3000 notifications

## Usage
```bash

# Build for production
yarn build

# Start the production server
yarn start
```

Visit `http://localhost:3000` for the endpoints
