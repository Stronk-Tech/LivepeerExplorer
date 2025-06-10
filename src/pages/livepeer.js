import React, { useState, useEffect } from 'react';
import "./livepeer.css";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { getOrchestratorInfo, clearOrchestrator } from '../actions/livepeer';
import EventViewer from '../components/eventViewer';
import Orchestrator from '../components/orchestratorViewer';

const defaultMaxShown = 50;

const Livepeer = () => {
  const [amountFilter, setAmountFilter] = useState("0");
  const [maxAmount, setMaxAmount] = useState(defaultMaxShown);
  const [prefill, setPrefill] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [redirectToHome, setRedirectToHome] = useState(false);

  // Filter toggle states (moved from EventViewer)
  const [rewardActivated, setRewardActivated] = useState(true);
  const [updateActivated, setUpdateActivated] = useState(true);
  const [withdrawActivated, setWithdrawActivated] = useState(true);
  const [transferActivated, setTransferActivated] = useState(true);
  const [redeemActivated, setRedeemActivated] = useState(true);
  const [activateActivated, setActivateActivated] = useState(true);
  const [unbondActivated, setUnbondActivated] = useState(true);
  const [stakeActivated, setStakeActivated] = useState(true);

  const dispatch = useDispatch();
  const livepeer = useSelector((state) => state.livepeerstate);

  useEffect(() => {
    const searchOrch = prefill.get('orchAddr');
    if (searchOrch && searchOrch !== "") {
      dispatch(getOrchestratorInfo(searchOrch));
      setSearchTerm(searchOrch);
    }
  }, [prefill, dispatch]);

  if (redirectToHome) {
    // Extract root domain and redirect there
    const hostname = window.location.hostname;
    const port = window.location.port;
    const parts = hostname.split('.');
    
    // Get the root domain (last two parts: domain.tld)
    const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    const protocol = window.location.protocol;
    
    // Include port if it exists
    const portSuffix = port ? `:${port}` : '';
    
    window.location.href = `${protocol}//${rootDomain}${portSuffix}`;
    return null;
  }

  let thisOrchObj;
  let headerString;
  if (livepeer.selectedOrchestrator) {
    thisOrchObj = livepeer.selectedOrchestrator;
    headerString = "Inspecting " + thisOrchObj.id;
  } else {
    headerString = "Livepeer On-Chain Explorer";
  }

  return (
    <div className="livepeer-container">
      <header className="livepeer-header">
        <div className="header-row-main">
          <div className='header-left'>
            <button className="home-button" onClick={() => setRedirectToHome(true)}>
              <img alt="" src="logo_centered.png" className="home-icon" />
            </button>
            <div className="search-container">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                placeholder="Search orchestrator addresses..."
              />
            </div>
          </div>
          <div className='header-right'>
            <button className="clear-button" onClick={() => {
              dispatch(clearOrchestrator());
              setSearchTerm("");
              setAmountFilter(0);
              setMaxAmount(defaultMaxShown);
            }}>
              ✖️ Clear
            </button>
          </div>
        </div>

        <div className="header-row-filters">
          <div className="filter-controls">
            <div className="amount-filter">
              <label className="filter-label">Min Amount:</label>
              <input
                type="number"
                value={amountFilter}
                onChange={(e) => setAmountFilter(e.target.value)}
                className="filter-input"
                placeholder="0"
              />
            </div>

            <div className="filter-buttons">
              <button
                className={`filter-button ${rewardActivated ? "active" : "inactive"}`}
                data-type="reward"
                onClick={() => setRewardActivated(!rewardActivated)}
              >
                Reward
              </button>
              <button
                className={`filter-button ${updateActivated ? "active" : "inactive"}`}
                data-type="update"
                onClick={() => setUpdateActivated(!updateActivated)}
              >
                Update
              </button>
              <button
                className={`filter-button ${withdrawActivated ? "active" : "inactive"}`}
                data-type="withdraw"
                onClick={() => setWithdrawActivated(!withdrawActivated)}
              >
                Withdraw
              </button>
              <button
                className={`filter-button ${transferActivated ? "active" : "inactive"}`}
                data-type="transfer"
                onClick={() => setTransferActivated(!transferActivated)}
              >
                Transfer
              </button>
              <button
                className={`filter-button ${redeemActivated ? "active" : "inactive"}`}
                data-type="redeem"
                onClick={() => setRedeemActivated(!redeemActivated)}
              >
                Redeem
              </button>
              <button
                className={`filter-button ${activateActivated ? "active" : "inactive"}`}
                data-type="activate"
                onClick={() => setActivateActivated(!activateActivated)}
              >
                Activate
              </button>
              <button
                className={`filter-button ${stakeActivated ? "active" : "inactive"}`}
                data-type="stake"
                onClick={() => setStakeActivated(!stakeActivated)}
              >
                Stake
              </button>
              <button
                className={`filter-button ${unbondActivated ? "active" : "inactive"}`}
                data-type="unbond"
                onClick={() => setUnbondActivated(!unbondActivated)}
              >
                Unbond
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="livepeer-main">
        <EventViewer
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          amountFilter={amountFilter}
          rewardEvents={livepeer.rewardEvents}
          updateEvents={livepeer.updateEvents}
          withdrawEvents={[...(livepeer.withdrawStakeEvents || []), ...(livepeer.withdrawFeesEvents || [])]}
          transferEvents={livepeer.transferTicketEvents}
          redeemEvents={livepeer.redeemTicketEvents}
          activateEvents={livepeer.activateEvents}
          unbondEvents={livepeer.unbondEvents}
          stakeEvents={livepeer.stakeEvents}
          rewardActivated={rewardActivated}
          updateActivated={updateActivated}
          withdrawActivated={withdrawActivated}
          transferActivated={transferActivated}
          redeemActivated={redeemActivated}
          activateActivated={activateActivated}
          unbondActivated={unbondActivated}
          stakeActivated={stakeActivated}
          rounds={livepeer.rounds}
        />
      </main>

      <Orchestrator
        thisOrchestrator={thisOrchObj}
        isVisible={!!livepeer.selectedOrchestrator}
        onClose={() => { }}
      />
    </div>
  );
};

export default Livepeer;
