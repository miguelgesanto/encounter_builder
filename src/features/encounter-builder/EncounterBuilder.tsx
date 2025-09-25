// Encounter Builder - Component for building encounters and adding creatures
import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, X, User, Dice1 } from 'lucide-react';
import { useEncounterStore } from '../../stores/encounterStore';
import type { Creature, DifficultyLevel } from '../../types';

export const EncounterBuilder: React.FC = () => {
  const {
    encounterBuilder,
    initiative,
    ui,
    setSearchTerm,
    setCrFilter,
    setTypeFilter,
    setEnvironmentFilter,
    createEncounter,
    addCombatant,
    togglePCForm,
    calculateDifficulty
  } = useEncounterStore();

  const [newEncounterName, setNewEncounterName] = useState('New Encounter');
  const [partySize, setPartySize] = useState(4);
  const [partyLevel, setPartyLevel] = useState(3);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [newPC, setNewPC] = useState({
    name: '',
    hp: 25,
    ac: 16,
    level: 5
  });

  const activeEncounter = initiative.encounters.find(
    e => e.id === initiative.activeEncounterId
  );

  const difficultyData = activeEncounter ? calculateDifficulty(activeEncounter.id) : null;

  const handleCreateEncounter = () => {
    createEncounter(newEncounterName, partySize, partyLevel, difficulty);
    setNewEncounterName('New Encounter');
  };

  const handleAddCreature = (creature: Creature) => {
    if (!activeEncounter) {
      // Create encounter first if none exists
      createEncounter(newEncounterName, partySize, partyLevel, difficulty);
    }
    addCombatant(creature);
  };

  const handleAddPC = () => {
    if (!newPC.name.trim()) return;
    
    const pcCreature: Creature = {
      id: `pc-${Date.now()}`,
      name: newPC.name,
      cr: '',
      crValue: 0,
      hp: newPC.hp,
      maxHp: newPC.hp,
      ac: newPC.ac,
      initiative: 0,
      type: 'humanoid',
      size: 'medium',
      environment: 'any',
      xp: 0
    };

    addCombatant(pcCreature, true, newPC.level);
    setNewPC({ name: '', hp: 25, ac: 16, level: 5 });
    togglePCForm();
  };

  const formatChallengeRating = (cr: string): string => {
    if (cr === '0.125') return '1/8';
    if (cr === '0.25') return '1/4';
    if (cr === '0.5') return '1/2';
    return cr;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Deadly': return 'text-red-600 dark:text-red-400';
      case 'Hard': return 'text-orange-600 dark:text-orange-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Easy': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          Encounter Builder
        </h2>
        
        {/* Difficulty Display */}
        {difficultyData && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-3">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Encounter Difficulty
            </div>
            <div className={`text-lg font-bold ${getDifficultyColor(difficultyData.difficulty)}`}>
              {difficultyData.difficulty}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {difficultyData.xp} XP
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Encounter Setup */}
        {!activeEncounter && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">
              Create New Encounter
            </h3>
            <input
              type="text"
              placeholder="Encounter name"
              value={newEncounterName}
              onChange={(e) => setNewEncounterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Party Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={partyLevel}
                  onChange={(e) => setPartyLevel(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="deadly">Deadly</option>
              </select>
            </div>
            <button
              onClick={handleCreateEncounter}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Encounter
            </button>
          </div>
        )}

        {/* Player Characters */}
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Player Characters
          </h3>
          {!ui.showPCForm ? (
            <button
              onClick={togglePCForm}
              className="w-full px-3 py-2 border border-green-300 dark:border-green-700 rounded-lg hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add PC
            </button>
          ) : (
            <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <input
                type="text"
                placeholder="Character name"
                value={newPC.name}
                onChange={(e) => setNewPC({...newPC, name: e.target.value})}
                className="w-full px-2 py-1 mb-2 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">HP</label>
                  <input
                    type="number"
                    value={newPC.hp}
                    onChange={(e) => setNewPC({...newPC, hp: parseInt(e.target.value) || 25})}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">AC</label>
                  <input
                    type="number"
                    value={newPC.ac}
                    onChange={(e) => setNewPC({...newPC, ac: parseInt(e.target.value) || 16})}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Level</label>
                  <input
                    type="number"
                    value={newPC.level}
                    onChange={(e) => setNewPC({...newPC, level: parseInt(e.target.value) || 5})}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddPC}
                  disabled={!newPC.name.trim()}
                  className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  Add PC
                </button>
                <button
                  onClick={() => {
                    togglePCForm();
                    setNewPC({ name: '', hp: 25, ac: 16, level: 5 });
                  }}
                  className="px-3 py-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search creatures..."
            value={encounterBuilder.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h4>
            <button
              onClick={() => {
                setCrFilter('');
                setTypeFilter('');
                setEnvironmentFilter('');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            <select
              value={encounterBuilder.crFilter}
              onChange={(e) => setCrFilter(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All CR</option>
              <option value="0">CR 0</option>
              <option value="0.125">CR 1/8</option>
              <option value="0.25">CR 1/4</option>
              <option value="0.5">CR 1/2</option>
              <option value="1">CR 1</option>
              <option value="2">CR 2</option>
              <option value="3">CR 3</option>
              <option value="4">CR 4</option>
              <option value="5">CR 5</option>
            </select>
            <select
              value={encounterBuilder.typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="beast">Beast</option>
              <option value="humanoid">Humanoid</option>
              <option value="undead">Undead</option>
              <option value="fiend">Fiend</option>
              <option value="dragon">Dragon</option>
              <option value="giant">Giant</option>
            </select>
          </div>
        </div>

        {/* Creatures */}
        <div>
          <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
            Creatures ({encounterBuilder.filteredCreatures.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {encounterBuilder.filteredCreatures.map((creature) => (
              <div
                key={creature.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all duration-200 bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate bg-white dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                      {creature.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded flex-shrink-0">
                      CR {formatChallengeRating(creature.cr)}
                    </span>
                    <button
                      onClick={() => handleAddCreature(creature)}
                      className="p-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      title="Add to encounter"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <span>HP: {creature.hp}</span>
                  <span>AC: {creature.ac}</span>
                  <span className="capitalize">{creature.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncounterBuilder;
