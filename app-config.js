(function () {
  const defaultAbi = [
    {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"certificateId","type":"bytes32"},{"indexed":false,"internalType":"string","name":"ipfsHash","type":"string"},{"indexed":true,"internalType":"address","name":"issuer","type":"address"}],"name":"CertificateIssued","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"certificateId","type":"bytes32"},{"indexed":true,"internalType":"address","name":"revoker","type":"address"}],"name":"CertificateRevoked","type":"event"},
    {"inputs":[{"internalType":"bytes32","name":"_certificateId","type":"bytes32"},{"internalType":"string","name":"_ipfsHash","type":"string"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"_certificateId","type":"bytes32"}],"name":"revokeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"certificates","outputs":[{"internalType":"bytes32","name":"id","type":"bytes32"},{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"uint256","name":"issueDate","type":"uint256"},{"internalType":"bool","name":"isValid","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"_certificateId","type":"bytes32"}],"name":"verifyCertificate","outputs":[{"internalType":"string","name":"ipfsHash","type":"string"},{"internalType":"uint256","name":"issueDate","type":"uint256"},{"internalType":"bool","name":"isValid","type":"bool"}],"stateMutability":"view","type":"function"}
  ];

  const defaults = {
    demoMode: true,
    sepoliaChainId: '0xaa36a7',
    sepoliaRpcUrl: 'https://rpc.sepolia.org',
    blockExplorerUrl: 'https://sepolia.etherscan.io',
    ipfsGatewayBase: 'https://gateway.pinata.cloud/ipfs/',
    contract: {
      address: '',
      abi: defaultAbi
    },
    ipfs: {
      pinataJwt: '',
      pinJsonEndpoint: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      pinFileEndpoint: 'https://api.pinata.cloud/pinning/pinFileToIPFS'
    }
  };

  const userConfig = window.DIACS_CONFIG || {};
  const merged = {
    ...defaults,
    ...userConfig,
    contract: {
      ...defaults.contract,
      ...(userConfig.contract || {})
    },
    ipfs: {
      ...defaults.ipfs,
      ...(userConfig.ipfs || {})
    }
  };

  const storeKey = 'diacs:certificates';
  const ipfsStoreKey = 'diacs:ipfs';

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch (_) { return {}; }
  }

  function writeStore(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function saveCertificateRecord(certificateId, data) {
    const db = readStore(storeKey);
    db[certificateId] = { ...(db[certificateId] || {}), ...data };
    writeStore(storeKey, db);
  }

  function getCertificateRecord(certificateId) {
    return readStore(storeKey)[certificateId] || null;
  }

  function saveIpfsPayload(cid, payload) {
    const db = readStore(ipfsStoreKey);
    db[cid] = payload;
    writeStore(ipfsStoreKey, db);
  }

  function getIpfsPayload(cid) {
    return readStore(ipfsStoreKey)[cid] || null;
  }

  function makeDemoCid(prefix) {
    return `demo-${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  async function pinJson(payload) {
    if (merged.ipfs.pinataJwt) {
      const res = await fetch(merged.ipfs.pinJsonEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: merged.ipfs.pinataJwt
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`IPFS JSON pin failed: ${text || res.statusText}`);
      }
      const out = await res.json();
      return out.IpfsHash;
    }

    if (!merged.demoMode) {
      throw new Error('No IPFS credentials configured. Set DIACS_CONFIG.ipfs.pinataJwt or enable demoMode.');
    }

    const cid = makeDemoCid('json');
    saveIpfsPayload(cid, payload);
    return cid;
  }

  async function pinFile(file) {
    if (!file) throw new Error('No file selected.');

    if (merged.ipfs.pinataJwt) {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(merged.ipfs.pinFileEndpoint, {
        method: 'POST',
        headers: { Authorization: merged.ipfs.pinataJwt },
        body: form
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`IPFS file pin failed: ${text || res.statusText}`);
      }
      const out = await res.json();
      return out.IpfsHash;
    }

    if (!merged.demoMode) {
      throw new Error('No IPFS credentials configured. Set DIACS_CONFIG.ipfs.pinataJwt or enable demoMode.');
    }

    const cid = makeDemoCid('file');
    saveIpfsPayload(cid, { name: file.name, size: file.size, type: file.type, demoOnly: true });
    return cid;
  }

  function explorerTxUrl(hash) {
    return `${merged.blockExplorerUrl}/tx/${hash}`;
  }

  function ipfsUrl(cid) {
    return `${merged.ipfsGatewayBase}${cid}`;
  }

  window.DIACS = {
    config: merged,
    abi: defaultAbi,
    saveCertificateRecord,
    getCertificateRecord,
    saveIpfsPayload,
    getIpfsPayload,
    pinJson,
    pinFile,
    explorerTxUrl,
    ipfsUrl
  };
})();
