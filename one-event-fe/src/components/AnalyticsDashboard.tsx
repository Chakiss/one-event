import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { Calendar, Users, TrendingUp, DollarSign, Star } from 'lucide-react';

interface AnalyticsData {
  totalRegistrations: number;
  totalEvents: number;
  conversionRate: number;
  revenue: number;
  registrationTrends: Array<{
    date: string;
    registrations: number;
    events: number;
  }>;
  eventTypeDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  locationAnalytics: Array<{
    location: string;
    events: number;
    registrations: number;
  }>;
  timeSlotAnalytics: Array<{
    hour: string;
    registrations: number;
  }>;
  topEvents: Array<{
    id: number;
    title: string;
    registrations: number;
    capacity: number;
    fillRate: number;
  }>;
  registrationSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

const COLORS = ['#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d'];

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState<'registrations' | 'events' | 'revenue'>('registrations');

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API calls
      const mockData: AnalyticsData = {
        totalRegistrations: 1247,
        totalEvents: 34,
        conversionRate: 68.5,
        revenue: 45670,
        registrationTrends: [
          { date: '2024-01-01', registrations: 45, events: 3 },
          { date: '2024-01-08', registrations: 78, events: 5 },
          { date: '2024-01-15', registrations: 124, events: 8 },
          { date: '2024-01-22', registrations: 156, events: 6 },
          { date: '2024-01-29', registrations: 189, events: 9 },
          { date: '2024-02-05', registrations: 234, events: 12 },
          { date: '2024-02-12', registrations: 187, events: 7 },
        ],
        eventTypeDistribution: [
          { name: 'Conference', value: 35, color: '#dc2626' },
          { name: 'Workshop', value: 28, color: '#059669' },
          { name: 'Networking', value: 20, color: '#d97706' },
          { name: 'Seminar', value: 12, color: '#7c3aed' },
          { name: 'Other', value: 5, color: '#0891b2' },
        ],
        locationAnalytics: [
          { location: 'Bangkok', events: 12, registrations: 456 },
          { location: 'Chiang Mai', events: 8, registrations: 234 },
          { location: 'Phuket', events: 6, registrations: 189 },
          { location: 'Online', events: 15, registrations: 567 },
          { location: 'Pattaya', events: 4, registrations: 123 },
        ],
        timeSlotAnalytics: [
          { hour: '09:00', registrations: 67 },
          { hour: '10:00', registrations: 89 },
          { hour: '11:00', registrations: 156 },
          { hour: '14:00', registrations: 234 },
          { hour: '15:00', registrations: 198 },
          { hour: '16:00', registrations: 145 },
          { hour: '19:00', registrations: 234 },
          { hour: '20:00', registrations: 178 },
        ],
        topEvents: [
          { id: 1, title: 'Tech Conference 2024', registrations: 245, capacity: 300, fillRate: 81.7 },
          { id: 2, title: 'Marketing Workshop', registrations: 89, capacity: 100, fillRate: 89.0 },
          { id: 3, title: 'Startup Networking', registrations: 156, capacity: 200, fillRate: 78.0 },
          { id: 4, title: 'Design Thinking Seminar', registrations: 67, capacity: 80, fillRate: 83.8 },
          { id: 5, title: 'Digital Transformation', registrations: 123, capacity: 150, fillRate: 82.0 },
        ],
        registrationSources: [
          { source: 'Direct', count: 456, percentage: 36.6 },
          { source: 'Social Media', count: 345, percentage: 27.7 },
          { source: 'Email Campaign', count: 234, percentage: 18.8 },
          { source: 'Partner Sites', count: 156, percentage: 12.5 },
          { source: 'Other', count: 56, percentage: 4.5 },
        ],
      };
      
      setAnalytics(mockData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(value);
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'registrations': return '#dc2626';
      case 'events': return '#059669';
      case 'revenue': return '#d97706';
      default: return '#6b7280';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your event performance and insights</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRegistrations.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+12.5% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalEvents}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+8.3% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+5.7% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.revenue)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">+18.2% from last month</span>
          </div>
        </div>
      </div>

      {/* Registration Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Registration Trends</h2>
          <div className="flex space-x-2">
            {(['registrations', 'events', 'revenue'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  selectedMetric === metric
                    ? 'bg-red-100 text-red-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={analytics.registrationTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              fill={getMetricColor(selectedMetric)}
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Type Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.eventTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {analytics.eventTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time Slot Analytics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Time Slots</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.timeSlotAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="registrations" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Analytics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Location Performance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.locationAnalytics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="events" fill="#059669" name="Events" />
            <Bar dataKey="registrations" fill="#dc2626" name="Registrations" />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Events and Registration Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Events */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Events</h2>
          <div className="space-y-3">
            {analytics.topEvents.map((event, index) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-r ${
                    index === 0 ? 'from-yellow-400 to-yellow-600' :
                    index === 1 ? 'from-gray-400 to-gray-600' :
                    index === 2 ? 'from-orange-400 to-orange-600' :
                    'from-blue-400 to-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-600">
                      {event.registrations}/{event.capacity} registered
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{event.fillRate}%</p>
                  <p className="text-sm text-gray-600">Fill Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Registration Sources */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Registration Sources</h2>
          <div className="space-y-3">
            {analytics.registrationSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-gray-900">{source.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{source.count}</span>
                  <span className="text-sm font-medium text-gray-900">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
