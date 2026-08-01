import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function AnalyticsPage() {
  const [spendingData, setSpendingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await api.getSpendingAnalytics();
        setSpendingData(data);
      } catch (err) {
        console.error('Error fetching spending analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      <AnalyticsCharts spendingData={spendingData} />
    </div>
  );
}
