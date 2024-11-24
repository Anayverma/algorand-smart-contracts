"use client";
import React, { useState, useEffect, useRef } from "react";

import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

export default function ContractInteraction() {
    const peraWalletRef = useRef(
        new PeraWalletConnect({
          network: "testnet", // Connect to Testnet
        })
      );
      const [connectedAccount, setConnectedAccount] = useState(null);
      const [confirmedTxn, setConfirmedTxn] = useState("");
    
  const [peraWallet, setPeraWallet] = useState(new PeraWalletConnect());
  const [walletAddress, setWalletAddress] = useState(null);
  const [abi, setAbi] = useState(null);
  const [appId, setAppId] = useState("729542558");
  const [mnemonic, setMnemonic] = useState(
    "start lawsuit remember fuel race direct shock brother forward area blouse december next exist ancient liberty round symbol process harsh slim under swap above frost"
  );
  const [logs, setLogs] = useState([]);
  const [globalState, setGlobalState] = useState([]);
  const [methods, setMethods] = useState([]);
  useEffect(() => {
    const reconnect = async () => {
      try {
        const accounts = await peraWalletRef.current.reconnectSession();
        if (accounts && accounts.length > 0) {
          setConnectedAccount(accounts[0]);
          // toast.info("Reconnected to Pera Wallet session.");
        }
      } catch (error) {
        console.error("Reconnect failed:", error);
      }
    };

    reconnect();
  }, []);
  // Handle ABI Input
  const handleAbiInput = (event) => {
    try {
      const parsedAbi = JSON.parse(event.target.value);
      setAbi(parsedAbi);
    } catch (error) {
      alert("Invalid ABI JSON input");
    }
  };

  // Connect to Pera Wallet
//   const connectWallet = async () => {
//     try {
//       const newWallet = new PeraWalletConnect();
//       setPeraWallet(newWallet);

//       // Connect to the wallet and get the user's address
//       const addresses = await newWallet.connect();
//       setWalletAddress(addresses[0]);

//       // Reconnect session and handle disconnect
//       newWallet.reconnectSession();
//       newWallet.onDisconnect(() => {
//         setWalletAddress(null);
//       });
//     } catch (err) {
//       console.error("Failed to connect wallet:", err);
//       alert("Failed to connect wallet. Please try again.");
//     }
//   };
const connectWallet = async () => {
    try {
      const peraWallet = peraWalletRef.current;
      const accounts = await peraWallet.connect();
      console.log("Wallet Accounts:", accounts); // Log connected accounts

      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        setWalletAddress(accounts[0])
        // toast.success("Connected to Pera Wallet!");
        console.log("Connected Account Address:", accounts[0]); // Log connected address

        // Send a test transaction
        // await sendTestTransaction(accounts[0]);
      } else {
        toast.error("No accounts found. Please try connecting again.");
      }

      // Event listener for wallet disconnect
      peraWallet.connector?.on("disconnect", () => {
        setConnectedAccount(null);
        console.log("Disconnected from wallet");
      });
    } catch (error) {
      console.error("Wallet connection failed:", error);
      //toast.error("Wallet connection failed.");
    }
  };

  // Function to disconnect wallet manually
  const disconnectWallet = () => {
    const peraWallet = peraWalletRef.current;
    peraWallet.disconnect();
    setConnectedAccount(null);
    setWalletAddress(null);
    //toast.info("Disconnected from Pera Wallet.");
  };

  // Fetch Global State and Contract Methods
  const fetchState = async () => {
    if (!appId) return alert("Please enter a valid App ID.");
    try {
      const methodFromAbi = abi.contract?.methods || [];
      console.log(methodFromAbi);

      const globalStateArray = Object.entries(abi.schema?.global?.declared || {}).map(([key, value]) => ({
        key,
        ...value,
      }));

      setGlobalState(globalStateArray);
      setMethods(methodFromAbi);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch state.");
    }
  };

  // const invokeMethod = async (methodName, args = []) => {
  //   try {
  //     if (!walletAddress) return alert("Please connect your wallet first.");
  
  //     const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
  
  //     // Fetch suggested transaction parameters
  //     const suggestedParams = await client.getTransactionParams().do();

  //     console.log("ABI object:", abi);
      
  //     const atc = new algosdk.AtomicTransactionComposer();
  //     // Find the method by its name
  //     const method = abi.contract.methods.find((m) => m.name === methodName);
  //   //   const allmet = abi.contract.methods
  //     const allmet = Object.values(abi.contract.methods);
  //     const methodsArray = abi.contract.methods.filter(method => method.name===methodName);

  //     console.log( Array.isArray(methodsArray))
  //     console.log("Methods:", algosdk.getMethodByName(abi, methodName));
  
  //     if (!method) {
  //       alert("Method not found in ABI");
  //       return;
  //     }
  //     console.log("methodarray",methodsArray)
  //     console.log("cp1")
  //     // Add method call
  //     atc.addMethodCall({
  //       appID: parseInt(appId),
  //       methodArgs: [2],
  //       sender: walletAddress,
  //       signer: peraWallet.signTransaction,
  //       suggestedParams,
  //     });
  //     console.log("cp2")
      
  //     // Execute the transaction
  //     const results = await atc.execute(client, 3);
  
  //     setLogs((prevLogs) => [...prevLogs, `Transaction successful: ${results.txIDs.join(", ")}`]);
  //   } catch (err) {
  //     console.error("Error during transaction:", err);
  //     setLogs((prevLogs) => [...prevLogs, `Error: ${err.message}`]);
  //   }
  // };

//   const invokeMethod = async (methodName, args = [2]) => {
//     try {
//         if (!walletAddress) {
//             alert("Please connect your wallet first.");
//             return;
//         }

//         const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

//         // Fetch suggested transaction parameters
//         const suggestedParams = await client.getTransactionParams().do();

//         console.log("ABI object:", abi);

//         const atc = new algosdk.AtomicTransactionComposer();

//         // Find the method by its name
//         const method = abi.contract.methods.find((m) => m.name === methodName);

//         if (!method) {
//             alert(`Method "${methodName}" not found in ABI.`);
//             return;
//         }

//         console.log("Selected method:", method);

//         // Add method call
//         atc.addMethodCall({
//             appID: parseInt(appId), // Ensure appId is an integer
//             method: new algosdk.ABIMethod(method), // Use ABIMethod for type safety
//             methodArgs: args, // Pass dynamic arguments
//             sender: walletAddress,
//             signer: peraWallet.signTransaction, // Ensure this is correctly implemented
//             suggestedParams,
//         });

//         console.log("Added method call to ATC");

//         // Execute the transaction
//         const results = await atc.execute(client, 3);

//         console.log("Transaction Results:", results);

//         setLogs((prevLogs) => [
//             ...prevLogs,
//             `Transaction successful: ${results.txIDs.join(", ")}`,
//         ]);
//     } catch (err) {
//         console.error("Error during transaction:", err);
//         setLogs((prevLogs) => [
//             ...prevLogs,
//             `Error: ${err.message}`,
//         ]);
//     }
// };
// const invokeMethod = async (methodName, args = [2]) => {
//   try {
//       if (!walletAddress) {
//           alert("Please connect your wallet first.");
//           return;
//       }

//       const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

//       // Fetch suggested transaction parameters
//       const suggestedParams = await client.getTransactionParams().do();

//       if (!abi || !abi.contract || !Array.isArray(abi.contract.methods)) {
//           console.error("Invalid ABI object:", abi);
//           alert("Invalid ABI object.");
//           return;
//       }

//       console.log("ABI object:", abi);

//       const atc = new algosdk.AtomicTransactionComposer();

//       // Find the method by its name
//       const method = abi.contract.methods.find((m) => m.name === methodName);

//       if (!method) {
//           console.error(`Method "${methodName}" not found in ABI.`);
//           alert(`Method "${methodName}" not found in ABI.`);
//           return;
//       }

//       console.log("Selected method:", method);

//       // Add method call
//       if (!peraWallet || typeof peraWallet.signTransaction !== "function") {
//           console.error("Pera Wallet or signTransaction method is not initialized correctly.");
//           alert("Wallet is not properly connected or initialized.");
//           return;
//       }
//       console.log("this is from wallet",peraWallet.signTransaction)
//       atc.addMethodCall({
//           appID: parseInt(appId), // Ensure appId is an integer
//           method: new algosdk.ABIMethod(method), // Use ABIMethod for type safety
//           methodArgs: args, // Pass dynamic arguments
//           sender: walletAddress,
//           signer: peraWallet.signTransaction, // Ensure this is correctly implemented
//           suggestedParams,
//       });

//       console.log("Added method call to ATC");

//       const results = await atc.execute(client, 5);

//       console.log("Transaction Results:", results);

//       setLogs((prevLogs) => [
//           ...prevLogs,
//           `Transaction successful: ${results.txIDs.join(", ")}`,
//       ]);
//   } catch (err) {
//       console.error("Error during transaction:", err);
//       setLogs((prevLogs) => [
//           ...prevLogs,
//           `Error: ${err.message}`,
//       ]);
//   }
// };
// const invokeMethod = async (methodName, args = [2]) => {
//   try {
//     if (!walletAddress) {
//       alert("Please connect your wallet first.");
//       return;
//     }

//     const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
//     const suggestedParams = await client.getTransactionParams().do();

//     if (!abi || !abi.contract || !Array.isArray(abi.contract.methods)) {
//       alert("Invalid ABI object.");
//       return;
//     }

//     const method = abi.contract.methods.find((m) => m.name === methodName);
//     if (!method) {
//       alert(`Method "${methodName}" not found.`);
//       return;
//     }

//     const atc = new algosdk.AtomicTransactionComposer();
//     const mnemonic = "start lawsuit remember fuel race direct shock brother forward area blouse december next exist ancient liberty round symbol process harsh slim under swap above frost";

//     // Convert mnemonic to the account (private key and address)
//     const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
    
//     // Use the account's public address (for sender) and private key (for signer)
//     const senderAddress = recoveredAccount.addr;
//     const privateKey = recoveredAccount.sk;
    
//     atc.addMethodCall({
//       appID: parseInt(appId),
//       method: new algosdk.ABIMethod(method),
//       methodArgs: args,
//       sender: senderAddress, // Use the recovered public address here
//       signer: [privateKey],   // Use the recovered private key (sk) here
//       suggestedParams,
//     });

//     const results = await atc.execute(client, 5);
//     setLogs((prevLogs) => [
//       ...prevLogs,
//       `Transaction successful: ${results.txIDs.join(", ")}`,
//     ]);
//   } catch (error) {
//     console.error("Error invoking method:", error);
//     setLogs((prevLogs) => [...prevLogs, `Error: ${error.message}`]);
//   }
// };

// const invokeMethod = async (methodName, args = [2]) => {
//   try {
//     if (!walletAddress) {
//       alert("Please connect your wallet first.");
//       return;
//     }

//     const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
//     const suggestedParams = await client.getTransactionParams().do();

//     if (!abi || !abi.contract || !Array.isArray(abi.contract.methods)) {
//       alert("Invalid ABI object.");
//       return;
//     }

//     const method = abi.contract.methods.find((m) => m.name === methodName);
//     if (!method) {
//       alert(`Method "${methodName}" not found.`);
//       return;
//     }

//     const atc = new algosdk.AtomicTransactionComposer();
//     const mnemonic = "start lawsuit remember fuel race direct shock brother forward area blouse december next exist ancient liberty round symbol process harsh slim under swap above frost";

//     // Convert mnemonic to the account (private key and address)
//     const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
    
//     // Use the account's public address (for sender) and private key (for signer)
//     const senderAddress = recoveredAccount.addr;
//     const privateKey = recoveredAccount.sk;

//     // Signer function to sign the transaction
//     const signer = (txn) => algosdk.signTransaction(txn, privateKey);

//     atc.addMethodCall({
//       appID: parseInt(appId),
//       method: new algosdk.ABIMethod(method),
//       methodArgs: args,
//       sender: senderAddress, // Use the recovered public address here
//       signer: signer,   // Use the signer function here
//       suggestedParams,
//     });

//     const results = await atc.execute(client, 5);
//     console.log("results",results)
//   } catch (error) {
//     console.error("Error invoking method:", error);
//     setLogs((prevLogs) => [...prevLogs, `Error: ${error.message}`]);
//   }
// };
const invokeMethod = async (methodName, args = [2]) => {
  try {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    const client = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
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

    // Convert mnemonic to the account (private key and address)
    const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
    
    // Use the account's public address (for sender) and private key (for signer)
    const senderAddress = recoveredAccount.addr;
    const privateKey = recoveredAccount.sk;

    // Signer function to sign the transaction group
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
    console.log(signer)

    atc.addMethodCall({
      appID: parseInt(appId),
      method: new algosdk.ABIMethod(method),
      methodArgs: args,
      sender: senderAddress,
      signer: signer,  
      suggestedParams,
    });
    console.log("yha tak hogya")
    // Execute the atomic transaction group
    const results = await atc.execute(client, 5);

    // Log the transaction IDs from the results
    console.log("Transaction successful: ", results.txIDs.join(", "));
  } catch (error) {
    console.error("Error invoking method:", error);
    setLogs((prevLogs) => [...prevLogs, `Error: ${error.message}`]);
  }
};

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Algorand Smart Contract Interaction</h1>

      {/* Wallet Connection Section */}
      <div className="mb-6">
        {!walletAddress ? (
          <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        ) : (
          <button onClick={disconnectWallet} className="bg-red-500 text-white px-4 py-2 rounded">
            Disconnect Wallet
          </button>
        )}
        {walletAddress && <p className="mt-2">Connected Wallet: {walletAddress}</p>}
      </div>

      {/* Input Section */}
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
        <button onClick={fetchState} className="bg-blue-500 text-white px-4 py-2 rounded">
          Fetch Contract State
        </button>
      </div>

      {/* Global State Section */}
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

      {/* Methods Section */}
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

      {/* Logs Section */}
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