import React, { useRef } from 'react';
import Address from "./OrchAddressViewer";
import "./OrchDelegatorViewer.css";

const OrchDelegatorViewer = (obj) => {
  const delegatorRef = useRef();
  let delegators = obj.delegators;
  let sortedList = [];

  if (delegators && delegators.length) {
    // Sort delegators by bonded amount in descending order
    sortedList = [...delegators].sort((a, b) => parseFloat(b.bondedAmount) - parseFloat(a.bondedAmount));

    return (
      <div className="delegator-viewer-container" ref={delegatorRef}>
        <div className="header-row">
          <h4 className="delegator-title">Current Delegators ({delegators.length})</h4>
        </div>
        <div className="content-wrapper">
          <div className="overflow-content">
            {sortedList.map((delObj, idx) => (
              <div className="delegator-item" key={"delegator" + idx}>
                <div className="delegator-info">
                  <div className="delegator-address-wrapper">
                    <Address address={delObj.id} seed={"delegator" + idx + delObj.id} />
                  </div>
                </div>
                <div className="delegator-stats">
                  <p>{parseFloat(delObj.bondedAmount).toFixed(2)} LPT since round {delObj.startRound}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delegator-no-results">
      <h4>The selected Orchestrator has no Delegators</h4>
      <div className="delegator-vertical-divider" />
    </div>
  );
};

export default OrchDelegatorViewer;
