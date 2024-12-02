"use client";
import React, { useState, useEffect, useRef } from "react";

import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

export default function ContractInteraction() {
  const peraWalletRef = useRef(
    new PeraWalletConnect({
      network: "testnet",
    })
  );
  const [connectedAccount, setConnectedAccount] = useState("WUCLZ445VNZHL5HRL2WHB3TYS75VXNEREBPMXYGKWTOBPGQYTX5VHLTS3U");
  const [confirmedTxn, setConfirmedTxn] = useState("");
  

  const [peraWallet, setPeraWallet] = useState(new PeraWalletConnect());
  const [walletAddress, setWalletAddress] = useState(null);
  const [abi, setAbi] = useState(null);
  const [appId, setAppId] = useState("729754180");
  const [mnemonic, setMnemonic] = useState(
    "start lawsuit remember fuel race direct shock brother forward area blouse december next exist ancient liberty round symbol process harsh slim under swap above frost"
  );
  const [logs, setLogs] = useState([]);
  const [globalState, setGlobalState] = useState([]);
  const [methods, setMethods] = useState([]);
  const [methodsWA, setMethodsWA] = useState([]);
  useEffect(() => {
    const reconnect = async () => {
      try {
        const accounts = await peraWalletRef.current.reconnectSession();
        if (accounts && accounts.length > 0) {
          setConnectedAccount(accounts[0]);
        }
      } catch (error) {
        console.error("Reconnect failed:", error);
      }
    };

    reconnect();
  }, []);
  const handleAbiInput = (event) => {
    try {
      const parsedAbi = JSON.parse(event.target.value);
      setAbi(parsedAbi);
    } catch (error) {
      alert("Invalid ABI JSON input");
    }
  };

  const connectWallet = async () => {
    try {
      const peraWallet = peraWalletRef.current;
      const accounts = await peraWallet.connect();
      console.log("Wallet Accounts:", accounts);

      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        setWalletAddress(accounts[0]);
        console.log("Connected Account Address:", accounts[0]);
      } else {
        toast.error("No accounts found. Please try connecting again.");
      }

      peraWallet.connector?.on("disconnect", () => {
        setConnectedAccount(null);
        console.log("Disconnected from wallet");
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    const peraWallet = peraWalletRef.current;
    peraWallet.disconnect();
    setConnectedAccount(null);
    setWalletAddress(null);
  };

  const fetchState = async () => {
    if (!appId) return alert("Please enter a valid App ID.");
    try {
      const methodFromAbi = abi.contract?.methods || [];
      console.log(methodFromAbi);

      const globalStateArray = Object.entries(
        abi.schema?.global?.declared || {}
      ).map(([key, value]) => ({
        key,
        ...value,
      }));

      setGlobalState(globalStateArray);
      setMethods(methodFromAbi);
      const methodsWithArguments = methodFromAbi.map(method => {
        const argumentsArray = method.inputs.map(input => input.type);
        return {
          ...method,
          arguments: argumentsArray,
        };
      });
      setMethodsWA(methodsWithArguments);
      console.log("hihi",methodsWA)
    } catch (err) {
      console.error(err);
      alert("Failed to fetch state.");
    }
  };

  const invokeMethod = async (methodName, args = []) => {
    try {
      // if (!walletAddress) {
      //   alert("Please connect your wallet first.");
      //   return;
      // }

      const client = new algosdk.Algodv2(
        "",
        "https://testnet-api.algonode.cloud",
        ""
      );
      const suggestedParams = await client.getTransactionParams().do();

      if (!abi || !abi.contract || !Array.isArray(abi.contract.methods)) {
        alert("Invalid ABI object.");
        return;
      }

      const method = abi.contract.methods.find((m) => m.name === methodName);
      if (!method) {
        alert(`Method "${methodName}" not found.`);
        return;
      }

      const atc = new algosdk.AtomicTransactionComposer();
      const mnemonic = "";

      const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);

      const senderAddress = recoveredAccount.addr;
      const privateKey = recoveredAccount.sk;

      const signer = async (txnGroup, indexesToSign) => {
        const signedTransactions = [];
        for (let i = 0; i < indexesToSign.length; i++) {
          const index = indexesToSign[i];
          const txn = txnGroup[index];
          const signedTxn = algosdk.signTransaction(txn, privateKey);
          signedTransactions.push(signedTxn.blob);
        }
        return signedTransactions;
      };
      console.log(signer);

      atc.addMethodCall({
        appID: parseInt(appId),
        method: new algosdk.ABIMethod(method),
        methodArgs: args,
        sender: senderAddress,
        signer: signer,
        suggestedParams,
      });
      console.log("yha tak hogya");
      const results = await atc.execute(client, 5);

      console.log("Transaction successful: ", results.txIDs.join(", "));
      console.log(results)
      const resultsWithBigInt = JSON.stringify(
        results,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2 // Pretty print with 2-space indentation
      );
      console.log("Full results object:", resultsWithBigInt);
  
      // Log method-specific results
      if (results.methodResults) {
        results.methodResults.forEach((methodResult, index) => {
          console.log(`Result for Method ${index + 1}:`);
          console.log("  Raw Return Value:", methodResult.rawReturnValue);
          console.log("  Decoded Return Value:", methodResult.returnValue);
          console.log("  TxID:", methodResult.txID);
        });
      }
    } catch (error) {
      console.error("Error invoking method:", error);
      setLogs((prevLogs) => [...prevLogs, `Error: ${error.message}`]);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Algorand Smart Contract Interaction
      </h1>

      <div className="mb-6">
        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Disconnect Wallet
          </button>
        )}
        {walletAddress && (
          <p className="mt-2">Connected Wallet: {walletAddress}</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <label className="block mb-2 font-medium">Enter ABI (JSON)</label>
        <textarea
          onChange={handleAbiInput}
          className="block mb-4 border p-2 rounded w-full"
          placeholder="Paste ABI JSON here"
        />
        <input
          type="text"
          placeholder="Enter App ID"
          value={appId}
          onChange={(e) => setAppId(e.target.value)}
          className="block mb-4 border p-2 rounded w-full"
        />
        <button
          onClick={fetchState}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Fetch Contract State
        </button>
      </div>

      {globalState.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-medium">Global State</h2>
          <ul>
            {globalState.map((item, index) => (
              <li key={index} className="mb-2">
                <strong>{item.key}:</strong> <span>{item.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {methods.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-medium">Contract Methods</h2>
          <ul>
            {methods.map((method, index) => (
              <li key={index} className="mb-4">
                <strong>{method.name}</strong>
                <p>{method.desc}</p>
                <button
                  onClick={() => invokeMethod(method.name)}
                  className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                >
                  Invoke Method
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-gray-100 p-4 rounded shadow mt-6">
        <h2 className="text-xl font-medium">Logs</h2>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
