import React, { useState, useEffect } from 'react';
import { pumpAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { PumpStats } from '../types/auth';
import './PumpButton.css';

const PumpButton: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [lastPumpTime, setLastPumpTime] = useState<string | null>(null);
  const [isPumped, setIsPumped] = useState(false);
  const [stats, setStats] = useState<PumpStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await pumpAPI.getStats();
      setStats(data);
      setLastPumpTime(data.lastPumpAt || null);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handlePump = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await pumpAPI.sendPump();
      setLastPumpTime(response.timestamp);
      setIsPumped(true);
      
      // Reset the pumped state after animation
      setTimeout(() => setIsPumped(false), 2000);
      
    } catch (error: any) {
      console.error('Failed to send pump:', error);
      alert(error.response?.data?.error || 'Failed to send pump message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastPump = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now';
    }
  };

  return (
    <div className="pump-container">
      <div className="pump-header">
        <div className="user-info">
          <h1>Welcome, {user?.username}! 💪</h1>
          <p>Ready to let your Discord community know you're getting pumped?</p>
        </div>
        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="pump-main">
        <div className="pump-button-container">
          <button
            className={`pump-button ${isPumped ? 'pumped' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handlePump}
            disabled={isLoading}
          >
            <div className="pump-button-content">
              <span className="pump-emoji">💪</span>
              <span className="pump-text">
                {isLoading ? 'Sending...' : isPumped ? 'PUMPED!' : 'Getting Pumped'}
              </span>
            </div>
            <div className="pump-ripple"></div>
          </button>
        </div>

        {lastPumpTime && (
          <div className="last-pump">
            <p>Last pumped: {formatLastPump(lastPumpTime)}</p>
          </div>
        )}

        {!stats?.hasDiscordSetup && (
          <div className="setup-info">
            <p>🔧 Setting up your Discord channel on first pump...</p>
          </div>
        )}
      </div>

      <div className="app-info">
        <h3>How it works:</h3>
        <ol>
          <li>Hit the "Getting Pumped" button when you start your workout</li>
          <li>A message gets posted to your personal Discord channel</li>
          <li>Your gym community gets notified instantly!</li>
        </ol>
      </div>
    </div>
  );
};

export default PumpButton;