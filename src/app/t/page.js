"use client";
import React, { useState, useEffect, useRef } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

export default function ContractInteraction() {
  const peraWalletRef = useRef(
    new PeraWalletConnect({
      chainId: "416002",
      shouldShowSignTxnToast: false,
      // network: "testnet",
    })
  );

  const [connectedAccount, setConnectedAccount] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [abi, setAbi] = useState(null);
  const [appId, setAppId] = useState("729754180");
  const [logs, setLogs] = useState([]);
  const [globalState, setGlobalState] = useState([]);
  const [methods, setMethods] = useState([]);
  const [methodsWA, setMethodsWA] = useState([]);
  const [methodArguments, setMethodArguments] = useState({}); // State to store method arguments
  const [mnemonic, setMnemonic] = useState(
    null
  );
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

  const handleArgumentChange = (methodName, argName, value) => {
    setMethodArguments(prevState => ({
      ...prevState,
      [methodName]: {
        ...prevState[methodName],
        [argName]: value,
      },
    }));
  };

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

      const methodsWithArguments = methodFromAbi.map((method) => ({
        ...method,
        arguments: method.inputs
          ? method.inputs.map((input) => ({
              name: input.name,
              type: input.type,
              value: methodArguments[method.name]?.[input.name] || "", 
            }))
          : [], 
      }));

      setMethodsWA(methodsWithArguments);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch state.");
    }
  };
  
  
  const invokeMethod = async (methodName) => {
    try {
      // if (!walletAddress) {
      //   alert("Please connect your wallet first.");
      //   return;
      // }
      const methodArgs = methodsWA.find((m) => m.name === methodName)?.args || [];
      const inputArgs = methodArguments[methodName] || {};
  
      // Validate all required arguments
      const missingArgs = methodArgs.filter((arg) => !(arg.name in inputArgs));
      if (missingArgs.length > 0) {
        alert(
          `Missing arguments: ${missingArgs
            .map((arg) => `${arg.name} (${arg.type})`)
            .join(", ")}`
        );
        return;
      }
  
      // Prepare arguments in order
      const args = methodArgs.map((arg) => {
        const input = inputArgs[arg.name]; // Fetch input value by name
  
        // Handle argument type parsing
        switch (arg.type) {
          case "uint64":
            if (typeof input === "string") {
              const parsedValue = BigInt(input); // Use BigInt for 64-bit unsigned integers
              if (parsedValue < 0n || parsedValue > 2n ** 64n - 1n) {
                throw new Error(`Invalid uint64 value for argument: ${arg.name}`);
              }
              return parsedValue;
            } else if (typeof input === "number") {
              return BigInt(input); // Directly return BigInt for number
            }
            throw new Error(`Invalid uint64 input type for argument: ${arg.name}`);
  
          case "boolean":
            if (typeof input === "string") {
              if (input.toLowerCase() === "true") return true;
              if (input.toLowerCase() === "false") return false;
              throw new Error(`Invalid boolean value for argument: ${arg.name}`);
            }
            return Boolean(input); // Coerce to boolean
  
          case "bytes":
            if (typeof input === "string") {
              return new Uint8Array(Buffer.from(input, "utf8")); // Convert string to byte array
            } else if (input instanceof Uint8Array) {
              return input; // Already a byte array
            }
            throw new Error(`Invalid bytes value for argument: ${arg.name}`);
  
          case "address":
            if (typeof input === "string" && isValidAlgorandAddress(input)) {
              return input; // Return if valid Algorand address
            }
            throw new Error(`Invalid Algorand address for argument: ${arg.name}`);
  
          default:
            return input; // Return default input if no specific type match
        }
      });
  
      const bigIntReplacer = (key, value) => {
        if (typeof value === "bigint") {
          return value.toString(); // Convert BigInt to string
        }
        return value;
      };
  
      console.log(`Invoking ${methodName} with arguments:`, args);
      setLogs((prevLogs) => [
        ...prevLogs,
        `Invoked ${methodName} with arguments: ${JSON.stringify(args, bigIntReplacer)}`,
      ]);
  
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
      const mnemonic = "start lawsuit remember fuel race direct shock brother forward area blouse december next exist ancient liberty round symbol process harsh slim under swap above frost";
  
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
  
      atc.addMethodCall({
        appID: parseInt(appId),
        method: new algosdk.ABIMethod(method),
        methodArgs: args,
        sender: senderAddress,
        signer: signer,
        suggestedParams,
      });
  
      const results = await atc.execute(client, 5);
  
      console.log("Transaction successful: ", results.txIDs.join(", "));
      const resultsWithBigInt = JSON.stringify(
        results,
        (_, value) => (typeof value === "bigint" ? value.toString() : value),
        2 // Pretty print with 2-space indentation
      );
      console.log("Full results object:", resultsWithBigInt);
  
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
  

  function isValidAlgorandAddress(address) {
    const algorandAddressRegex = /^[A-Z2-7]{58}$/;
    return algorandAddressRegex.test(address);
  }
  
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Algorand Smart Contract Interaction</h1>

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

      {methodsWA.length > 0 && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-medium">Contract Methods</h2>
          <ul>
            {methodsWA.map((method, index) => (
              <li key={index} className="mb-4">
                <strong>{method.name}</strong>
                <p>{method.desc}</p>
                {method.args.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {method.args.map((arg, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder={`${arg.name} (${arg.type})`}
                        value={methodArguments[method.name]?.[arg.name] || ""}
                        onChange={(e) =>
                          handleArgumentChange(method.name, arg.name, e.target.value)
                        }
                        className="border p-2 rounded"
                      />
                    ))}
                  </div>
                )}
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
