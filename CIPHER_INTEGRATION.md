# Cipher Integration (Local WSL)

**Branch:** `local-cipher`
**Version:** `0.3.1`

This document describes the validation and integration of the Cipher system running on WSL (Windows Subsystem for Linux).

## Overview

The `local-cipher` branch contains adaptations for running Cipher in a WSL environment. This setup allows for local development and testing of the core vector storage and memory agent capabilities.

## Components

### 1. Cipher Core (`src/`)
The main application running on Node.js (default port 3000). It exposes the API endpoints for:
- Message processing (`/api/message`)
- Session management (`/api/sessions`)
- Memory retrieval (`/api/sessions/:id/history`)

### 2. Client Notebook (`test-chinese-question-retrieval.ipynb`)
A Jupyter notebook located in the root of this repository (synced from `../`).
- **Role:** Acts as a client consumer of the Cipher API.
- **Purpose:** Demonstrates specific capabilities, such as Chinese question retrieval and memory persistence.
- **Integration:** Connects to `http://localhost:3000` to send queries and retrieve context.

## Usage

1. **Start the Server:**
   ```bash
   # In the cipher directory
   npm run dev
   ```

2. **Run the Notebook:**
   - Open `test-chinese-question-retrieval.ipynb` in VS Code or Jupyter Lab.
   - Execute cells to interact with the local API.

## Versioning
This integration is currently validated on version **0.3.1**.
