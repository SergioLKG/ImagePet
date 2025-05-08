"use client";

import { Heart, Users, Star } from "lucide-react";

interface GameStatsProps {
  totalInteractions: number;
  highScore: number;
  petCount: number;
}

const GameStats = ({
  totalInteractions,
  highScore,
  petCount,
}: GameStatsProps) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-400" fill="currentColor" />
          <span className="text-sm">
            Interacciones: <strong>{totalInteractions}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
          <span className="text-sm">
            Récord: <strong>{highScore}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-sm">
            Mascotas: <strong>{petCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
