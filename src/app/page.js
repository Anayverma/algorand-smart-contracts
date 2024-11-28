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
  const [abi, setAbi] = useState({
    "hints": {
        "get_value1()uint64": {
            "call_config": {
                "no_op": "CALL"
            }
        },
        "get_value2()uint64": {
            "call_config": {
                "no_op": "CALL"
            }
        },
        "set_value1(uint64)void": {
            "call_config": {
                "no_op": "CALL"
            }
        },
        "set_value2(uint64)void": {
            "call_config": {
                "no_op": "CALL"
            }
        }
    },
    "source": {
        "approval": "I3ByYWdtYSB2ZXJzaW9uIDEwCgpzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3QuYXBwcm92YWxfcHJvZ3JhbToKICAgIGludGNibG9jayAxIDAKICAgIGJ5dGVjYmxvY2sgInZhbHVlMSIgInZhbHVlMiIgMHgxNTFmN2M3NQogICAgdHhuIEFwcGxpY2F0aW9uSUQKICAgIGJueiBtYWluX2FmdGVyX2lmX2Vsc2VAMgogICAgY2FsbHN1YiBfX2luaXRfXwoKbWFpbl9hZnRlcl9pZl9lbHNlQDI6CiAgICBjYWxsc3ViIF9fcHV5YV9hcmM0X3JvdXRlcl9fCiAgICByZXR1cm4KCgovLyBzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3QuX19pbml0X18oKSAtPiB2b2lkOgpfX2luaXRfXzoKICAgIHByb3RvIDAgMAogICAgYnl0ZWNfMCAvLyAidmFsdWUxIgogICAgcHVzaGludCAyIC8vIDIKICAgIGFwcF9nbG9iYWxfcHV0CiAgICBieXRlY18xIC8vICJ2YWx1ZTIiCiAgICBwdXNoaW50IDMgLy8gMwogICAgYXBwX2dsb2JhbF9wdXQKICAgIHJldHN1YgoKCi8vIHNtYXJ0X2NvbnRyYWN0cy5hbmF5c21hcnRjb250cmFjdC5jb250cmFjdC5TaW1wbGVDb250cmFjdC5fX3B1eWFfYXJjNF9yb3V0ZXJfXygpIC0+IHVpbnQ2NDoKX19wdXlhX2FyYzRfcm91dGVyX186CiAgICBwcm90byAwIDEKICAgIHR4biBOdW1BcHBBcmdzCiAgICBieiBfX3B1eWFfYXJjNF9yb3V0ZXJfX19iYXJlX3JvdXRpbmdAOAogICAgcHVzaGJ5dGVzcyAweGEyODcxYTJmIDB4ZWNlZTBhMWYgMHg2MGVlYjIzZSAweDczNGU4MGQxIC8vIG1ldGhvZCAiZ2V0X3ZhbHVlMSgpdWludDY0IiwgbWV0aG9kICJnZXRfdmFsdWUyKCl1aW50NjQiLCBtZXRob2QgInNldF92YWx1ZTEodWludDY0KXZvaWQiLCBtZXRob2QgInNldF92YWx1ZTIodWludDY0KXZvaWQiCiAgICB0eG5hIEFwcGxpY2F0aW9uQXJncyAwCiAgICBtYXRjaCBfX3B1eWFfYXJjNF9yb3V0ZXJfX19nZXRfdmFsdWUxX3JvdXRlQDIgX19wdXlhX2FyYzRfcm91dGVyX19fZ2V0X3ZhbHVlMl9yb3V0ZUAzIF9fcHV5YV9hcmM0X3JvdXRlcl9fX3NldF92YWx1ZTFfcm91dGVANCBfX3B1eWFfYXJjNF9yb3V0ZXJfX19zZXRfdmFsdWUyX3JvdXRlQDUKICAgIGludGNfMSAvLyAwCiAgICByZXRzdWIKCl9fcHV5YV9hcmM0X3JvdXRlcl9fX2dldF92YWx1ZTFfcm91dGVAMjoKICAgIHR4biBPbkNvbXBsZXRpb24KICAgICEKICAgIGFzc2VydCAvLyBPbkNvbXBsZXRpb24gaXMgbm90IE5vT3AKICAgIHR4biBBcHBsaWNhdGlvbklECiAgICBhc3NlcnQgLy8gY2FuIG9ubHkgY2FsbCB3aGVuIG5vdCBjcmVhdGluZwogICAgY2FsbHN1YiBnZXRfdmFsdWUxCiAgICBpdG9iCiAgICBieXRlY18yIC8vIDB4MTUxZjdjNzUKICAgIHN3YXAKICAgIGNvbmNhdAogICAgbG9nCiAgICBpbnRjXzAgLy8gMQogICAgcmV0c3ViCgpfX3B1eWFfYXJjNF9yb3V0ZXJfX19nZXRfdmFsdWUyX3JvdXRlQDM6CiAgICB0eG4gT25Db21wbGV0aW9uCiAgICAhCiAgICBhc3NlcnQgLy8gT25Db21wbGV0aW9uIGlzIG5vdCBOb09wCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBub3QgY3JlYXRpbmcKICAgIGNhbGxzdWIgZ2V0X3ZhbHVlMgogICAgaXRvYgogICAgYnl0ZWNfMiAvLyAweDE1MWY3Yzc1CiAgICBzd2FwCiAgICBjb25jYXQKICAgIGxvZwogICAgaW50Y18wIC8vIDEKICAgIHJldHN1YgoKX19wdXlhX2FyYzRfcm91dGVyX19fc2V0X3ZhbHVlMV9yb3V0ZUA0OgogICAgdHhuIE9uQ29tcGxldGlvbgogICAgIQogICAgYXNzZXJ0IC8vIE9uQ29tcGxldGlvbiBpcyBub3QgTm9PcAogICAgdHhuIEFwcGxpY2F0aW9uSUQKICAgIGFzc2VydCAvLyBjYW4gb25seSBjYWxsIHdoZW4gbm90IGNyZWF0aW5nCiAgICB0eG5hIEFwcGxpY2F0aW9uQXJncyAxCiAgICBidG9pCiAgICBjYWxsc3ViIHNldF92YWx1ZTEKICAgIGludGNfMCAvLyAxCiAgICByZXRzdWIKCl9fcHV5YV9hcmM0X3JvdXRlcl9fX3NldF92YWx1ZTJfcm91dGVANToKICAgIHR4biBPbkNvbXBsZXRpb24KICAgICEKICAgIGFzc2VydCAvLyBPbkNvbXBsZXRpb24gaXMgbm90IE5vT3AKICAgIHR4biBBcHBsaWNhdGlvbklECiAgICBhc3NlcnQgLy8gY2FuIG9ubHkgY2FsbCB3aGVuIG5vdCBjcmVhdGluZwogICAgdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQogICAgYnRvaQogICAgY2FsbHN1YiBzZXRfdmFsdWUyCiAgICBpbnRjXzAgLy8gMQogICAgcmV0c3ViCgpfX3B1eWFfYXJjNF9yb3V0ZXJfX19iYXJlX3JvdXRpbmdAODoKICAgIHR4biBPbkNvbXBsZXRpb24KICAgIGJueiBfX3B1eWFfYXJjNF9yb3V0ZXJfX19hZnRlcl9pZl9lbHNlQDEyCiAgICB0eG4gQXBwbGljYXRpb25JRAogICAgIQogICAgYXNzZXJ0IC8vIGNhbiBvbmx5IGNhbGwgd2hlbiBjcmVhdGluZwogICAgaW50Y18wIC8vIDEKICAgIHJldHN1YgoKX19wdXlhX2FyYzRfcm91dGVyX19fYWZ0ZXJfaWZfZWxzZUAxMjoKICAgIGludGNfMSAvLyAwCiAgICByZXRzdWIKCgovLyBzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3QuZ2V0X3ZhbHVlMSgpIC0+IHVpbnQ2NDoKZ2V0X3ZhbHVlMToKICAgIHByb3RvIDAgMQogICAgaW50Y18xIC8vIDAKICAgIGJ5dGVjXzAgLy8gInZhbHVlMSIKICAgIGFwcF9nbG9iYWxfZ2V0X2V4CiAgICBhc3NlcnQgLy8gY2hlY2sgc2VsZi52YWx1ZTEgZXhpc3RzCiAgICByZXRzdWIKCgovLyBzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3QuZ2V0X3ZhbHVlMigpIC0+IHVpbnQ2NDoKZ2V0X3ZhbHVlMjoKICAgIHByb3RvIDAgMQogICAgaW50Y18xIC8vIDAKICAgIGJ5dGVjXzEgLy8gInZhbHVlMiIKICAgIGFwcF9nbG9iYWxfZ2V0X2V4CiAgICBhc3NlcnQgLy8gY2hlY2sgc2VsZi52YWx1ZTIgZXhpc3RzCiAgICByZXRzdWIKCgovLyBzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3Quc2V0X3ZhbHVlMShuZXdfdmFsdWU6IHVpbnQ2NCkgLT4gdm9pZDoKc2V0X3ZhbHVlMToKICAgIHByb3RvIDEgMAogICAgdHhuIFNlbmRlcgogICAgZ2xvYmFsIENyZWF0b3JBZGRyZXNzCiAgICA9PQogICAgYXNzZXJ0CiAgICBieXRlY18wIC8vICJ2YWx1ZTEiCiAgICBmcmFtZV9kaWcgLTEKICAgIGFwcF9nbG9iYWxfcHV0CiAgICByZXRzdWIKCgovLyBzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3Quc2V0X3ZhbHVlMihuZXdfdmFsdWU6IHVpbnQ2NCkgLT4gdm9pZDoKc2V0X3ZhbHVlMjoKICAgIHByb3RvIDEgMAogICAgdHhuIFNlbmRlcgogICAgZ2xvYmFsIENyZWF0b3JBZGRyZXNzCiAgICA9PQogICAgYXNzZXJ0CiAgICBieXRlY18xIC8vICJ2YWx1ZTIiCiAgICBmcmFtZV9kaWcgLTEKICAgIGFwcF9nbG9iYWxfcHV0CiAgICByZXRzdWIK",
        "clear": "I3ByYWdtYSB2ZXJzaW9uIDEwCgpzbWFydF9jb250cmFjdHMuYW5heXNtYXJ0Y29udHJhY3QuY29udHJhY3QuU2ltcGxlQ29udHJhY3QuY2xlYXJfc3RhdGVfcHJvZ3JhbToKICAgIHB1c2hpbnQgMSAvLyAxCiAgICByZXR1cm4K"
    },
    "state": {
        "global": {
            "num_byte_slices": 0,
            "num_uints": 2
        },
        "local": {
            "num_byte_slices": 0,
            "num_uints": 0
        }
    },
    "schema": {
        "global": {
            "declared": {
                "value1": {
                    "type": "uint64",
                    "key": "value1"
                },
                "value2": {
                    "type": "uint64",
                    "key": "value2"
                }
            },
            "reserved": {}
        },
        "local": {
            "declared": {},
            "reserved": {}
        }
    },
    "contract": {
        "name": "SimpleContract",
        "methods": [
            {
                "name": "get_value1",
                "args": [],
                "readonly": false,
                "returns": {
                    "type": "uint64"
                },
                "desc": "Getter function to fetch the value of 'value1'."
            },
            {
                "name": "get_value2",
                "args": [],
                "readonly": false,
                "returns": {
                    "type": "uint64"
                },
                "desc": "Getter function to fetch the value of 'value2'."
            },
            {
                "name": "set_value1",
                "args": [
                    {
                        "type": "uint64",
                        "name": "new_value"
                    }
                ],
                "readonly": false,
                "returns": {
                    "type": "void"
                },
                "desc": "Setter function to update the value of 'value1'.\nOnly the contract creator can call this function."
            },
            {
                "name": "set_value2",
                "args": [
                    {
                        "type": "uint64",
                        "name": "new_value"
                    }
                ],
                "readonly": false,
                "returns": {
                    "type": "void"
                },
                "desc": "Setter function to update the value of 'value2'.\nOnly the contract creator can call this function."
            }
        ],
        "networks": {}
    },
    "bare_call_config": {
        "no_op": "CREATE"
    }
});
  const [appId, setAppId] = useState("729754180");
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
