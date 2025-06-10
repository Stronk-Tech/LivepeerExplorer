import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useDispatch } from 'react-redux';
import { clearOrchestrator } from '../actions/livepeer';
import OrchDelegatorViewer from "./OrchDelegatorViewer";
import OrchInfoViewer from "./OrchInfoViewer";
import "./orchestratorViewer.css";

const Orchestrator = ({ thisOrchestrator, isVisible, onClose }) => {
  const dispatch = useDispatch();

  // Handle click outside modal
  const handleOverlayClick = useCallback((event) => {
    event.stopPropagation();
    if (event.target.classList.contains('modal-overlay')) {
      dispatch(clearOrchestrator());
      if (onClose) onClose();
    }
  }, [dispatch, onClose]);

  // Handle escape key to close modal
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        dispatch(clearOrchestrator());
        if (onClose) onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, dispatch, onClose]);

  // Lock/unlock body scroll when modal visibility changes
  useEffect(() => {
    if (isVisible) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Store the original styles
      const originalStyles = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };

      // Apply modal styles
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyles.overflow;
        document.body.style.paddingRight = originalStyles.paddingRight;
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleCloseClick = () => {
    dispatch(clearOrchestrator());
    if (onClose) onClose();
  };

  const modalContent = (
    <div
      className={`modal-overlay ${isVisible ? "show" : ""}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="orchestrator-modal-title"
    >
      <div
        className="orchestrator-modal show"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="orchestrator-modal-header">
          <h2 className="orchestrator-modal-title" id="orchestrator-modal-title">
            {thisOrchestrator?.delegator?.id ? `Viewing ${thisOrchestrator.delegator.id}` : 'Address Details'}
          </h2>
          <button
            className="orchestrator-modal-close"
            onClick={handleCloseClick}
            aria-label="Close modal"
          >×</button>
        </div>
        <div className="orchestrator-modal-content">
          {thisOrchestrator ? (
            <div className="host-info">
              <div className={`flex-container column equal-height`}>
                <OrchInfoViewer
                  rewardCut={thisOrchestrator.rewardCut}
                  feeShare={thisOrchestrator.feeShare}
                  totalStake={thisOrchestrator.totalStake}
                  totalVolumeETH={thisOrchestrator.totalVolumeETH}
                  totalVolumeUSD={thisOrchestrator.totalVolumeUSD}
                  delegator={thisOrchestrator.delegator}
                />
                <OrchDelegatorViewer delegators={thisOrchestrator.delegators} />
              </div>
            </div>
          ) : (
            <div className="host-info">
              <div className={`flex-container full-margin column`}>
                <div className="row-align-left">
                  <img alt="" src="livepeer.png" width="30" height="30" />
                  <h3>Orchestrator Info</h3>
                </div>
                <div className="row-align-left">
                  <p>Inspect an Orchestrator by clicking on their address</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Orchestrator;
