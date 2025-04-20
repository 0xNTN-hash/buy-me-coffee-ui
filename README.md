# Buy Me A Coffee - UI

This is the frontend application for the "Buy Me A Coffee" project. It allows users to connect their Ethereum wallet, send tips, and view messages left by tippers.

## Features

- Connect your Ethereum wallet using MetaMask.
- Send tips to the contract along with a personalized message.
- View the contract's balance in ETH.
- Fetch and display messages (memos) left by tippers.

## Prerequisites

- Node.js (v16 or later recommended)
- MetaMask browser extension

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/0xNTN-hash/buy-me-coffee-ui.git
   cd buy-me-a-coffee/ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Connect your wallet and interact with the application.

## Project Structure

- `src/`
  - `App.tsx`: Main application component.
  - `abi/`: Contains the ABI file for the smart contract.
  - `types/`: TypeScript types and factories for interacting with the smart contract.
  - `public/`: Static assets like `favicon.ico` and `index.html`.

## Smart Contract

The smart contract for this project is located in the [buy-me-coffee-solidity](https://github.com/0xNTN-hash/buy-me-coffee-solidity.git) repository. It is written in Solidity and deployed using Foundry.

## TODO

[] Add unit tests for the frontend components.
[] Implement error handling for failed wallet connections.
[] Improve UI/UX.
[] Add support for multiple wallet providers (e.g., WalletConnect).
[] Integrate a notification system for successful transactions.
