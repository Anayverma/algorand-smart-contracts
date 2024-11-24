"use client";
import React, { useState } from 'react';
import algosdk from 'algosdk';

const FetchABI = () => {
  const [appId, setAppId] = useState('');
  const [abi, setAbi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchABI = async () => {
    setLoading(true);
    setError('');
    setAbi(null);

    try {
      const indexerClient = new algosdk.Indexer("", "https://testnet-api.algonode.cloud", "");

      const appInfo = await indexerClient.lookupApplications(appId).do();
      console.log(appInfo)
      const appParams = appInfo.application.params;


      if (appParams['global-state']) {
        const globalState = appParams['global-state'];

        const abiEntry = globalState.find(
          (entry) => entry.key === Buffer.from('abi').toString('base64')
        );

        if (abiEntry) {
          const decodedABI = JSON.parse(
            Buffer.from(abiEntry.value.bytes, 'base64').toString()
          );
          setAbi(decodedABI);
        } else {
          setError('ABI not found in global state.');
        }
      } else {
        setError('No global state available.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ABI. Please check the App ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Fetch ABI from Algorand Testnet</h2>
      <input
        type="text"
        placeholder="Enter App ID"
        value={appId}
        onChange={(e) => setAppId(e.target.value)}
        style={{ padding: '10px', marginRight: '10px' }}
      />
      <button onClick={fetchABI} style={{ padding: '10px' }}>
        Fetch ABI
      </button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {abi && (
        <pre style={{ background: '#f4f4f4', padding: '10px' }}>
          {JSON.stringify(abi, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FetchABI;
