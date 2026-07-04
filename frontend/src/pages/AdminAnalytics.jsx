import React, { useState, useEffect } from "react";
import apiClient from "../api/client";
import {
  FiActivity,
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiEye,
  FiPieChart,
  FiLayers,
  FiAward
} from "react-icons/fi";
import toast from "react-hot-toast";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/admin/analytics");
      if (response.data && response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load detailed platform statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl col-span-2"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};

  return (
    <div className="space-y-8 animate-fade-in text-gray-800">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Platform Analytics</h2>
        <p className="text-sm text-gray-500">In-depth breakdown of system utilization, contributor stats, and category distribution.</p>
      </div>

      {/* Grid overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* User registration chart */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <FiUsers className="text-blue-500" />
            User Registrations (Last 10 Entry Days)
          </h3>
          <div className="h-64 w-full flex items-end justify-between pt-6 border-b border-gray-100">
            {charts.userRegistrations && charts.userRegistrations.length > 0 ? (
              charts.userRegistrations.slice(-10).map((d, i) => {
                const maxCount = Math.max(...charts.userRegistrations.map(x => x.count), 1);
                const pct = (d.count / maxCount) * 85;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                    <div className="relative w-8 bg-blue-500 hover:bg-blue-600 rounded-t-sm transition-all cursor-pointer" style={{ height: `${pct || 4}%` }}>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                        {d.count} New Users
                      </div>
                    </div>
                    <span className="text-[9px] text-gray-400 mt-2 truncate max-w-[45px]">{d._id.substring(5)}</span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No user growth analytics captured yet.
              </div>
            )}
          </div>
        </div>

        {/* Growth card summary */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <FiActivity className="text-emerald-500" />
            Content Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">News Approval Rate</span>
              <span className="font-bold text-gray-900">
                {metrics.totalNews > 0 ? Math.round((metrics.approvedNews / metrics.totalNews) * 100) : 100}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${metrics.totalNews > 0 ? (metrics.approvedNews / metrics.totalNews) * 100 : 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">Blog Approval Rate</span>
              <span className="font-bold text-gray-900">
                {metrics.totalBlogs > 0 ? Math.round((metrics.approvedBlogs / metrics.totalBlogs) * 100) : 100}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${metrics.totalBlogs > 0 ? (metrics.approvedBlogs / metrics.totalBlogs) * 100 : 100}%` }}
              />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Active Admins</span>
              <span className="text-xl font-bold text-gray-800">{metrics.totalAdmins}</span>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Active Today</span>
              <span className="text-xl font-bold text-gray-800">{metrics.activeUsersToday}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Breakdown grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sources Usage */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <FiLayers className="text-purple-500" />
            Top Synced News Sources
          </h3>
          <div className="space-y-3">
            {charts.sourceDistribution && charts.sourceDistribution.length > 0 ? (
              charts.sourceDistribution.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-600">
                    <span>{s.name}</span>
                    <span>{s.value} articles</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (s.value / (metrics.totalNews || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-10 text-center">No news sources recorded.</p>
            )}
          </div>
        </div>

        {/* Top Authors */}
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
            <FiAward className="text-amber-500" />
            Top Blog Contributors (Most Published)
          </h3>
          <div className="divide-y divide-gray-100">
            {charts.topBlogAuthors && charts.topBlogAuthors.length > 0 ? (
              charts.topBlogAuthors.map((author, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-bold flex items-center justify-center">
                      {author.name?.substring(0,2).toUpperCase() || "US"}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{author.name}</p>
                      <p className="text-[10px] text-gray-400">{author.views} total views</p>
                    </div>
                  </div>
                  <span className="inline-flex px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                    {author.count} Blogs
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-10 text-center">No active blog contributors recorded.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;
