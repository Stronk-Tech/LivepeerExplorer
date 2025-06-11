import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import EventButtonAddress from "./EventButtonAddress";
import RoundViewer from "./RoundViewer";
import "./eventViewer.css";

const EventViewer = ({
  rewardEvents, updateEvents, withdrawEvents, transferEvents,
  redeemEvents, activateEvents, unbondEvents, stakeEvents,
  rewardActivated, updateActivated, withdrawActivated, transferActivated,
  redeemActivated, activateActivated, unbondActivated, stakeActivated,
  searchTerm, setSearchTerm, amountFilter, rounds
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showRoundModal, setShowRoundModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const eventsPerPage = 50;

  // Optimization: Sort rounds once and keep track of search index
  const [sortedRounds, setSortedRounds] = useState([]);
  const roundSearchIndex = useRef(0); // Use ref instead of state to avoid re-renders

  const currentRound = rounds && rounds.length > 0 ? rounds[rounds.length - 1].number : null;

  // Sort rounds once when rounds data changes
  useEffect(() => {
    if (rounds && rounds.length > 0) {
      // Sort rounds by number (ascending) - assuming round numbers are sequential
      const sorted = [...rounds].sort((a, b) => a.number - b.number);
      setSortedRounds(sorted);
      roundSearchIndex.current = 0; // Reset search index when rounds change

    } else {
      setSortedRounds([]);
      roundSearchIndex.current = 0;
    }
  }, [rounds]);

  const filterType = [
    { events: rewardEvents, activated: rewardActivated, type: "reward" },
    { events: updateEvents, activated: updateActivated, type: "update" },
    { events: withdrawEvents, activated: withdrawActivated, type: "withdraw" },
    { events: transferEvents, activated: transferActivated, type: "transfer" },
    { events: redeemEvents, activated: redeemActivated, type: "redeem" },
    { events: activateEvents, activated: activateActivated, type: "activate" },
    { events: unbondEvents, activated: unbondActivated, type: "unbond" },
    { events: stakeEvents, activated: stakeActivated, type: "stake" },
  ];

  // Combine and filter events
  let eventList = [];
  filterType.forEach(({ events, activated, type }) => {
    if (activated && events) {
      eventList = eventList.concat(
        events.map(event => ({ ...event, eventType: type }))
      );
    }
  });

  // Sort by blockTime (newest first)
  eventList.sort((a, b) => b.blockTime - a.blockTime);

  // Filter by search term
  if (searchTerm) {
    eventList = eventList.filter(event => {
      const searchLower = searchTerm.toLowerCase();
      return (
        event.address?.toLowerCase().includes(searchLower) ||
        event.to?.toLowerCase().includes(searchLower) ||
        event.from?.toLowerCase().includes(searchLower) ||
        event.transactionHash?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Filter by minimum amount
  if (amountFilter && parseFloat(amountFilter) > 0) {
    eventList = eventList.filter(event => {
      const amount = parseFloat(
        event.amount ||
        event.tokens ||
        event.fees ||
        event.value ||
        event.stake ||
        event.initialStake ||
        0
      );
      return amount >= parseFloat(amountFilter);
    });
  }

  // Pagination
  const totalEvents = eventList.length;
  const totalPages = Math.ceil(totalEvents / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = eventList.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [rewardActivated, updateActivated, withdrawActivated, transferActivated,
    redeemActivated, activateActivated, unbondActivated, stakeActivated, searchTerm, amountFilter]);

  const formatValue = (value) => {
    if (!value || value === "0") return "0";
    const num = parseFloat(value);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  const getFromToAddresses = (event) => {
    switch (event.eventType) {
      case 'reward':
        return { from: event.address, to: null };
      case 'update':
        return { from: event.address, to: null };
      case 'withdraw':
        return { from: event.address, to: null };
      case 'transfer':
        return { from: event.address, to: event.to };
      case 'redeem':
        return { from: event.address, to: null };
      case 'activate':
        return { from: event.address, to: null };
      case 'unbond':
        return { from: event.from, to: null };
      case 'stake':
        return { from: event.from, to: event.to };
      default:
        return { from: null, to: null };
    }
  };

  const handleRoundClick = (roundNumber) => {
    setSelectedRound(roundNumber);
    setShowRoundModal(true);
  };

  // Optimized function to find the round for an event
  const getRoundForEvent = (event) => {
    // If event already has a round, use it
    if (event.round) return event.round;

    // If no rounds data available, return null
    if (!sortedRounds || sortedRounds.length === 0) return null;

    // Now that we know rounds only have: blockNumber, blockTime, number
    // We need to find the round whose blockNumber is closest to (but not greater than) the event's blockNumber

    if (event.blockNumber) {
      // Search from our current index forward
      for (let i = Math.max(0, roundSearchIndex.current); i < sortedRounds.length; i++) {
        const round = sortedRounds[i];

        // If this round's block number is greater than the event's block number,
        // then the previous round (if it exists) is the correct one
        if (round.blockNumber > event.blockNumber) {
          if (i > 0) {
            const previousRound = sortedRounds[i - 1];
            roundSearchIndex.current = Math.max(0, i - 5); // Update search index
            return previousRound.number;
          }
          break;
        }

        // If this is the last round and event block is >= this round's block
        if (i === sortedRounds.length - 1 && event.blockNumber >= round.blockNumber) {
          roundSearchIndex.current = Math.max(0, i - 5);
          return round.number;
        }
      }

      // If not found in forward search, try backwards from current index
      for (let i = Math.min(roundSearchIndex.current, sortedRounds.length - 1); i >= 0; i--) {
        const round = sortedRounds[i];

        if (event.blockNumber >= round.blockNumber) {
          roundSearchIndex.current = Math.max(0, i - 5);
          return round.number;
        }
      }
    }

    // If we can't determine the round, return null to show "-"
    return null;
  };

  return (
    <div className="event-viewer-container">
      <div className="event-table-container">
        <table className="event-table">
          <thead>
            <tr>
              <th>Txn Hash</th>
              <th>Caller</th>
              <th>Method</th>
              <th>Block</th>
              <th>From → To</th>
              <th>Value</th>
              <th>Round</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event, index) => {
              const { from, to } = getFromToAddresses(event);
              const timestamp = moment(event.blockTime * 1000);
              const isoTimestamp = timestamp.format();
              const eventRound = getRoundForEvent(event);

              return (
                <tr key={`${event.transactionHash}-${index}`}>
                  <td>
                    <a
                      href={`https://etherscan.io/tx/${event.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hash-link"
                    >
                      {event.transactionHash.slice(0, 8)}...
                    </a>
                  </td>
                  <td>
                    <EventButtonAddress
                      address={event.address}
                      name=""
                      setSearchTerm={setSearchTerm}
                    />
                  </td>
                  <td>
                    <span
                      className="type-badge"
                      data-type={event.eventType}
                    >
                      {event.eventType}
                    </span>
                  </td>
                  <td>
                    <a
                      href={`https://etherscan.io/block/${event.blockNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block-link"
                    >
                      {event.blockNumber}
                    </a>
                  </td>
                  <td className="address-cell">
                    <div className="address-container">
                      {from && <EventButtonAddress address={from} name="From" setSearchTerm={setSearchTerm} />}
                      {to && (
                        <>
                          <span className="arrow">→</span>
                          <EventButtonAddress address={to} name="To" setSearchTerm={setSearchTerm} />
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="value-amount">
                      {event.amount ? `${formatValue(event.amount)}` :
                        event.tokens ? `${formatValue(event.tokens)}` :
                          event.fees ? `${formatValue(event.fees)}` :
                            event.value ? `${formatValue(event.value)}` :
                              event.stake ? `${formatValue(event.stake)}` :
                                event.initialStake ? `${formatValue(event.initialStake)}` : '—'}
                    </span>
                  </td>
                  <td>
                    {eventRound ? (
                      <button
                        className="round-button"
                        onClick={() => handleRoundClick(eventRound)}
                        title="View round details"
                      >
                        {eventRound}
                      </button>
                    ) : '—'}
                  </td>
                  <td>
                    <span
                      className="time-ago"
                      title={isoTimestamp}
                    >
                      {timestamp.fromNow()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startIndex + 1} to {Math.min(endIndex, totalEvents)} of {totalEvents} events
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            <span className="pagination-current">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Last
            </button>
          </div>
        </div>
      )}

      <RoundViewer
        roundNumber={selectedRound}
        isVisible={showRoundModal}
        onClose={() => {
          setShowRoundModal(false);
          setSelectedRound(null);
        }}
      />
    </div>
  );
};

export default EventViewer;
