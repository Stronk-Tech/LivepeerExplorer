import React, { useEffect, useState } from "react";
import {
  getOrchestratorInfo, getEnsInfo, setCachedOrch, getOrchestratorInfoSilent
} from "../actions/livepeer";
import { useDispatch, useSelector } from 'react-redux';
import "./EventButtonAddress.css";

const EventButtonAddress = ({ address, name, setSearchTerm, compact = false }) => {
  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);
  const [hasRefreshed, setRefresh] = useState(false);
  const [orchInfo, setOrchInfo] = useState(null);
  const now = new Date().getTime();

  const abbreviate = (str, maxLength = 10) => {
    if (str.length <= maxLength) return str;
    const halfLength = Math.floor((maxLength - 3) / 2);
    return `${str.slice(0, halfLength)}...${str.slice(-halfLength)}`;
  };

  useEffect(() => {
    let thisInfo = null;
    let thisDomain = null;

    if (livepeer.ensDomainMapping && !hasRefreshed) {
      for (const thisAddr of livepeer.ensDomainMapping) {
        if (thisAddr.address === address) {
          thisDomain = thisAddr;
          if (now - thisAddr.timestamp < 86400000) {
            break;
          }
          if (!hasRefreshed) {
            getEnsInfo(address);
            setRefresh(true);
          }
          break;
        }
      }
      if (thisDomain == null && !hasRefreshed) {
        setRefresh(true);
        getEnsInfo(address);
      }
    }

    if (livepeer.ensInfoMapping && thisDomain && thisDomain.domain && !hasRefreshed) {
      for (const thisAddr of livepeer.ensInfoMapping) {
        if (thisAddr.domain === thisDomain.domain) {
          thisInfo = thisAddr;
          if (now - thisAddr.timestamp < 3600000) {
            break;
          }
          if (!hasRefreshed) {
            getEnsInfo(address);
            setRefresh(true);
          }
          break;
        }
      }
      if (thisInfo == null && !hasRefreshed) {
        getEnsInfo(address);
        setRefresh(true);
      }
    }

    if (thisInfo && thisInfo !== orchInfo) {
      setOrchInfo(thisInfo);
    }
  }, [livepeer.ensDomainMapping, address, hasRefreshed, now]);

  useEffect(() => {
    if (livepeer.orchInfo) {
      for (const thisOrch of livepeer.orchInfo) {
        if (thisOrch.id === address) {
          return;
        }
      }
    }
    getOrchestratorInfoSilent(address);
  }, [livepeer.orchInfo, address]);

  let thisName;
  let thisIcon;

  const displayText = orchInfo && orchInfo.domain ? orchInfo.domain : address;

  // Compact mode for table layout
  if (compact) {
    return (
      <button
        className="event-button-address-compact"
        onClick={() => setSearchTerm(address)}
        title={displayText}
      >
        {abbreviate(displayText, 12)}
      </button>
    );
  }

  thisName = (
    <div className="event-button-address-text-container">
      <p className="event-button-address-text abbreviated">
        {abbreviate(displayText)}
      </p>
    </div>
  );

  if (orchInfo && orchInfo.avatar) {
    thisIcon = (
      <a
        className="event-button-address-icon"
        target="_blank"
        rel="noopener noreferrer"
        href={`https://app.ens.domains/name/${orchInfo.domain}/details`}
      >
        <img alt="" src={orchInfo.avatar.url} className="event-button-address-img" />
      </a>
    );
  }

  return (
    <div className="event-button-address-container">
      <a
        className="event-button-address-icon"
        rel="noopener noreferrer"
        target="_blank"
        href={`https://explorer.livepeer.org/accounts/${address}`}
        title={`View ${address} on Livepeer Explorer`}
      >
        <img alt="" src="livepeer.png" className="event-button-address-img" />
      </a>
      <button
        className="event-button-address-search-btn"
        onClick={() => setSearchTerm(address)}
        title={`Search for ${address}`}
      >
        <span>🔎</span>
      </button>
      {thisIcon}
      <button
        className="event-button-address-btn event-button-address-info"
        onClick={() => {
          // Check if cached as an orchestrator
          if (livepeer.orchInfo) {
            for (const thisOrch of livepeer.orchInfo) {
              if (thisOrch.id === address) {
                const now = new Date().getTime();
                if (now - thisOrch.lastGet < 120000) {
                  dispatch(setCachedOrch(thisOrch));
                  return;
                }
                break;
              }
            }
          }
          dispatch(getOrchestratorInfo(address));
        }}
        title={address}
      >
        <div className="event-button-address-row">
          <span>{name}</span> {thisName}
        </div>
      </button>
    </div>
  );
};

export default EventButtonAddress;
