// App.js - Mobile-Friendly Version
import React, { useReducer, useState, useEffect } from 'react';
import './index.css';

// All available categories
const allCategories = [
  {
    id: 'literature',
    name: 'CLASSIC LITERATURE',
    words: ['DRACULA', 'LORD OF THE FLIES', 'WAR OF THE WORLDS', 'THE GREAT GATSBY'],
    color: 'yellow',
    difficulty: 1
  },
  {
    id: 'ghibli',
    name: 'STUDIO GHIBLI MOVIES',
    words: ['MY NEIGHBOUR TOTORO', 'SPIRITED AWAY', 'PRINCESS MONONOKE', 'KIKIS DELIVERY SERVICE'],
    color: 'green',
    difficulty: 2
  },
  {
    id: 'psych',
    name: 'PSYCH TV SHOW',
    words: ['SHAWN', 'GUS', 'LASSIE', 'JULES'],
    color: 'blue',
    difficulty: 3
  },
  {
    id: 'anniversary',
    name: 'OUR ANNIVERSARY',
    words: ['STEAK', 'LOVE', '😏', 'LOBSTER'],
    color: 'purple',
    difficulty: 4,
    isAnniversary: true
  },
  {
    id: 'werewolves',
    name: 'WEREWOLF LIT & LORE',
    words: ['BOOBS', 'BRIDE', 'WOLFWALKERS', 'FAOLADH'],
    color: 'red',
    difficulty: 2
  },
  {
    id: 'gallery',
    name: 'OUR ART DATES',
    words: ['IMMA', 'NATIONAL GALLERY', 'PAINTING', 'LOOKING AT YOU'],
    color: 'pink',
    difficulty: 3
  },
  {
    id: 'hamilton',
    name: 'HAMILTON',
    words: ['BURR', 'DUEL', 'WAIT FOR IT', 'HISTORY HAS ITS EYES ON YOU'],
    color: 'teal',
    difficulty: 2
  },
  {
    id: 'moonlove',
    name: 'WEREWOLF LOVE',
    words: ['HOWL', 'MOONLIGHT', 'SCAR', 'YOU SMELL GOOD'],
    color: 'violet',
    difficulty: 4
  }
];

// Function to randomly select categories while always including anniversary
const getRandomCategories = (totalCategories = 4) => {
  const anniversaryCategory = allCategories.find(cat => cat.isAnniversary);
  const otherCategories = allCategories.filter(cat => !cat.isAnniversary);
  
  const shuffledOthers = [...otherCategories].sort(() => Math.random() - 0.5);
  const selectedOthers = shuffledOthers.slice(0, totalCategories - 1);
  
  return [anniversaryCategory, ...selectedOthers];
};

// Utility Functions
const shuffleWords = (categories) => {
  const allWords = categories.flatMap(cat => 
    cat.words.map(word => ({ word, categoryId: cat.id, color: cat.color }))
  );
  return allWords.sort(() => Math.random() - 0.5);
};

// Game State Hook
const useGameState = () => {
  const [gameCategories] = useState(() => getRandomCategories(4));
  
  const initialState = {
    words: shuffleWords(gameCategories),
    selectedWords: [],
    solvedCategories: [],
    mistakes: 0,
    gameComplete: false,
    showAnniversary: false,
    showShake: false,
    showConfetti: false,
    categories: gameCategories
  };

  const gameReducer = (state, action) => {
    switch (action.type) {
      case 'SELECT_WORD':
        const { word } = action.payload;
        const isSelected = state.selectedWords.includes(word);
        
        if (isSelected) {
          return {
            ...state,
            selectedWords: state.selectedWords.filter(w => w !== word)
          };
        } else if (state.selectedWords.length < 4) {
          return {
            ...state,
            selectedWords: [...state.selectedWords, word]
          };
        }
        return state;

      case 'CLEAR_SELECTION':
        return {
          ...state,
          selectedWords: []
        };

      case 'SHUFFLE_WORDS':
        return {
          ...state,
          words: shuffleWords(state.categories.filter(
            cat => !state.solvedCategories.find(solved => solved.id === cat.id)
          ))
        };

      case 'SOLVE_CATEGORY':
        const { category } = action.payload;
        const newSolvedCategories = [...state.solvedCategories, category];
        const isGameComplete = newSolvedCategories.length === state.categories.length;
        
        const hasAnniversaryCategory = newSolvedCategories.some(cat => cat.isAnniversary);
        
        return {
          ...state,
          selectedWords: [],
          solvedCategories: newSolvedCategories,
          words: state.words.filter(w => !category.words.includes(w.word)),
          gameComplete: isGameComplete,
          showAnniversary: isGameComplete && hasAnniversaryCategory,
          showConfetti: true
        };

      case 'ADD_MISTAKE':
        return {
          ...state,
          mistakes: state.mistakes + 1,
          selectedWords: [],
          showShake: true
        };

      case 'HIDE_SHAKE':
        return {
          ...state,
          showShake: false
        };

      case 'HIDE_CONFETTI':
        return {
          ...state,
          showConfetti: false
        };

      case 'RESET_GAME':
        const newCategories = getRandomCategories(4);
        return {
          ...initialState,
          words: shuffleWords(newCategories),
          categories: newCategories
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(gameReducer, initialState);

  const canSubmit = state.selectedWords.length === 4;
  const gameOver = state.mistakes >= 4;

  const submitGuess = () => {
    if (!canSubmit) return;

    const category = state.categories.find(cat =>
      cat.words.every(word => state.selectedWords.includes(word))
    );

    if (category) {
      dispatch({ type: 'SOLVE_CATEGORY', payload: { category } });
    } else {
      dispatch({ type: 'ADD_MISTAKE' });
      setTimeout(() => dispatch({ type: 'HIDE_SHAKE' }), 500);
    }
  };

  return {
    ...state,
    canSubmit,
    gameOver,
    dispatch,
    submitGuess
  };
};

// Mobile-Friendly Confetti Component
const Confetti = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div 
            className={`w-2 h-2 sm:w-3 sm:h-3 ${
              ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
            } rotate-45`}
          />
        </div>
      ))}
    </div>
  );
};

// Mobile-Friendly Progress Bar Component
const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full mb-4 sm:mb-8">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <span className="text-base sm:text-lg font-semibold text-gray-700">Progress</span>
        <span className="text-base sm:text-lg font-semibold text-gray-700">{current}/{total}</span>
      </div>
      <div className="h-2 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Mobile-Friendly Header Component
const Header = ({ mistakes, solvedCount, totalCategories }) => {
  const heartsRemaining = 4 - mistakes;
  
  return (
    <div className="text-center mb-4 sm:mb-8 px-2">
      <div className="mb-4 sm:mb-6">
        <img 
          src="Connected.png" 
          alt="Our Anniversary Connections" 
          className="max-w-64 sm:max-w-80 md:max-w-96 h-auto mx-auto rounded-lg"
        />
      </div>
      <p className="text-lg sm:text-xl text-gray-600 mb-4 sm:mb-6 max-w-prose mx-auto px-4">
        Find groups of four related words
      </p>
      
      <ProgressBar current={solvedCount} total={totalCategories} />
      
      <div className="flex justify-center space-x-2 mb-3 sm:mb-4">
        {[...Array(4)].map((_, i) => (
          <span 
            key={i} 
            className={`text-xl sm:text-2xl transition-all duration-300 ${
              i < heartsRemaining 
                ? 'text-red-500' 
                : 'text-gray-300'
            }`}
          >
            ♥
          </span>
        ))}
      </div>
      
      {mistakes > 0 && (
        <p className="text-base sm:text-lg text-red-600 font-medium">
          {4 - mistakes} mistake{4 - mistakes !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
};

// Mobile-Friendly WordCard Component
const WordCard = ({ word, isSelected, isDisabled, onClick, showShake }) => {
  return (
    <button
      className={`
        min-h-16 sm:min-h-20 md:min-h-24 w-full flex items-center justify-center
        rounded-lg sm:rounded-xl font-bold p-2 sm:p-3
        transition-all duration-200 ease-in-out
        transform active:scale-95 touch-manipulation
        focus:outline-none focus:ring-2 focus:ring-blue-400
        shadow-md hover:shadow-lg
        text-xs sm:text-sm md:text-base
        ${isSelected 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-2 border-blue-700' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-800'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${showShake ? 'animate-shake' : ''}
      `}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Word: ${word}. ${isSelected ? 'Selected' : 'Not selected'}`}
      aria-pressed={isSelected}
    >
      <span 
        className="text-center leading-tight whitespace-normal break-words"
        style={{
          wordBreak: 'keep-all',
          overflowWrap: 'break-word',
          hyphens: 'none'
        }}
      >
        {word}
      </span>
    </button>
  );
};

// Mobile-Friendly SelectedWordsBar Component
const SelectedWordsBar = ({ selectedWords }) => {
  if (selectedWords.length === 0) return null;

  return (
    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl border-2 border-blue-200">
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {selectedWords.map(word => (
          <span 
            key={word}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-sm sm:text-lg font-semibold shadow-md"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// Mobile-Friendly ActionButtons Component
const ActionButtons = ({ gameState }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
      <button
        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg
                   active:from-gray-500 active:to-gray-600 transition-all duration-200 transform active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-lg touch-manipulation"
        onClick={() => gameState.dispatch({ type: 'SHUFFLE_WORDS' })}
      >
        🔄 Shuffle
      </button>
      
      <button
        className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg
                   active:from-orange-500 active:to-orange-600 transition-all duration-200 transform active:scale-95
                   focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg touch-manipulation
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        onClick={() => gameState.dispatch({ type: 'CLEAR_SELECTION' })}
        disabled={gameState.selectedWords.length === 0}
      >
        ✖️ Clear
      </button>
      
      <button
        className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-200 shadow-lg touch-manipulation
                   focus:outline-none focus:ring-2 focus:ring-blue-400
                   ${gameState.canSubmit 
                     ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white active:from-blue-600 active:to-purple-700 transform active:scale-95' 
                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                   }`}
        onClick={gameState.submitGuess}
        disabled={!gameState.canSubmit}
      >
        ✨ Submit
      </button>
    </div>
  );
};

// Mobile-Friendly CategoryReveal Component
const CategoryReveal = ({ category, index }) => {
  const colorClasses = {
    yellow: 'bg-gradient-to-r from-yellow-300 to-yellow-400 border-yellow-500 text-yellow-900',
    green: 'bg-gradient-to-r from-green-300 to-green-400 border-green-500 text-green-900',
    blue: 'bg-gradient-to-r from-blue-300 to-blue-400 border-blue-500 text-blue-900',
    purple: 'bg-gradient-to-r from-purple-300 to-purple-400 border-purple-500 text-purple-900',
    red: 'bg-gradient-to-r from-red-300 to-red-400 border-red-500 text-red-900',
    pink: 'bg-gradient-to-r from-pink-300 to-pink-400 border-pink-500 text-pink-900',
    teal: 'bg-gradient-to-r from-teal-300 to-teal-400 border-teal-500 text-teal-900',
    violet: 'bg-gradient-to-r from-violet-300 to-violet-400 border-violet-500 text-violet-900'
  };

  return (
    <div 
      className={`
        p-4 sm:p-6 rounded-lg sm:rounded-xl border-2 text-center shadow-lg
        animate-slideIn transform transition-all duration-300
        ${colorClasses[category.color]}
      `}
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      <h3 className="font-bold text-base sm:text-lg mb-2 sm:mb-3">{category.name}</h3>
      <div className="flex justify-center flex-wrap gap-1 sm:gap-2 text-sm sm:text-lg font-semibold">
        {category.words.map((word, i) => (
          <span key={word} className="bg-white bg-opacity-50 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// Mobile-Friendly AnniversaryReveal Component
const AnniversaryReveal = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setCurrentStep(1), 1000),
      setTimeout(() => setCurrentStep(2), 2500),
      setTimeout(() => setCurrentStep(3), 4500),
      setTimeout(() => setCurrentStep(4), 6500),
      setTimeout(() => setCurrentStep(5), 8000)
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 rounded-lg sm:rounded-2xl p-6 sm:p-10 text-center border-2 border-pink-300 shadow-2xl transform animate-slideIn mx-2">
      {currentStep >= 1 && (
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-rose-800 mb-4 sm:mb-6 animate-fadeIn">
          🎉 Congratulations! 🎉
        </h2>
      )}
      
      {currentStep >= 2 && (
        <p className="text-lg sm:text-2xl text-rose-700 mb-6 sm:mb-8 animate-fadeIn font-semibold" style={{ animationDelay: '0.5s' }}>
          Here's to a great year with you
        </p>
      )}
      
      {currentStep >= 3 && (
        <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 mb-6 sm:mb-8 shadow-xl animate-fadeIn transform transition-all duration-300" style={{ animationDelay: '1s' }}>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">
            Our Anniversary Date ✨
          </h3>
          <div className="space-y-3 sm:space-y-4 text-base sm:text-xl">
            <p className="text-gray-700">
              🥩 <strong>Dinner at "Steak and Lobster" - Temple Bar</strong>
            </p>
            <p className="text-gray-700">
              🥵 <strong>Freaking you up (crazy style)</strong>
            </p>
            <p className="text-gray-700">
              😮‍💨 <strong>Freaking you down (sensual style)</strong>
            </p>
            <p className="text-gray-700">
              ❤️ <strong>Giving you all my love (needed after freaking)</strong>
            </p>
          </div>
        </div>
      )}
      
      {currentStep >= 4 && (
        <p className="text-lg sm:text-2xl text-rose-600 font-bold mb-4">
          Danny, I love you to the moon and back! 🌙✨
        </p>
      )}

      {currentStep >= 5 && (
        <button 
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg sm:rounded-xl font-bold text-lg sm:text-xl
                     active:from-pink-600 active:to-rose-600 transition-all duration-300 transform active:scale-95
                     focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-lg touch-manipulation"
          onClick={() => window.location.reload()}
        >
          🎮 Play Again
        </button>
      )}
    </div>
  );
};

// Mobile-Friendly GameContainer Component
const GameContainer = () => {
  const gameState = useGameState();

  return (
    <div className="max-w-2xl mx-auto p-3 sm:p-6">
      <Header 
        mistakes={gameState.mistakes} 
        solvedCount={gameState.solvedCategories.length}
        totalCategories={gameState.categories.length}
      />
      
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl sm:shadow-2xl p-4 sm:p-8 mb-4 sm:mb-8 border border-gray-200">
        {/* Solved Categories */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-8">
          {gameState.solvedCategories.map((category, index) => (
            <CategoryReveal 
              key={category.id} 
              category={category} 
              index={index}
            />
          ))}
        </div>

        {/* Game Grid */}
        {!gameState.gameComplete && (
          <>
            <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {gameState.words.map(({ word, categoryId, color }) => (
                <WordCard
                  key={word}
                  word={word}
                  isSelected={gameState.selectedWords.includes(word)}
                  isDisabled={gameState.gameOver}
                  showShake={gameState.showShake}
                  onClick={() => gameState.dispatch({ 
                    type: 'SELECT_WORD', 
                    payload: { word } 
                  })}
                />
              ))}
            </div>

            <SelectedWordsBar selectedWords={gameState.selectedWords} />
            <ActionButtons gameState={gameState} />
          </>
        )}
      </div>

      {gameState.showAnniversary && <AnniversaryReveal />}
      
      <Confetti 
        show={gameState.showConfetti} 
        onComplete={() => gameState.dispatch({ type: 'HIDE_CONFETTI' })}
      />
    </div>
  );
};

// Main App Component
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-25 to-pink-50 py-4 sm:py-8">
      <GameContainer />
    </div>
  );
}

export default App;
