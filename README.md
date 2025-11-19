<div align="center">
  <a href="https://codecapsules.io/">
    <img src="https://cdn.prod.website-files.com/67ceb2cb686dbb71573b4e01/67cebcb49209deccb991799d_Code%20Capsules%20-%20Logo%201.svg" alt="Code Capsules Logo" width="400"/>
  </a>
</div>
<br/>

# Code Capsules Calendar Agent

An Express API that exposes a Calendar AI Agent. Built with TypeScript and LangChain with Google Calendar integration.

## Overview

This API provides a LangChain-based Calendar Agent with RAG (Retrieval-Augmented Generation) capabilities. The agent can manage Google Calendar events through natural language conversations, supporting event creation, retrieval, and authorization. It allows for the use of a Redis vector store and supports streaming responses for real-time chat interactions.

### Key topics:

- [Features](#features)
- [Setting up with Code Capsules and Google Calendar](#setup)
- [Setting up a Vector Store](#vector-store-setup-redis)
- [Customisation](#customization)

## Features

### Natural Language Calendar Management

The agent understands and processes natural language requests for calendar operations:

- **Event Creation**: Add events with natural language descriptions
- **Event Retrieval**: Query events by date range using natural language
- **Date Recognition**: "tomorrow", "next week", "this weekend", "December 5"
- **Time Handling**: Defaults to midnight (00:00) if no time specified

### RAG (Retrieval-Augmented Generation)

Add contextual knowledge to the agent via:

- Plain text input
- URLs (automatically crawled and processed)
- Documents are embedded and stored in Redis for semantic search

### Streaming Responses

Real-time streaming chat responses using Server-Sent Events (SSE) for better user experience.

## Integration

### Code Capsules Integration

The following endpoints enable interaction from the Code Capsules Agent Capsule UI:

- `POST /api/chat/message/stream` - Stream chat responses
- `GET /api/chat/history` - Retrieve chat history

**Authentication**: These endpoints use a lightweight security model:

- Headers: `X-CC-API-KEY`, `X-CC-EMAIL`
- Environment: `INTERNAL_API_KEY`

The API validates `X-CC-API-KEY` against `INTERNAL_API_KEY` and uses `X-CC-EMAIL` as the user identifier. These are not required for the agent to function but enable Code Capsules chatbot integration.

## Setup

### Link Repo to an Agent Capsule in Code Capsules

To create your own Agent Capsule in Code Capsules with this functionaity:

1. [Create a new repo from this template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template)
2. Create an AI Agent Capsule
3. Link your new repo to the capsule
4. Mark the capsule as 'using a Code Capsules template' and enter your provider, model, and API key details
5. Finish the setup and wait for the capsule to build. Note that your calendar integration will not work until you have completed the [Configure Google Calendar](#configure-google-calendar) steps below

### Configure Google Calendar

To set up Google Calendar integration:

1. Follow the instructions [here](https://developers.google.com/workspace/calendar/api/quickstart/js) to set up your Google cloud project and enable the Google Calendar API. Ensure to keep your Web Application client secret and key somewhere safe
2. Ensure that you have set up a redirect URI under your new [Client](https://console.cloud.google.com/auth/clients) in the Google Cloud Console. These can be found under the **Authorised redirect URIs** header. The redirect URI should be as follows: {your_agent_capsule_public_url}/api/calendar/auth/callback. For example 'https://agent-capsule-123.ovh-test.ccdns.co/api/calendar/auth/callback'
3. For testing purposes, be sure to add a valid email under the [Audience](https://console.cloud.google.com/auth/audience) of your auth. This will be the Google Calendar email account
3. Edit your Agent Capsule environment variables and add the following, replacing the values where necessary:

```bash
GOOGLE_CALENDAR_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
```

4. Use the 'Chat' tab to talk with your new agent. 
  - For testing purposes, an "authorisation" tool exists for help with authorising access to Google Calender
  - To initiate, ask your agent "Please can I authorise my calendar". It will return with a URL
  - After authorising, you can ask to "add an event" or "get a list of events from dates x to y", which will use the necessary [tools](#agent-tools)
5. It is important to note that this codebases uses a very simple in-memory cache for the Google Calendar access tokens. Production areas should use a form of [persistent storage](https://docs.codecapsules.io/database)

## Vector Store Setup (Redis)

By default, Code Capsules Agent templates cater for vector store logic using a Redis instance. This is NOT recommended for production as the instance data is not permanent - if the Redis instance restarts, it will lose all vector data.

### Via Code Capsules

To link a vector store through Code Capsules:

1. Create a new Redis Capsule
2. Go to the **Details** tab of your new Redis Capsule
3. Copy the **Connection string**
4. Go to the **Config** tab of your Agent Capsule
5. Edit the environment variables using **Text Editor** and add the following:

```bash
REDIS_URL=your_copied_connection_string
```

6. Save the changed environment variables
7. Wait for the capsule to restart. Once complete, your Agent Capsule will now use this Redis Capsule as its vector store.

> [!WARNING]
>
> **Please note:** Agent Capsule templates have been built with the capabilities of using either a Redis or in-memory vector store. When using the in-memory option (i.e. no Redis Capsule is linked), it is recommended to scale the Agent Capsule to the following in order to ensure optimal performance:
>
> - CPU 25%
> - Memory 1GB
> - Replicas 1
>
> To do this, visit the Agent Capsule [Scale](https://codecapsules.io/docs/agent-capsule/scale) page.

### Via local/other implementations

To link a vector store:

1. Start a new Redis instance using Docker.
2. Add the following as an environment variable to your agent:

```bash
REDIS_URL=your_redis_instance_url
```

3. Your Agent Capsule will now use this Redis Capsule as its vector store.

## Architecture

- **Database**: None (stateless)
- **Vector Store**: Redis (required for RAG functionality)
- **LLM Provider**: Google Generative AI (configurable via environment variables)
- **Calendar Integration**: Google Calendar API with OAuth 2.0

## Agent Tools

The Calendar Agent has access to the following tools:

### 1. **retrieve**

- **Purpose**: RAG (Retrieval-Augmented Generation) tool for retrieving contextual information
- **Description**: Performs similarity search in the Redis vector store to find relevant documents
- **Input**: Query string
- **Output**: Retrieved documents with source metadata and content

### 2. **getDate**

- **Purpose**: Get the current date and time
- **Description**: Returns today's date in ISO format to help the agent interpret relative date expressions
- **Input**: None
- **Output**: Current date/time in ISO format

### 3. **getCalendarEvents**

- **Purpose**: Retrieve user's Google Calendar events
- **Description**: Fetches events from the user's calendar within a specified date range
- **Input**:
  - `startDate` (string): Start date for event retrieval (supports natural language like "today", "tomorrow", "next week")
  - `endDate` (string): End date for event retrieval
- **Output**: List of events with summary, start time, and end time

### 4. **addCalendarEvent**

- **Purpose**: Create a new event in the user's Google Calendar
- **Description**: Adds a new calendar event with specified details
- **Input**:
  - `summary` (string): Event title/summary
  - `description` (string): Event description
  - `start` (string): Start date and time in ISO format
  - `end` (string): End date and time in ISO format
- **Output**: Confirmation message with event details

### 5. **requestCalendarAuth**

- **Purpose**: Initiate Google Calendar authorization
- **Description**: Generates an OAuth URL for the user to authorize calendar access
- **Input**: None (uses user ID from config)
- **Output**: Authorization URL for the user to visit

## Installation

```bash
npm install
```

## Environment Variables

For local testing, create a `.env` file:

```bash
# App Configuration
PORT=3000
APP_URL=localhost:3000
APP_NAME=my-agent
DEV_MODE=false

# Security
# This is generated by Code Capsules on creation of the Agent capsule
INTERNAL_API_KEY=your-secret-key

# LLM Provider (Required)
PROVIDER_API_KEY=your-google-api-key
PROVIDER_NAME=google-genai
PROVIDER_MODEL=gemini-2.0-flash

# Google Calendar Integration (Required for calendar features)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/auth/callback

# Vector Store (Optional, but recommended)
REDIS_URL=redis://localhost:6379

# Host documentation (Optional)
SHOW_DOCUMENTATION=true

```

## Scripts

To run

```bash
npm start
```

## API Endpoints

### Chat

- `POST /api/chat/message` - Send a message (non-streaming)

  - **Body**: `{ message: string }`
  - **Response**: Complete chat response
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

- `POST /api/chat/message/stream` - Send a message (SSE streaming)

  - **Body**: `{ message: string }`
  - **Response**: Server-Sent Events stream
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

- `GET /api/chat/history` - Get chat history for user
  - **Response**: Array of previous messages
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

### Context (RAG)

- `POST /api/context/text` - Add text context to vector store

  - **Body**: `{ text: string }`
  - **Response**: Confirmation of context addition
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

- `POST /api/context/url` - Add context from URL to vector store
  - **Body**: `{ url: string }`
  - **Response**: Confirmation of context addition
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

### Calendar

- `GET /api/calendar/auth` - Get Google Calendar authorization URL

  - **Response**: `{ url: string }`
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

- `GET /api/calendar/auth/callback` - OAuth callback endpoint for Google Calendar

  - **Query Params**: `code` (from Google), `state` (user ID)
  - **Response**: `{ message: "Token saved" }`
  - **Auth**: Not required (OAuth flow)

- `POST /api/rag/text` - Add text context to vector store

  - **Body**: `{ text: string }`
  - **Response**: Confirmation of context addition
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

- `POST /api/rag/url` - Add context from URL to vector store
  - **Body**: `{ url: string }`
  - **Response**: Confirmation of context addition
  - **Auth**: Required (`X-CC-API-KEY`, `X-CC-EMAIL`)

### Documentation

- `GET /api-docs` - Swagger UI (public, no auth required)
- `GET /swagger.json` - Swagger JSON (public, no auth required)

## Customization

### Change Auth

Edit `src/middleware/auth-user.ts` to change API authorization. By default, this uses the pre-described headers (`X-CC-API-KEY`, `X-CC-EMAIL`) and API key validation against `INTERNAL_API_KEY`.

### Change LLM Provider and/or Model

When using Code Capsules, changing the provider, model, and API key is easy via the Agent Capsule 'Config' page. For other implementations, edit the `PROVIDER_NAME`, `PROVIDER_MODEL`, and `PROVIDER_API_KEY` environment variables according to your requirements.

Supported providers include:

- `google-genai` (default)
- `openai`
- `anthropic`
- `mistralai`
- `groq`
- `cohere`
- `cerebras`
- `xai`

### Modify System Prompt

Update `src/modules/agent/config/system-prompt.ts` to change agent behavior, personality, or instructions. The current prompt is configured for calendar management with natural language date parsing. When using Code Capsules, be sure to ensure that the Agent Capsule is rebuilt and deployed to see your changes.

### Add or Remove Tools

**Add New Tools:**

1. Create a new tool class in `src/modules/agent/tools/implementations/` extending `BaseTool`
2. Implement the tool using LangChain's `tool()` function
3. Register the tool in `src/modules/agent/tools/tools-manager.ts`

**Remove Tools:**

1. Remove the tool import from `src/modules/agent/tools/implementations/index.ts`
2. Remove the tool registration from `src/modules/agent/tools/tools-manager.ts`

When using Code Capsules, ensure that the Agent Capsule is rebuild and deployed to see your changes.

### Change Vector Store

The RAG module currently uses Redis or an in-memory vector store. To switch to another vector store (Pinecone, Weaviate, etc.), modify `src/modules/rag/services/vector-store.service.ts`.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5
- **LLM Framework**: LangChain
- **LLM Provider**: Google Generative AI (configurable)
- **Vector Store**: Redis (for RAG)
- **Calendar Integration**: Google Calendar API with OAuth 2.0
- **LLM Provider**: Google Generative AI
- **Vector Store**: Redis (or Memory for fallback)
- **Documentation**: Swagger/OpenAPI

## Development Notes

- CORS is enabled for all origins (`*`)
- Request size limit: 10MB
- All `/api/*` routes require authentication (except `/api/calendar/auth/callback` and `/api-docs`)
- Swagger docs are publicly accessible at `/api-docs`
- Calendar tokens are stored in memory (consider persistent storage for production)
- The agent uses natural language date parsing for calendar operations (e.g., "tomorrow", "next week")
