# DIACS Validator (Sepolia + IPFS)

DIACS Validator is a static web app for issuing, revoking, and publicly verifying academic certificates.

It supports:
- **Real mode**: Ethereum Sepolia + IPFS (Pinata API)
- **Demo mode**: local browser storage fallback (no wallet/API secrets required)

## Project Structure

- `index.html` – combined control + verification page
- `college.html` – issuer flow (metadata/file upload to IPFS, issue, revoke)
- `public.html` – public verification portal
- `manager.html` – owner analytics/logs view
- `styles.css` – shared UI styles
- `app-config.js` – runtime configuration + demo/IPFS helper logic

## Prerequisites

For real blockchain use:
- MetaMask wallet
- Sepolia ETH for gas
- Deployed certificate contract on Sepolia compatible with:
  - `issueCertificate(bytes32,string)`
  - `revokeCertificate(bytes32)`
  - `verifyCertificate(bytes32)`
  - `owner()`
- Optional Pinata JWT token for direct IPFS pinning from the UI

## Configure Runtime Values

Update `app-config.js` defaults via `window.DIACS_CONFIG` in any HTML page **before** `app-config.js` is loaded, or edit the default object in `app-config.js`.

Main configuration fields:

- `contract.address` (string): Sepolia contract address
- `contract.abi` (array): contract ABI (defaults to built-in expected ABI)
- `demoMode` (boolean): enables local fallback when chain/IPFS credentials are absent
- `sepoliaChainId` / `sepoliaRpcUrl` / `blockExplorerUrl`
- `ipfs.pinataJwt` (string): optional, for Pinata uploads
- `ipfs.pinJsonEndpoint` / `ipfs.pinFileEndpoint`
- `ipfsGatewayBase`

> Never commit private keys or seed phrases. This app does not require them.

## Run Locally

Because this is a static app, use any simple HTTP server from the repo root:

```bash
cd /home/runner/work/Diacs-remastered/Diacs-remastered
python3 -m http.server 8080
```

Then open:
- `http://localhost:8080/index.html`
- `http://localhost:8080/college.html`
- `http://localhost:8080/public.html`
- `http://localhost:8080/manager.html`

## Usage Flows

### 1) Issuer / College Flow (`college.html`)
1. Connect wallet (owner wallet for real on-chain issue/revoke).
2. Fill student details and generate metadata JSON.
3. (Optional) Upload certificate file to IPFS.
4. Pin metadata JSON to IPFS to get CID.
5. Issue certificate on-chain (real mode) or local demo store (demo mode).
6. Revoke certificates from same page when needed.

### 2) Public Verification (`public.html`)
1. Enter Certificate ID.
2. App verifies from Sepolia when contract is configured.
3. If chain check is unavailable, app falls back to demo/local records.
4. Revoked certificates are clearly marked invalid.

### 3) Manager (`manager.html`)
- Reads issue/revoke events, displays history/analytics, supports owner transfer/revoke.
- Requires configured contract address and Sepolia connectivity.

## Demo Mode Behavior

When `demoMode: true` and real services are unavailable:
- Issuance/revocation writes to browser localStorage
- Public verification reads from localStorage
- IPFS pin actions generate demo CIDs and keep payloads locally

This allows UI/UX and logic validation without secrets.

## Validation Notes

No automated test/build framework is included in this repository.
Validation is done via:
- static server run
- browser interaction checks for connect/issue/revoke/verify flows
- console error checks

## Security Notes

- Do **not** hard-code private keys.
- Keep API tokens out of source control.
- Use only wallet-based signing for blockchain transactions.
