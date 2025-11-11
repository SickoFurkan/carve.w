'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Zap, Dumbbell, TrendingUp } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  display_name: string;
  avatar_image_url: string | null;
  total_xp: number;
  level: number;
  workout_count: number;
  rank: number;
}

type LeaderboardType = 'xp' | 'level' | 'workouts';

function getRankBadgeColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-yellow-500 text-white shadow-lg scale-110'; // Gold
    case 2:
      return 'bg-gray-400 text-white shadow-md scale-105'; // Silver
    case 3:
      return 'bg-amber-700 text-white shadow-md scale-105'; // Bronze
    default:
      return 'bg-gray-200 text-gray-700';
  }
}

function getAvatarPlaceholder(displayName: string): string {
  return displayName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function HiscoresPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('xp');
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase.rpc('get_top_users', {
        limit_count: 100,
        leaderboard_type: leaderboardType,
      });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        setUsers([]);
      } else {
        setUsers(data || []);
      }

      setLoading(false);
    }

    fetchLeaderboard();
  }, [leaderboardType]);

  return (
    <div className="min-h-screen bg-[#ececf1] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-5xl font-bold text-gray-900">Hiscores</h1>
          </div>
          <p className="text-xl text-gray-600">
            See where you rank among the Carve community
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md p-2 mb-8 flex gap-2">
          <button
            onClick={() => setLeaderboardType('xp')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              leaderboardType === 'xp'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            Total XP
          </button>
          <button
            onClick={() => setLeaderboardType('level')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              leaderboardType === 'level'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Zap className="w-5 h-5" />
            Level
          </button>
          <button
            onClick={() => setLeaderboardType('workouts')}
            className={`flex-1 py-3 px-4 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
              leaderboardType === 'workouts'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Dumbbell className="w-5 h-5" />
            Workouts
          </button>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Players Yet
              </h3>
              <p className="text-gray-600">
                Be the first to join and claim the top spot!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors ${
                    user.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-white' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-transform ${getRankBadgeColor(
                      user.rank
                    )}`}
                  >
                    {user.rank}
                  </div>

                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    {user.avatar_image_url ? (
                      <img
                        src={user.avatar_image_url}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getAvatarPlaceholder(user.display_name)
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {user.display_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Level {user.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-4 h-4 text-blue-500" />
                        {user.workout_count} workouts
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-2xl text-blue-600">
                      {leaderboardType === 'xp' && user.total_xp.toLocaleString()}
                      {leaderboardType === 'level' && user.level}
                      {leaderboardType === 'workouts' && user.workout_count}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">
                      {leaderboardType === 'xp' && 'XP'}
                      {leaderboardType === 'level' && 'Level'}
                      {leaderboardType === 'workouts' && 'Workouts'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Want to compete?</h2>
          <p className="text-blue-100 mb-6 text-lg">
            Join the waitlist to track your workouts, earn XP, and climb the leaderboard.
          </p>
          <a
            href="/#waitlist"
            className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Join Waitlist →
          </a>
        </div>
      </div>
    </div>
  );
}
