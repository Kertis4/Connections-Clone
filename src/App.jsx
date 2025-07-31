// App.js
import React, { useReducer, useState, useEffect } from 'react';
import './index.css';

// Game Data
const gameData = {
  categories: [
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
      name: 'OUR PERFECT DATE',
      words: ['DINNER', 'SUNSET', 'DANCING', 'FOREVER'],
      color: 'purple',
      difficulty: 4,
      isAnniversary: true
    }
  ]
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
  const initialState = {
    words: shuffleWords(gameData.categories),
    selectedWords: [],
    solvedCategories: [],
    mistakes: 0,
    gameComplete: false,
    showAnniversary: false,
    showShake: false,
    showConfetti: false
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
          words: shuffleWords(gameData.categories.filter(
            cat => !state.solvedCategories.find(solved => solved.id === cat.id)
          ))
        };

      case 'SOLVE_CATEGORY':
        const { category } = action.payload;
        const newSolvedCategories = [...state.solvedCategories, category];
        const isGameComplete = newSolvedCategories.length === gameData.categories.length;
        
        return {
          ...state,
          selectedWords: [],
          solvedCategories: newSolvedCategories,
          words: state.words.filter(w => !category.words.includes(w.word)),
          gameComplete: isGameComplete,
          showAnniversary: isGameComplete && category.isAnniversary,
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
        return {
          ...initialState,
          words: shuffleWords(gameData.categories)
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

    const category = gameData.categories.find(cat =>
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

// Confetti Component
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
      {[...Array(50)].map((_, i) => (
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
            className={`w-3 h-3 ${
              ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
            } rotate-45`}
          />
        </div>
      ))}
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-lg font-semibold text-gray-700">Progress</span>
        <span className="text-lg font-semibold text-gray-700">{current}/{total}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Header Component
const Header = ({ mistakes, solvedCount }) => {
  const heartsRemaining = 4 - mistakes;
  
  return (
    <div className="text-center mb-8">
      <div className="mb-6">
        <img 
          src="Connected.png" 
          alt="Our Anniversary Connections" 
          className="max-w-96 h-auto mx-auto rounded-lg "
        />
      </div>
      <p className="text-xl text-gray-600 mb-6 max-w-prose mx-auto">
        Find groups of four related words
      </p>
      
      <ProgressBar current={solvedCount} total={4} />
      
      <div className="flex justify-center space-x-2 mb-4">
        {[...Array(4)].map((_, i) => (
          <span 
            key={i} 
            className={`text-2xl transition-all duration-300 ${
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
        <p className="text-lg text-red-600 font-medium">
          {4 - mistakes} mistake{4 - mistakes !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
};

// WordCard Component
const WordCard = ({ word, isSelected, isDisabled, onClick, showShake }) => {
  return (
    <button
      className={`
        h-20 md:h-24 flex items-center justify-center
        rounded-xl text-lg md:text-xl font-bold
        transition-all duration-300 ease-in-out
        transform hover:scale-110 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-blue-400
        shadow-lg hover:shadow-xl
        ${isSelected 
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border-2 border-blue-700' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 text-gray-800 hover:from-gray-100 hover:to-gray-200'
        }
        ${isDisabled ? 'opacity-50 cursor-not-allowed hover:scale-100' : 'cursor-pointer'}
        ${showShake ? 'animate-shake' : ''}
      `}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`Word: ${word}. ${isSelected ? 'Selected' : 'Not selected'}`}
      aria-pressed={isSelected}
    >
      {word}
    </button>
  );
};

// SelectedWordsBar Component
const SelectedWordsBar = ({ selectedWords }) => {
  if (selectedWords.length === 0) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
      <div className="flex flex-wrap justify-center gap-3">
        {selectedWords.map(word => (
          <span 
            key={word}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-lg font-semibold shadow-md"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// ActionButtons Component
const ActionButtons = ({ gameState }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <button
        className="px-8 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold text-lg
                   hover:from-gray-500 hover:to-gray-600 transition-all duration-300 transform hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-gray-400 shadow-lg hover:shadow-xl"
        onClick={() => gameState.dispatch({ type: 'SHUFFLE_WORDS' })}
      >
        🔄 Shuffle
      </button>
      
      <button
        className="px-8 py-3 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-xl font-semibold text-lg
                   hover:from-orange-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-orange-400 shadow-lg hover:shadow-xl
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        onClick={() => gameState.dispatch({ type: 'CLEAR_SELECTION' })}
        disabled={gameState.selectedWords.length === 0}
      >
        ✖️ Clear
      </button>
      
      <button
        className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl
                   focus:outline-none focus:ring-4 focus:ring-blue-400
                   ${gameState.canSubmit 
                     ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-110' 
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

// CategoryReveal Component
const CategoryReveal = ({ category, index }) => {
  const colorClasses = {
    yellow: 'bg-gradient-to-r from-yellow-300 to-yellow-400 border-yellow-500 text-yellow-900',
    green: 'bg-gradient-to-r from-green-300 to-green-400 border-green-500 text-green-900',
    blue: 'bg-gradient-to-r from-blue-300 to-blue-400 border-blue-500 text-blue-900',
    purple: 'bg-gradient-to-r from-purple-300 to-purple-400 border-purple-500 text-purple-900'
  };

  return (
    <div 
      className={`
        p-6 rounded-xl border-2 text-center shadow-lg
        animate-slideIn transform hover:scale-105 transition-all duration-300
        ${colorClasses[category.color]}
      `}
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      <h3 className="font-bold text-lg mb-3">{category.name}</h3>
      <div className="flex justify-center flex-wrap gap-2 text-lg font-semibold">
        {category.words.map((word, i) => (
          <span key={word} className="bg-white bg-opacity-50 px-3 py-1 rounded-lg">
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};

// AnniversaryReveal Component
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
    <div className="bg-gradient-to-br from-pink-100 via-rose-50 to-purple-100 rounded-2xl p-10 text-center border-2 border-pink-300 shadow-2xl transform animate-slideIn">
      {currentStep >= 1 && (
        <h2 className="text-4xl md:text-5xl font-bold text-rose-800 mb-6 animate-fadeIn">
          🎉 Congratulations! 🎉
        </h2>
      )}
      
      {currentStep >= 2 && (
        <p className="text-2xl text-rose-700 mb-8 animate-fadeIn font-semibold" style={{ animationDelay: '0.5s' }}>
          You've unlocked our anniversary surprise...
        </p>
      )}
      
      {currentStep >= 3 && (
        <div className="bg-white rounded-xl p-8 mb-8 shadow-xl animate-fadeIn transform hover:scale-105 transition-all duration-300" style={{ animationDelay: '1s' }}>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            Our Anniversary Date ✨
          </h3>
          <div className="space-y-4 text-xl">
            <p className="text-gray-700">
              🌅 <strong>Sunset Dinner at [Restaurant Name]</strong>
            </p>
            <p className="text-gray-700">
              💃 <strong>Followed by dancing under the stars</strong>
            </p>
            <p className="text-gray-700">
              🥂 <strong>Champagne toast to our love</strong>
            </p>
            <p className="text-gray-700">
              ❤️ <strong>A perfect evening, just for us</strong>
            </p>
          </div>
        </div>
      )}
      
      {currentStep >= 4 && (
        <p className="text-2xl text-rose-600 font-bold mb-4">
          I love you to the moon and back! 🌙✨
        </p>
      )}

      {currentStep >= 5 && (
        <button 
          className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-xl
                     hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-110
                     focus:outline-none focus:ring-4 focus:ring-pink-400 shadow-lg"
          onClick={() => window.location.reload()}
        >
          🎮 Play Again
        </button>
      )}
    </div>
  );
};

// Main GameContainer Component
const GameContainer = () => {
  const gameState = useGameState();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Header mistakes={gameState.mistakes} solvedCount={gameState.solvedCategories.length} />
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-gray-200">
        {/* Solved Categories */}
        <div className="space-y-4 mb-8">
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
            <div className="grid grid-cols-4 gap-4 mb-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-25 to-pink-50 py-8">
      <GameContainer />
    </div>
  );
}

export default App;
