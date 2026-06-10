# API Security Scanner Architecture

Version: 0.8.x

Architecture Level:
Production-Oriented Multi-Layer API Security Assessment Platform

Status:
Active Development

---

# 1. Project Overview

API Security Scanner is an enterprise-grade security assessment platform designed to discover, analyze, classify, prioritize and report API security weaknesses, transport security issues, configuration risks and technology exposure.

Core Objectives:

* API Security Assessment
* Vulnerability Detection
* Security Posture Monitoring
* Risk Classification
* Compliance Visibility
* Security Reporting
* Security Analytics
* AI-Assisted Security Recommendations

Current Platform Coverage:

* Authentication & Authorization
* Security Header Analysis
* SSL/TLS Validation
* CORS Analysis
* Cookie Security Analysis
* Server Disclosure Detection
* Technology Detection
* Vulnerability Intelligence Layer
* Risk Classification
* Security Scoring
* Dashboard Analytics
* Vulnerability Reporting

---

# 2. Technology Stack

Backend:

* Node.js
* Express.js

Frontend:

* React.js
* Vite
* Axios
* Recharts
* Lucide React
* Framer Motion

Database:

* MongoDB

ODM:

* Mongoose

Authentication:

* JWT
* Refresh Tokens

---

# 3. Authentication & Authorization

## Access Token

Type:
JWT

Expiry:
15 Minutes

Purpose:

* API Authentication
* Protected Route Access

---

## Refresh Token

Type:
JWT

Expiry:
7 Days

Purpose:

* Access Token Renewal

Storage:
bcrypt-hashed before persistence

Status:
Implemented

---

## Logout Strategy

Routes:

POST /api/auth/logout

POST /api/auth/logout-all

Status:
Implemented

---

## Authorization

### User

Permissions:

* Create Scans
* View Own Scans
* View Own Reports
* View Own Dashboard

### Admin

Permissions:

* Admin Routes
* Platform Management
* Future Analytics Controls

Status:
Implemented

---

# 4. Module Architecture

## auth

Responsibilities:

* Registration
* Login
* JWT Authentication
* Refresh Tokens
* Logout
* Role Management

Status:
Completed

---

## scans

Responsibilities:

* Create Scans
* Execute Scanners
* Store Results
* Calculate Security Score
* Track Lifecycle

Status:
Completed

---

## vulnerabilities

Responsibilities:

* Vulnerability Metadata
* CWE Mapping
* OWASP Mapping
* Recommendation Mapping
* Severity Classification
* Finding Standardization

Architecture:

vulnerability.catalog.js
↓
vulnerability.factory.js
↓
Scanner Modules

Status:
Completed

---

## dashboard

Responsibilities:

* Security Analytics
* Vulnerability Analytics
* Risk Distribution
* Security Trends
* User Security Visibility

Status:
Backend Implemented
Frontend In Progress

---

## reports

Responsibilities:

* Technical Reports
* Executive Reports
* Security Narratives
* Recommendations

Components:

* Report Model
* Report Controller
* Report Service
* Report Generator
* Report Narrative Generator

Status:
Partially Implemented

Remaining:

* PDF Export
* Downloadable Reports
* Report Sharing

---

## risk-engine

Responsibilities:

* Security Score Calculation
* Grade Assignment
* Risk Classification
* Severity Weighting

Status:
Implemented

---

## notifications

Responsibilities:

* OTP Delivery
* Security Alerts
* Email Notifications

Status:
Planned

---

## ai-copilot

Responsibilities:

* Vulnerability Explanation
* Remediation Guidance
* Security Recommendations
* Executive Summaries

Status:
Planned

---

# 5. Vulnerability Intelligence Layer

Purpose:

Centralized management of vulnerability metadata.

Components:

### vulnerability.catalog.js

Stores:

* Title
* Severity
* Description
* Recommendation
* CWE
* OWASP

### vulnerability.factory.js

Responsibilities:

* Standardized Finding Generation
* Metadata Injection
* Severity Classification

Benefits:

* No Hardcoded Metadata
* Centralized Guidance
* Easier Expansion
* Consistent Reporting

Status:
Completed

---

# 6. Scan Engine

Workflow:

User
↓
Submit Target
↓
Create Scan Record
↓
Header Scanner
↓
SSL/TLS Scanner
↓
CORS Scanner
↓
Cookie Scanner
↓
Server Scanner
↓
Technology Scanner
↓
Generate Findings
↓
Risk Classification
↓
Security Score Calculation
↓
Store Results
↓
Generate Report
↓
Return Results

Status:
Implemented

---

# 7. Scanner Coverage

Security Header Scanner

Detects:

* Missing CSP
* Missing HSTS
* Missing X-Frame-Options
* Missing X-Content-Type-Options
* Missing Referrer-Policy

Status:
Completed

---

SSL/TLS Scanner

Detects:

* HTTPS Disabled
* Invalid Certificates
* Expired Certificates
* Handshake Failures
* Missing Certificates

Status:
Completed

---

CORS Scanner

Detects:

* Missing Policies
* Wildcard Origins
* Dangerous Credentials

Status:
Completed

---

Cookie Scanner

Detects:

* Missing Secure
* Missing HttpOnly
* Missing SameSite

Status:
Completed

---

Server Scanner

Detects:

* Server Disclosure
* X-Powered-By Disclosure
* ASP.NET Disclosure

Status:
Completed

---

Technology Scanner

Detects:

* React
* Next.js
* Express
* Apache
* Nginx
* Cloudflare
* PHP
* ASP.NET
* WordPress

Status:
Completed

---

# 8. Vulnerability Detection Workflow

Scanner
↓
Detect Issue
↓
Vulnerability Factory
↓
Catalog Lookup
↓
Generate Finding
↓
Attach Metadata
↓
Return Result

Every Finding Contains:

* Title
* Severity
* Description
* Recommendation
* CWE
* OWASP

Status:
Implemented

---

# 9. Risk Engine

Base Score:
100

Penalties:

* Critical: -25
* High: -20
* Medium: -10
* Low: -5
* Info: 0

Range:
0-100

Grades:

90-100 → A → Low Risk

70-89 → B → Medium Risk

50-69 → C → High Risk

0-49 → D/F → Critical Risk

Status:
Implemented

---

# 10. Database Architecture

## User

Fields:

* name
* email
* passwordHash
* role
* refreshTokens
* lastLogin
* createdAt
* updatedAt

---

## Scan

Fields:

* userId
* targetUrl
* status
* securityScore
* grade
* riskLevel
* vulnerabilities
* startedAt
* completedAt
* createdAt
* updatedAt

---

## Vulnerability

Persistence Strategy:

1. Embedded In Scan
2. Dedicated Collection

Relationship:

Scan (1) → (Many) Vulnerabilities

Status:
Implemented

---

# 11. Dashboard Architecture

Dashboard API:

GET /api/dashboard/stats

Current Analytics:

* Total Scans
* Average Score
* Latest Scans
* Severity Distribution
* Risk Distribution
* Grade Distribution
* Top Findings
* Security Trend
* Activity Timeline
* API Inventory

Frontend Components:

* DashboardPage
* StatCard
* ScanTrendChart
* SeverityChart
* LatestScansTable
* Critical Findings
* Compliance Overview
* Activity Timeline
* AI Copilot

Status:

Backend:
95% Complete

Frontend:
65% Complete

---

# 12. Reporting Architecture

Components:

* Report Model
* Report Controller
* Report Service
* Report Generator
* Report Narrative Generator

Benefits:

* Consistent Reporting
* Executive Summaries
* Technical Detail Preservation
* Remediation Guidance

Status:
Partially Implemented

---

# 13. Ownership Rules

Users Can:

* View Own Data
* View Own Reports
* View Own Scans

Users Cannot:

* Access Other User Data
* Access Admin Resources

Admins Can:

* Access Admin Resources
* Manage Platform Features

---

# 14. API Flow

Register
↓
Login
↓
Access Token
↓
Refresh Token
↓
Create Scan
↓
Run Scanners
↓
Generate Findings
↓
Calculate Score
↓
Store Results
↓
Generate Report
↓
Return Response

---

# 15. Deployment Architecture

Supported Targets:

* Railway
* Render
* AWS EC2
* Azure VM
* DigitalOcean

Current Status:

Backend:
Deployable

Database:
Deployable

Authentication:
Deployable

Scanner Engine:
Deployable

Dashboard API:
Deployable

Frontend:
UI Refinement Remaining

---

# 16. Current Project Status

Completed:

* Authentication
* Authorization
* Scan Management
* Header Scanner
* SSL/TLS Scanner
* CORS Scanner
* Cookie Scanner
* Server Scanner
* Technology Scanner
* Vulnerability Catalog
* Vulnerability Factory
* CWE Mapping
* OWASP Mapping
* Severity Scoring
* Risk Classification
* Dashboard Analytics Backend

In Progress:

* Dashboard UI
* Recent Scans Integration
* Critical Findings Integration
* Compliance Overview
* Activity Timeline
* AI Copilot UI

Pending:

* PDF Reports
* Google OAuth
* Notifications
* Scheduled Scans
* AI Copilot Backend
* Enterprise Features

---

# 17. Current Milestone

Dashboard Completion

Objectives:

* Reference Dashboard Match
* Security Trend Completion
* Vulnerability Distribution Completion
* Critical Findings Completion
* Compliance Overview Completion
* Activity Timeline Completion
* AI Copilot Completion

Status:
Active

---

# 18. Roadmap

Phase 1:
Dashboard Completion

Phase 2:
PDF Reporting System

Phase 3:
Google OAuth

Phase 4:
AI Copilot Backend

Phase 5:
Enterprise Features

Phase 6:
Production Deployment

---

# 19. Production Readiness

Authentication:
100%

Authorization:
100%

Scanner Engine:
100%

Vulnerability Intelligence:
100%

Risk Engine:
100%

Dashboard Backend:
95%

Dashboard Frontend:
65%

Reports:
70%

AI Copilot:
10%

Overall Platform:
~75%

---

# Architecture Maturity

Current State:

Production-Oriented Security Scanner Platform

Architecture Level:

Multi-Layer Security Assessment Platform

Version:

0.8.x
