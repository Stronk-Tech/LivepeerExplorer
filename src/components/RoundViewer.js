import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getRoundInfo } from '../util/livepeer';
import './RoundViewer.css';

const RoundViewer = ({ roundNumber, isVisible, onClose }) => {
  const [roundData, setRoundData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && roundNumber) {
      setLoading(true);
      getRoundInfo(roundNumber)
        .then(response => response.json())
        .then(data => {
          setRoundData(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching round info:', error);
          setLoading(false);
        });
    }
  }, [isVisible, roundNumber]);

  // Handle escape key to close
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  // Lock/unlock body scroll when modal visibility changes
  useEffect(() => {
    if (isVisible) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      const originalStyles = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };

      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        document.body.style.overflow = originalStyles.overflow;
        document.body.style.paddingRight = originalStyles.paddingRight;
      };
    }
  }, [isVisible]);

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains('round-modal-overlay')) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const modalContent = (
    <div
      className="round-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="round-modal-title"
    >
      <div className="round-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="round-modal-header">
          <h2 id="round-modal-title" className="round-modal-title">
            Round {roundNumber}
          </h2>
          <button
            className="round-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="round-modal-body">
          {loading ? (
            <div className="round-loading">Loading round information...</div>
          ) : roundData ? (
            <div className="round-info-grid">
              <div className="round-info-item">
                <span className="round-info-label">Round Number</span>
                <span className="round-info-value">{roundData.number || roundNumber}</span>
              </div>
              
              {roundData.startBlock && (
                <div className="round-info-item">
                  <span className="round-info-label">Start Block</span>
                  <span className="round-info-value">{roundData.startBlock}</span>
                </div>
              )}
              
              {roundData.endBlock && (
                <div className="round-info-item">
                  <span className="round-info-label">End Block</span>
                  <span className="round-info-value">{roundData.endBlock}</span>
                </div>
              )}
              
              {roundData.duration && (
                <div className="round-info-item">
                  <span className="round-info-label">Duration (blocks)</span>
                  <span className="round-info-value">{roundData.duration}</span>
                </div>
              )}
              
              {roundData.timestamp && (
                <div className="round-info-item">
                  <span className="round-info-label">Timestamp</span>
                  <span className="round-info-value">
                    {new Date(roundData.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
              )}
              
              {roundData.totalReward && (
                <div className="round-info-item">
                  <span className="round-info-label">Total Reward</span>
                  <span className="round-info-value">{parseFloat(roundData.totalReward).toFixed(4)} LPT</span>
                </div>
              )}
              
              {roundData.mintedTokens && (
                <div className="round-info-item">
                  <span className="round-info-label">Minted Tokens</span>
                  <span className="round-info-value">{parseFloat(roundData.mintedTokens).toFixed(4)} LPT</span>
                </div>
              )}
              
              {roundData.totalStake && (
                <div className="round-info-item">
                  <span className="round-info-label">Total Stake</span>
                  <span className="round-info-value">{parseFloat(roundData.totalStake).toFixed(2)} LPT</span>
                </div>
              )}
              
              {roundData.participationRate && (
                <div className="round-info-item">
                  <span className="round-info-label">Participation Rate</span>
                  <span className="round-info-value">{(roundData.participationRate * 100).toFixed(2)}%</span>
                </div>
              )}
            </div>
          ) : (
            <div className="round-error">Failed to load round information</div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoundViewer; 