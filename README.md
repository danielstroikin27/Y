# 🖼️ Y - Image Sharing App


## Description

**Y** is a modern image-sharing application that allows users to upload images and generate temporary links for sharing. These links are designed to expire after a user-defined period, ensuring secure and temporary access. The system is built with scalability and production deployment in mind. 🐱



## Objective

The goal of the project is to deliver the following functionality:

- **Image Upload:** Allow users to upload images.
- **Temporary Links:** Generate shareable links with user-defined expiration times.
- **Image Expiry:** Automatically delete expired images to optimize storage costs.
- **REST API:** Provide endpoints for uploading and serving images.
- **Frontend Interface:** Build a user-friendly interface for uploading images, setting expiration times, and sharing links.
- **Robustness:** Include unit tests for critical features, especially image expiration logic.

---

## Considerations and System Overview

### 🛠️ Language and Frameworks

- **Backend:** I chose **NestJS** because it provides a robust and modular architecture. Its built-in support for dependency injection, middleware, and testing makes it ideal for creating scalable production-ready applications.
- **Frontend:** The frontend will be built with **React**, providing a fast and interactive user experience.
- **TypeScript:** Ensures type safety across the stack.

---

### 🗄️ Database

The database of choice is **PostgreSQL** due to:

- Strong support for structured data.
- Reliable performance for managing expiration timestamps.
- Compatibility with horizontal scaling.

### 🗂️ Object Storage

The app uses **MinIO** as the object storage solution for managing image files because of:

- S3 compatibility.
- Scalability and high performance.
- Easy integration with NestJS for file uploads.

---

## Endpoints

### **Backend API**

#### `POST /v1/images`
- **Description:** Handles the upload of a single image.
- **Request Body:** 
  - File: Image file to be uploaded.
  - Expiration: Timestamp for when the image should expire.
- **Response:**
  - URL: Shareable link for the uploaded image.

#### `GET /v1/images/:imageID`
- **Description:** Serves the requested image if it exists and has not expired.
- **Response:**
  - Image file: Returns the image content.
  - **Error:** 404 if the image does not exist or has expired.

## Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL
- MinIO Server

Or simply

- Docker

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/danielstroikin27/Y
```

2. **Install dependencies**

```bash
cd Y
docker compose up
```

3. **Access the application**

Open your browser and navigate to `http://localhost:3000` to access the application.

