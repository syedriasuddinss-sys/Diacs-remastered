# CertChain — DIACS Validator 🎓

A decentralized, tamper-proof academic credentialing system anchored on the Ethereum blockchain. CertChain empowers educational institutions to issue certificates securely while allowing third-party verifiers to instantly authenticate them without relying on a centralized database.

## 🚀 Key Features

*   **Blockchain Issuance:** Certificates are minted as smart contracts on the **Sepolia Testnet**, ensuring immutability and cryptographic security.
*   **Decentralized Storage:** Document metadata and files are stored permanently via **IPFS** (InterPlanetary File System).
*   **Role-Based Access Control:** 
    *   **Admins (Owners):** Can issue new certificates and revoke invalid ones.
    *   **Colleges:** Can update student enrollment statuses (Active, Suspended, Graduated, On Leave).
    *   **Public Verifiers:** Anyone can verify a certificate ID—no crypto wallet required!
*   **Dynamic UI:** Modern interface featuring Dark, Light, and Transparent theme modes.

## 🛠️ Technology Stack

*   **Frontend:** HTML5, CSS3, Vanilla JavaScript
*   **Web3 Integration:** ethers.js (v5), MetaMask
*   **Blockchain:** Solidity (Ethereum Smart Contracts), Sepolia Testnet
*   **Storage:** IPFS (via Pinata)

## 💡 How it Works

1.  **Issue:** The college connects their MetaMask wallet and inputs a unique Certificate ID along with the IPFS hash (CID) of the student's document.
2.  **Store:** The transaction is confirmed on the Sepolia testnet, anchoring the credential forever.
3.  **Verify:** Employers or institutions enter the Certificate ID into the public portal. The app queries the blockchain and instantly returns the document's validity and issuance date.
