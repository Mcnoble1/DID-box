# DID-Box
It is a personal data storage solution, manager and aggregator.

## Inspiration
Dropbox - with Superpowers.
The decentralized personal data vault/manager/aggregator application aims to solve the problem of centralized control and ownership of personal data. Currently, individuals have limited control over their data as it is stored in centralized databases owned by organizations. This lack of control poses risks such as data breaches, privacy violations, and data manipulation without consent.

## Key Features:
- The application provides a unified interface for users to store, aggregate, and manage their data (personal, education, health, media  etc) which can then be shared across different platforms such as social media platforms, healthcare providers, financial institutions based on permissions. This eliminates the need for users to navigate multiple platforms and manage separate accounts for each data source. Instead, they can have a single application where they can securely store, organize, and access their data.


## Challenges we ran into
Published date for letters as it only works for records sent to others (making records public), but TBD team said tags would be able to fix that.

## Accomplishments that we're proud of
- Users get assigned their DIDs
- Users get their personal DWN
- Users can create, edit, share and delete personal record
- Users can create, edit, share and delete educational record
- Users can create, edit, share and delete health record
- Users can create, edit, share and delete professional record
- Users can add, edit, share and delete social media accounts
- Users can add images and files to their DWNs 
- Users can write future letters to themselves
- Users can chat with friends

## What's next for DID-Box
- Implement self-signed verifiable credentials whereby users details are converted to VCs upon creation 
- Make the app a PWA/DWA that can be installed on mobile devices.
- Users can upload record documents and details get extracted from the pictures or documents using OCR
- Users can add other records to their DWN (financial, reviews, entertainment, etc)
- Users can port their data to other application through efficient interoperability and schemas

## Installation

You'll need to install Node.js >=v14.16+ (Recommended Version) (NPM comes along with it) and TailAdmin uses **Vite** for frontend tooling, to perform installation and building production version, please follow these steps from below:

- Use the terminal and navigate to the project Task-Manager root.

- Then run : <code>npm install</code>

- Then run : <code>npm run dev</code>

Now, in the browser go to <code>localhost:5173</code>

**For Production Build**
Run : <code>npm run build</code>

Default build output directory: /dist

This command will generate a dist as build folder in the root of your template that you can upload to your server.

![download](https://github.com/Mcnoble1/DID-box/assets/40045755/7f69bea6-c934-4358-aa95-54e5a3ca6855)
![images](https://github.com/Mcnoble1/DID-box/assets/40045755/9424c2a8-7b53-4b4a-be1e-27d813ad9e52)

