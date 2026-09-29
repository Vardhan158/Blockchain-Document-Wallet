# Blockchain Document Wallet

A decentralized document verification and wallet ecosystem built on blockchain technology. This platform provides tamper-proof issuance, secure citizen mobile storage, and instant offline/online authority verification of government, educational, and identity credentials.

---

## 📁 Repository Structure

```
.
├── backend/              # Node.js/Express API with Solidity Smart Contracts & IPFS integration
├── BlockChainWallet/     # React Native mobile application for citizens/users
├── Police/               # React Native mobile application for verification officers & police
└── frontend/             # React + Vite web dashboard for document issuers & administration
```

---

## 🚀 Projects Overview

### 1. `backend/`
- **Tech Stack:** Node.js, Express, TypeScript, Ethers.js, Solidity, IPFS
- **Description:** Handles document hashing, IPFS file storage, smart contract interaction, issuer authentication, and verification endpoints.

### 2. `BlockChainWallet/` (Citizen Wallet)
- **Tech Stack:** React Native, TypeScript, Android / iOS
- **Description:** Decentralized mobile wallet allowing citizens to securely store their verified documents, receive newly issued credentials, and generate cryptographic QR codes for on-demand verification.

### 3. `Police/` (Authority Verifier)
- **Tech Stack:** React Native, TypeScript, Camera / QR Scanner
- **Description:** Specialized app for law enforcement and authorized verifiers to scan citizen credential QR codes and validate cryptographic signatures directly against the blockchain.

### 4. `frontend/` (Issuer Portal)
- **Tech Stack:** React, Vite, Tailwind CSS / Styling, Web3
- **Description:** Web-based portal for authorized entities (universities, DMV, government bodies) to issue verifiable credentials directly to citizens.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (>= 18)
- npm or yarn
- Android Studio / Xcode (for React Native apps)
- Ethereum/Polygon RPC / Testnet setup

### Setup Instructions

1. **Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # Configure your environment variables
   npm run build
   npm start
   ```

2. **Citizen Wallet App:**
   ```bash
   cd BlockChainWallet
   npm install
   npm run android  # or npm run ios
   ```

3. **Police Verification App:**
   ```bash
   cd Police
   npm install
   npm run android  # or npm run ios
   ```

4. **Web Portal:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📄 License
This project is licensed under the MIT License.
