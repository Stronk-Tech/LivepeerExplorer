import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  getQuotes, getBlockchainData, getCurrentOrchestratorInfo,
  getAllEnsDomains, getAllEnsInfo, getAllOrchScores, getAllOrchInfo,
  getAllDelInfo, getAllMonthlyStats, getAllUpdateEvents, getAllRewardEvents,
  getAllClaimEvents, getAllWithdrawStakeEvents, getAllWithdrawFeesEvents,
  getAllTransferTicketEvents, getAllRedeemTicketEvents, getAllActivateEvents,
  getAllUnbondEvents, getAllStakeEvents, getAllCommissions, getAllTotalStakes,
  hasAnyRefresh, getAllRounds
} from "../actions/livepeer";
import './loadingScreen.css';

const refreshInterval = 60000;
const refreshEventsInterval = 10000;

const Startup = (obj) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  const messageRef = useRef(null);

  const refreshAllZeData = () => {
    console.log("Refreshing Livepeer data...");
    dispatch(getQuotes());
    dispatch(getBlockchainData());
    dispatch(getCurrentOrchestratorInfo());
  };

  const refreshEvents = async () => {
    console.log("Checking for Events update...");
    const requiresRefresh = await hasAnyRefresh();
    if (requiresRefresh) {
      console.log("Events require update...");
      dispatch(getAllMonthlyStats(true));
      dispatch(getAllUpdateEvents(true));
      dispatch(getAllRewardEvents(true));
      dispatch(getAllClaimEvents(true));
      dispatch(getAllWithdrawStakeEvents(true));
      dispatch(getAllWithdrawFeesEvents(true));
      dispatch(getAllTransferTicketEvents(true));
      dispatch(getAllRedeemTicketEvents(true));
      dispatch(getAllActivateEvents(true));
      dispatch(getAllUnbondEvents(true));
      dispatch(getAllStakeEvents(true));
    }
  };

  const refreshENS = async () => {
    console.log("Refreshing ENS data...");
    await Promise.all([
      dispatch(getAllEnsDomains()),
      dispatch(getAllEnsInfo())
    ]);
  };

  const refreshStaticProps = async () => {
    console.log("Refreshing global data...");
    await Promise.all([
      dispatch(getAllOrchInfo()),
      dispatch(getAllDelInfo()),
      dispatch(getAllOrchScores()),
      dispatch(getAllMonthlyStats(false)),
      dispatch(getAllCommissions()),
      dispatch(getAllTotalStakes()),
      dispatch(getAllUpdateEvents(false)),
      dispatch(getAllRewardEvents(false)),
      dispatch(getAllClaimEvents(false)),
      dispatch(getAllWithdrawStakeEvents(false)),
      dispatch(getAllWithdrawFeesEvents(false)),
      dispatch(getAllTransferTicketEvents(false)),
      dispatch(getAllRedeemTicketEvents(false)),
      dispatch(getAllActivateEvents(false)),
      dispatch(getAllUnbondEvents(false)),
      dispatch(getAllStakeEvents(false)),
      dispatch(getAllRounds())
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        refreshAllZeData();
        await refreshENS();
        await refreshStaticProps();
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(refreshAllZeData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  useEffect(() => {
    if (refreshEventsInterval) {
      const intervalEvents = setInterval(refreshEvents, refreshEventsInterval);
      return () => clearInterval(intervalEvents);
    }
  }, [refreshEventsInterval]);

  useEffect(() => {
    let directionX = 1; // Default direction
    let directionY = 1;

    // Initialize position within screen bounds and set initial direction
    if (messageRef.current) {
      const { clientWidth, clientHeight } = document.documentElement;
      const { offsetWidth, offsetHeight } = messageRef.current;

      // Random initial position within bounds
      const startX = Math.random() * (clientWidth - offsetWidth);
      const startY = Math.random() * (clientHeight - offsetHeight);

      messageRef.current.style.left = `${startX}px`;
      messageRef.current.style.top = `${startY}px`;

      // Determine initial direction based on proximity to the closest edge
      const distanceToLeft = startX;
      const distanceToRight = clientWidth - (startX + offsetWidth);
      const distanceToTop = startY;
      const distanceToBottom = clientHeight - (startY + offsetHeight);

      // Set directionX based on left or right edge proximity
      if (distanceToLeft < distanceToRight) {
        directionX = -1; // Move left
      } else {
        directionX = 1; // Move right
      }

      // Set directionY based on top or bottom edge proximity
      if (distanceToTop < distanceToBottom) {
        directionY = -1; // Move up
      } else {
        directionY = 1; // Move down
      }
    }

    const moveMessage = () => {
      if (messageRef.current) {
        const { clientWidth, clientHeight } = document.documentElement;
        const { offsetWidth, offsetHeight } = messageRef.current;

        let newX = parseFloat(messageRef.current.style.left || 0) + directionX * 5;
        let newY = parseFloat(messageRef.current.style.top || 0) + directionY * 5;

        // Boundary check with exact edge positioning
        if (newX < 0) {
          newX = 0;
          directionX = 1; // Move right
        } else if (newX + offsetWidth > clientWidth) {
          newX = clientWidth - offsetWidth;
          directionX = -1; // Move left
        }

        if (newY < 0) {
          newY = 0;
          directionY = 1; // Move down
        } else if (newY + offsetHeight > clientHeight) {
          newY = clientHeight - offsetHeight;
          directionY = -1; // Move up
        }

        messageRef.current.style.left = `${newX}px`;
        messageRef.current.style.top = `${newY}px`;
      }
    };

    const interval = setInterval(moveMessage, 20);
    return () => clearInterval(interval);
  }, []);

  const texts = [
    "Decrypting the mysteries of the internet...",
    "Warming up the flux capacitor...",
    "Charging the photon blasters...",
    "Bribing the loading bar...",
    "Counting pixels...",
    "Unleashing the hamsters on the wheels...",
    "Aligning the stars...",
    "Locating the any key...",
    "Calibrating quantum entanglement...",
    "Feeding the hamsters powering our servers...",
    "Hiding the gremlins...",
    "Sharpening pixels...",
    "Charging our joke generator...",
    "Cooking up some data packets...",
    "Breaking encryption with sheer willpower...",
    "Assembling the perfect loading experience...",
    "Downloading more RAM...",
    "Locating the server on Google Maps...",
    "Calling tech support...",
    "Picking the best font for the loading screen...",
    "Polishing the pixels...",
    "Offering data sacrifices...",
    "Trying to look busy...",
    "Simulating faster speeds...",
    "Appeasing the bandwidth gods...",
    "Serving up data, fresh from the farm...",
    "Training the AI to understand this request...",
    "Smoothing out the bandwidth wrinkles...",
    "Defragging the Internet...",
    "Checking the internet's oil levels...",
    "Revving the engines...",
    "Aligning cosmic rays...",
    "Processing all the bytes...",
    "Listening for server whispers...",
    "Tickling the loading bar...",
    "Unwrapping digital presents...",
    "Packing pixels for transport...",
    "Petting the internet cats...",
    "Baking some byte cookies...",
    "Dusting off the server shelves...",
    "Setting the mood lighting...",
];

  if (isLoaded) {
    console.log("Rendering Application");
    return obj.children;
  } else {
    console.log("Rendering Loading Screen");
    return (
      <div className="loading-screen-container">
        <div className="loading-vertical-divider" />
        <div className="loading-screen-row">
          <img alt="" src={"https://stronk.rocks/avatar.png?" + performance.now()} className="loading-screen-logo" />
        </div>
        <div className="loading-vertical-divider" />
        <div className="loading-screen-message" ref={messageRef}>
          <h1>{texts[Math.floor(Math.random() * texts.length)]}</h1>
        </div>
      </div>
    );
  }
};

export default Startup;
