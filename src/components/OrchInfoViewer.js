import React from 'react';
import Address from "./OrchAddressViewer";
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import "./OrchInfoViewer.css";

function updateClipboard(newClip) {
  navigator.clipboard.writeText(newClip).then(
    () => {
      console.log("Copied!");
    },
    () => {
      console.log("Copy failed!");
    }
  );
}

function copyLink(addr) {
  navigator.permissions
    .query({ name: "clipboard-write" })
    .then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        updateClipboard(addr);
      }
    });
}

const OrchInfoViewer = (obj) => {
  const livepeer = useSelector((state) => state.livepeerstate);
  let hasENS = false;
  let rewardCut = 0;
  let feeCut = 0;
  let totalStake = 0;
  let totalVolumeETH = 0;
  let totalVolumeUSD = 0;
  let selfStake = 0;
  let selfStakeRatio = 0;
  let thisUrl = "";
  let thisID = "";

  if (obj.totalStake && obj.totalStake > 0) {
    if (obj.rewardCut) {
      rewardCut = (obj.rewardCut / 10000).toFixed(2);
    }
    if (obj.feeShare) {
      feeCut = (100 - (obj.feeShare / 10000)).toFixed(2);
    }
    if (obj.totalStake) {
      totalStake = parseFloat(obj.totalStake).toFixed(2);
    }
    if (obj.totalVolumeETH) {
      totalVolumeETH = parseFloat(obj.totalVolumeETH * 1).toFixed(4);
    }
    if (obj.totalVolumeUSD) {
      totalVolumeUSD = parseFloat(obj.totalVolumeUSD * 1).toFixed(2);
    }
    if (obj.delegator) {
      selfStake = parseFloat(obj.delegator.bondedAmount);
      selfStakeRatio = ((selfStake / totalStake) * 100).toFixed(2);
      selfStake = selfStake.toFixed(2);
      thisID = obj.delegator.id;
      thisUrl = "https://explorer.livepeer.org/accounts/" + thisID;
    }

    let shareUrl;
    if (obj.rootOnly) {
      shareUrl = window.location.href;
    } else {
      let thisFullPath = window.location.href;
      if (thisFullPath.lastIndexOf("?") > -1) {
        thisFullPath = thisFullPath.substring(0, thisFullPath.lastIndexOf("?"));
      }
      shareUrl = thisFullPath + "?orchAddr=" + thisID;
    }

    let thisDomain = null;
    let thisInfo = null;

    if (livepeer.ensDomainMapping) {
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === thisID) {
          thisDomain = thisAddr;
          break;
        }
      }
    }

    if (thisDomain && thisDomain.domain && livepeer.ensInfoMapping && livepeer.ensInfoMapping.length) {
      for (const thisAddr of livepeer.ensInfoMapping) {
        if (thisAddr.domain === thisDomain.domain) {
          thisInfo = thisAddr;
          hasENS = true;
          break;
        }
      }
    }

    let ensDescription;
    let ensUrl;
    if (hasENS) {
      if (thisInfo.description) {
        ensDescription = thisInfo.description;
      }
      if (thisInfo.url) {
        if (!thisInfo.url.startsWith('http')) {
          thisInfo.url = "https://" + thisInfo.url;
        }
        ensUrl = (
          <div className="stroke">
            <a className="select-orch-light" target="_blank" rel="noopener noreferrer" href={thisInfo.url}>
              <div className="row-align-left">
                <span>{thisInfo.url}</span>
              </div>
            </a>
          </div>
        );
      }
    }

    let descriptionObj;
    if (ensDescription) {
      descriptionObj = (
        <div className="ens-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ensDescription) }} />
      );
    }

    return (
      <div className="orch-info-container">
        <div className="orch-address-section">
          <Address address={thisID} />
          {ensUrl}
          {descriptionObj}
        </div>
        
        <div className="orch-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Stake</div>
            <div className="stat-value">{totalStake} LPT</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Self Stake</div>
            <div className="stat-value">{selfStake} LPT</div>
            <div className="stat-sub">({selfStakeRatio}%)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Reward Cut</div>
            <div className="stat-value">{rewardCut}%</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Fee Cut</div>
            <div className="stat-value">{feeCut}%</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Earned Fees (ETH)</div>
            <div className="stat-value">{totalVolumeETH} ETH</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Earned Fees (USD)</div>
            <div className="stat-value">${totalVolumeUSD}</div>
          </div>
        </div>
        
        <div className="orch-actions">
          <button
            className="copy-link-button"
            onClick={() => {
              copyLink(shareUrl);
            }}
            title="Copy share link"
          >
            <img alt="Copy link" src="clipboard.svg" width="20" height="20" />
            Copy Share Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stroke stretch-and-between">
      <div className="orch-vertical-divider" />
      <div className="stretch-and-between side-margin">
        <h4>This address has no stake on the Livepeer network</h4>
        <p>This address is not currently participating as an Orchestrator or Delegator on the Livepeer network.</p>
      </div>
      <div className="orch-vertical-divider" />
    </div>
  );
};

export default OrchInfoViewer;
