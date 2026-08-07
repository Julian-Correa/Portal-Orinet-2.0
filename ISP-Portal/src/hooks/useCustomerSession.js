import { useState, useEffect } from "react";

const SESSION_KEY = "orinet_portal_session";

export function useCustomerSession() {
  const [session, setSessionState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error reading session from sessionStorage", e);
      return null;
    }
  });

  const setSession = (newSession) => {
    try {
      if (newSession === null) {
        sessionStorage.removeItem(SESSION_KEY);
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      }
      setSessionState(newSession);
    } catch (e) {
      console.error("Error writing session to sessionStorage", e);
      setSessionState(newSession); // fallback to react state
    }
  };

  const updateCustomer = (nextCustomer) => {
    setSession((previousSession) =>
      previousSession ? { ...previousSession, customer: nextCustomer } : previousSession
    );
  };

  const logout = () => {
    setSession(null);
  };

  return { session, setSession, updateCustomer, logout };
}
