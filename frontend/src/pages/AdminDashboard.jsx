import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFileText,
  FiEdit3,
  FiRefreshCw,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiEye,
  FiDatabase,
  FiLayers,
  FiPlusCircle,
  FiActivity
} from "react-icons/fi";
import apiClient from "../api/client";
import toast from "react-hot-toast";

// Reusable Stat Card Component
const StatCard = ({ title, value, subtitle, icon: Icon, trend, colorClass = "blue" }) => {
  const colorMap = {
    blue: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100 hover:border-blue-300",
    green: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100 hover:border-emerald-300",
    red: "from-rose-500/10 to-orange-500/10 text-rose-600 border-rose-100 hover:border-rose-300",
    amber: "from-amber-500/10 to-yellow-500/10 text-amber-600 border-amber-100 hover:border-amber-300",
    purple: "from-purple-500/10 to-fuchsia-500/10 text-purple-600 border-purple-100 hover:border-purple-300"
  };

  return (
    <div className={`p-6 bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-start justify-between group`}>
      <div className="space-y-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900 tracking-tight">{value}</span>
          {trend && (
            <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <FiTrendingUp className="w-3 h-3 mr-0.5" />
              {trend}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      <div className={`p-3 rounded-lg bg-gradient-to-br ${colorMap[colorClass] || colorMap.blue} transition-all duration-300 group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/analytics");
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSyncNews = async () => {
    try {
      setSyncing(true);
      toast.loading("Initiating news synchronization...", { id: "sync" });
      const response = await apiClient.post("/news/sync");
      if (response.data && response.data.success) {
        toast.success("News synchronized successfully!", { id: "sync" });
        fetchDashboardData();
      } else {
        toast.error("Sync completed with issues.", { id: "sync" });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast.error(error.response?.data?.message || "Sync request failed.", { id: "sync" });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl lg:col-span-2"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentActivities = data?.activities || [];
  const chartData = data?.charts || {};

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-sm text-gray-500">Real-time metrics, content reviews, and user activities.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={handleSyncNews}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm"
          >
            <FiDatabase className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync GNews
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers || 0}
          subtitle="Platform registered members"
          icon={FiUsers}
          colorClass="blue"
        />
        <StatCard
          title="Total Articles"
          value={metrics.totalNews || 0}
          subtitle="Synced external articles"
          icon={FiFileText}
          colorClass="purple"
        />
        <StatCard
          title="Pending Blogs"
          value={metrics.pendingBlogs || 0}
          subtitle="User submissions awaiting review"
          icon={FiEdit3}
          trend={metrics.pendingBlogs > 0 ? `${metrics.pendingBlogs} active` : null}
          colorClass="amber"
        />
        <StatCard
          title="Total Blog Views"
          value={metrics.totalViews || 0}
          subtitle="Cumulated reader engagements"
          icon={FiEye}
          colorClass="green"
        />
      </div>

      {/* Detailed Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Approved News"
          value={metrics.approvedNews || 0}
          subtitle="Visible on feeds"
          icon={FiCheckCircle}
          colorClass="green"
        />
        <StatCard
          title="Rejected News"
          value={metrics.rejectedNews || 0}
          subtitle="Removed/Flagged news articles"
          icon={FiXCircle}
          colorClass="red"
        />
        <StatCard
          title="Approved Blogs"
          value={metrics.approvedBlogs || 0}
          subtitle="Community stories published"
          icon={FiCheckCircle}
          colorClass="green"
        />
        <StatCard
          title="Rejected Blogs"
          value={metrics.rejectedBlogs || 0}
          subtitle="Feedback shared with authors"
          icon={FiXCircle}
          colorClass="red"
        />
      </div>

      {/* Main Content Layout: Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Charts Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">News Synchronizations (Last 10 Entry Days)</h3>
              <span className="text-[10px] text-gray-400">GNews source sync</span>
            </div>
            
            {/* Custom Responsive SVG Bar Chart */}
            <div className="h-64 w-full flex items-end justify-between pt-6 border-b border-gray-100">
              {chartData.newsPublished && chartData.newsPublished.length > 0 ? (
                chartData.newsPublished.slice(-10).map((d, index) => {
                  const maxCount = Math.max(...chartData.newsPublished.map(n => n.count), 1);
                  const pct = (d.count / maxCount) * 85; // Max 85% height
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 group h-full justify-end">
                      <div className="relative w-8 bg-blue-500/80 group-hover:bg-blue-600 rounded-t-sm transition-all duration-300 cursor-pointer" style={{ height: `${pct || 5}%` }}>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 shadow-lg">
                          {d.count} Articles
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-2 rotate-45 origin-left truncate max-w-[45px]">{d._id.substring(5)}</span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No publishing sync logs available yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Short Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/admin/requests"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-gray-700 hover:text-blue-600 transition-all text-center group"
                >
                  <FiAlertCircle className="w-5 h-5 mb-2 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Review Pending</span>
                </Link>
                <Link
                  to="/admin/users"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-gray-700 hover:text-blue-600 transition-all text-center group"
                >
                  <FiPlusCircle className="w-5 h-5 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Manage Users</span>
                </Link>
                <button
                  onClick={handleSyncNews}
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-gray-700 hover:text-blue-600 transition-all text-center group"
                >
                  <FiDatabase className="w-5 h-5 mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Sync GNews</span>
                </button>
                <Link
                  to="/admin/analytics"
                  className="flex flex-col items-center justify-center p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-500 hover:bg-blue-50/20 text-gray-700 hover:text-blue-600 transition-all text-center group"
                >
                  <FiLayers className="w-5 h-5 mb-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold">Full Analytics</span>
                </Link>
              </div>
            </div>

            {/* Category distribution summary */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Top News Categories</h3>
              <div className="space-y-3">
                {chartData.categoryDistribution && chartData.categoryDistribution.slice(0, 4).map((c, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>{c.name}</span>
                      <span>{c.value} articles</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (c.value / (metrics.totalNews || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right: Recent Activity Timeline */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <FiActivity className="text-blue-600 w-5 h-5" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Recent System Activity</h3>
          </div>

          <div className="flow-root">
            {recentActivities.length > 0 ? (
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activityIdx}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === "user_registered" ? "bg-blue-50 text-blue-600" :
                            activity.type === "blog_approved" ? "bg-emerald-50 text-emerald-600" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {activity.type === "user_registered" && <FiUsers className="w-4 h-4" />}
                            {activity.type === "blog_approved" && <FiCheckCircle className="w-4 h-4" />}
                            {activity.type === "blog_submitted" && <FiEdit3 className="w-4 h-4" />}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-xs text-gray-600 font-medium">{activity.message}</p>
                          </div>
                          <div className="text-right text-[10px] whitespace-nowrap text-gray-400 font-semibold uppercase">
                            {new Date(activity.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-20 text-gray-400 text-xs">
                No recent system activity recorded today.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
