"use client";
import React, { useState, useEffect, useRef } from "react";
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";

const AlgoApibuilder = () => {
  const peraWalletRef = useRef(
    new PeraWalletConnect({
      network: "testnet", // Connect to Testnet
    })
  );
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [confirmedTxn, setConfirmedTxn] = useState("");

  // Reconnect session if already connected
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

  // Function to connect wallet
  const connectWallet = async () => {
    try {
      const peraWallet = peraWalletRef.current;
      const accounts = await peraWallet.connect();
      console.log("Wallet Accounts:", accounts); // Log connected accounts

      if (accounts && accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        // toast.success("Connected to Pera Wallet!");
        console.log("Connected Account Address:", accounts[0]); // Log connected address

        // Send a test transaction
        await sendTestTransaction(accounts[0]);
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
    //toast.info("Disconnected from Pera Wallet.");
  };

  // Function to send a test transaction
  const sendTestTransaction = async (accountAddress) => {
    if (!accountAddress || !algosdk.isValidAddress(accountAddress)) {
      console.error("Invalid or missing account address for test transaction.");
      //toast.error("Invalid or missing account address.");
      return;
    }

    try {
      const baseURL = "https://testnet-api.algonode.cloud";
      const algodClient = new algosdk.Algodv2('', baseURL, '');

      const suggestedParams = await algodClient.getTransactionParams().do();

      console.log("Sending test transaction from:", accountAddress); // Log sender address
      const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: accountAddress,
        to: accountAddress, // Self-transaction for test purposes
        amount: 3, // Test transaction with 0 Algos
        suggestedParams,
      });

      const signedTxn = await peraWalletRef.current.signTransaction([payTxn.toByte()]);
      const { txId } = await algodClient.sendRawTransaction(signedTxn).do();

      setConfirmedTxn(txId);
      //toast.success(`Test transaction successful! TxID: ${txId}`);
      console.log("Test transaction successful:", txId); // Log transaction ID
    } catch (error) {
      console.error("Test transaction failed:", error);
      //toast.error(`Test transaction failed: ${error.message}`);
    }
  };

  return (
    <div className="algo-apibuilder-container">
      {/* <toastContainer /> */}
      <h1>Algo API Builder</h1>
      <button onClick={connectWallet} className="connect-wallet-btn">
        {connectedAccount ? "Wallet Connected" : "Connect Pera Wallet"}
      </button>
      <button
        onClick={disconnectWallet}
        className="disconnect-wallet-btn"
        disabled={!connectedAccount}
      >
        Disconnect Wallet
      </button>
      <p>Connected Account: {connectedAccount || "Not Connected"}</p>
      {confirmedTxn && (
        <p>
          <a
            href={`https://testnet.algoexplorer.io/tx/${confirmedTxn}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Test Transaction: {confirmedTxn}
          </a>
        </p>
      )}
    </div>
  );
};

export default AlgoApibuilder;