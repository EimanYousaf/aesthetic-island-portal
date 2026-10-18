# Aesthetic Island Aesthetic Review & Recommendation Portal
https://eimanyousaf.github.io/aesthetic-island-portal/frontend/

## Project Overview

This project is being developed for CISC 4900 at Brooklyn College during Fall 2026.

The Aesthetic Island Aesthetic Review & Recommendation Portal is a web-based application designed to help clients submit their aesthetic or skincare concerns for review by a nurse practitioner.

Clients will be able to provide their contact information, explain their concerns, and upload photos. A nurse practitioner will then review their submission and provide professional recommendations, treatment information, and pricing when appropriate.

The purpose of this project is to make the consultation process easier, more organized, and more convenient for both clients and staff.

## Problem Statement

At Aesthetic Island, clients often contact the office through phone calls or text messages to ask questions about skincare products, treatments, pricing, or specific aesthetic concerns.

Since staff and nurse practitioners may be busy assisting other clients or performing procedures, it can be difficult to keep track of every request.

Client information, photos, and questions may also be spread across different messages.

This project aims to create one organized system where clients can submit their information and a nurse practitioner can review and respond to their concerns.

## Target Users

### 1. Clients

Clients need a simple way to:

- Enter their name and phone number.
- Explain their aesthetic or skincare concerns.
- Upload a photo of the area they are concerned about.
- Submit their information for professional review.
- Receive recommendations and treatment information.

### 2. Nurse Practitioner

The nurse practitioner needs a way to:

- View client submissions.
- Review uploaded photos and concerns.
- Organize incoming requests.
- Provide professional recommendations.
- Share treatment information and pricing.
- Update the status of a submission.

## Main Features

### Client Submission Form — Initial Version Built

The first version of the client form includes:

- Full name input
- Phone number input
- Concern or desired treatment text area
- Photo upload field
- Submit for Review button

The form has been created using HTML and styled with CSS.

### Basic Form Validation — Added

The form currently includes:

- Required input fields
- Image file selection using `accept="image/*"`
- Browser validation for required information

Additional validation will be needed when the backend is developed.

### JavaScript Interaction — Initial Version Added

Basic JavaScript has been added to the form.

When a client submits the form, JavaScript prevents the page from refreshing and displays a simple submission message.

At this stage, the information is not saved to a database.

### Nurse Practitioner Review Portal — Planned

A future version will include:

- Secure nurse practitioner login
- A page displaying client submissions
- Client photo and concern review
- Recommendation and notes fields
- Treatment and pricing information
- Submission status updates

## Functional Requirements

The planned application should allow:

1. Clients to enter their contact information.
2. Clients to describe their concerns.
3. Clients to upload a photo.
4. Clients to submit a request.
5. The system to store submitted information securely.
6. Authorized nurse practitioners to view submissions.
7. Nurse practitioners to add
