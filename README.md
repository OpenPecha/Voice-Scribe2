# VoiceScribe

## Table Of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Configuration](#configuration)
   - [Running the Application](#running-the-application)
4. [Environment Variables](#environment-variables)


## Overview
VoiceScribe enables:
- Annotators to record audio, submit transcripts, and view their submission history.
- Reviewers to validate and provide feedback on transcripts submitted by annotators.


## Prerequisites
1. Node.js:
You must have Node.js installed on your system. This application is tested with Node.js v16+.
You can download it from [nodejs.org](https://nodejs.org/).
2. PostgreSQL:
Ensure that you have the PostgreSQL database up and running. You'll need the database connection information to configure the application.
3. Remix Framework:
This application is built using the Remix framework.
4. AWS Account:
Ensure you have an active AWS account with an S3 bucket set up for storing audio files.


## Getting Started
### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/OpenPecha/Voice-Scribe.git
   ```
2. Change into the project directory
   ```bash
   cd Voice-Scribe
   ```
3. Install the dependencies
   ```bash
   npm install
   ```

### Configuration
1. Create a `.env` file in the root of the project and add the following environment variables:

   ```env
   # PostgreSQL Database Configuration
   DATABASE_URL=your-db-connection-string

   # S3 Bucket Configuration
   AWS_ACCESS_KEY_ID=your-aws-access-key-id
   AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
   AWS_REGION=your-aws-region
   AWS_BUCKET_NAME=your-s3-bucket-name
   ```

   Replace `your-db-connection-string`, `your-aws-access-key-id`, `your-aws-secret-access-key`, `your-aws-region`, `your-s3-bucket-name` with your specific database and s3 bucket credentials.

2. You can also modify other configuration options in the `.env` file as needed for your application.

### Running the Application
- Start the development server
  ```bash
  npm run dev
  ```

## Environment Variables
1. Here are the environment variables required for the web:
   - DATABASE_URL: The hostname or IP address of your PostgreSQL database server.connection string provided from the database eg. formatted:postgresql://[database-user]:[database-password]@[database-host]/[database-name]?schema=public
   - AWS_ACCESS_KEY_ID: Your AWS Access Key.
   - AWS_SECRET_ACCESS_KEY: Your AWS Secret Access Key.
   - AWS_REGION: The AWS region where your S3 bucket is located.
   - AWS_BUCKET_NAME: The name of your S3 bucket.
