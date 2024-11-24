"use client";
import React, { useState } from 'react';

const AbiViewer = ({ abi }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Parse the ABI
  const methods = abi.contract?.methods || [];
  const globalState = abi.schema?.global?.declared || {};
  const localState = abi.schema?.local?.declared || {};
  console.log(abi,"abi yeh hai");
  // Handle method selection
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>ABI Viewer</h1>

      <section>
        <h2>Methods</h2>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {methods.map((method, index) => (
            <li
              key={index}
              onClick={() => handleMethodSelect(method)}
              style={{
                cursor: 'pointer',
                margin: '10px 0',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                background: selectedMethod?.name === method.name ? '#f0f0f0' : '#fff',
              }}
            >
              <strong>{method.name}</strong> - {method.desc || 'No description'}
            </li>
          ))}
        </ul>
      </section>

      {selectedMethod && (
        <section style={{ marginTop: '20px' }}>
          <h2>Method Details: {selectedMethod.name}</h2>
          <p><strong>Description:</strong> {selectedMethod.desc || 'No description'}</p>
          <h3>Parameters</h3>
          {selectedMethod.args.length > 0 ? (
            <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
              {selectedMethod.args.map((arg, index) => (
                <li key={index} style={{ margin: '5px 0' }}>
                  <strong>{arg.name}</strong>: {arg.type}
                </li>
              ))}
            </ul>
          ) : (
            <p>No parameters</p>
          )}
          <h3>Returns</h3>
          <p>{selectedMethod.returns?.type || 'void'}</p>
        </section>
      )}

      <section style={{ marginTop: '20px' }}>
        <h2>Global State</h2>
        {Object.keys(globalState).length > 0 ? (
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {Object.entries(globalState).map(([key, value], index) => (
              <li key={index} style={{ margin: '5px 0' }}>
                <strong>{value.key}</strong>: {value.type}
              </li>
            ))}
          </ul>
        ) : (
          <p>No global state variables</p>
        )}
      </section>

      <section style={{ marginTop: '20px' }}>
        <h2>Local State</h2>
        {Object.keys(localState).length > 0 ? (
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {Object.entries(localState).map(([key, value], index) => (
              <li key={index} style={{ margin: '5px 0' }}>
                <strong>{value.key}</strong>: {value.type}
              </li>
            ))}
          </ul>
        ) : (
          <p>No local state variables</p>
        )}
      </section>
    </div>
  );
};

export default AbiViewer;
