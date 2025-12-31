
import React, { useState, useMemo } from 'react';
import { QuizConfig, QuizCategory, QuestionFormat, Difficulty, QuizMode } from '../types';
import { Button } from './Button';

interface SetupViewProps {
  onStart: (config: QuizConfig) => void;
}

export const SetupView: React.FC<SetupViewProps> = ({ onStart }) => {
  const [categoryType, setCategoryType] = useState<QuizCategory>(QuizCategory.EXPLORE);
  const [mode, setMode] = useState<QuizMode>(QuizMode.TRIVIA);
  const [genre, setGenre] = useState('');
  const [genreSearch, setGenreSearch] = useState('');
  const [decade, setDecade] = useState('');
  const [artist, setArtist] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [format, setFormat] = useState<QuestionFormat>(QuestionFormat.MULTIPLE_CHOICE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);

  const allGenres = [
    "Pop", "Rock", "Hip Hop", "R&B", "Jazz", "Country", "Electronic", "Classical",
    "Alternative", "Indie", "Metal", "Heavy Metal", "Punk", "Soul", "Funk", "Reggae",
    "Blues", "Disco", "Gospel", "Folk", "Latin", "K-Pop", "J-Pop", "Afrobeat",
    "Bossa Nova", "Samba", "Salsa", "Reggaeton", "Flamenco", "Celtic", "Bluegrass",
    "Techno", "House", "Dubstep", "Trance", "Ambient", "Drum and Bass", "Synthpop",
    "Industrial", "Lo-fi", "Trap", "Grunge", "Progressive Rock", "Psychedelic",
    "Glam Rock", "Surf Rock", "Gothic Rock", "Post-Rock", "New Wave", "Emo",
    "Swing", "Opera", "Orchestral", "Ska", "Hardcore", "Math Rock", "Shoegaze",
    "Dream Pop", "Britpop", "Death Metal", "Black Metal", "Thrash Metal",
    "Power Metal", "Doom Metal", "Nu-Metal", "Hardcore Punk", "Post-Punk"
  ].sort();

  const filteredGenres = useMemo(() => {
    return allGenres.filter(g => g.toLowerCase().includes(genreSearch.toLowerCase()));
  }, [genreSearch, allGenres]);

  const decades = ["1900", "1910", "1920", "1930", "1940", "1950", "1960", "1970", "1980", "1990", "2000", "2010", "2020"];
  const counts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  const randomArtists = [
    "The Beatles", "Queen", "Michael Jackson", "Taylor Swift", "Nirvana", 
    "Beyoncé", "Led Zeppelin", "Eminem", "Madonna", "Prince", "David Bowie", 
    "Fleetwood Mac", "Pink Floyd", "Drake", "Kanye West", "Stevie Wonder"
  ];

  const handleRandom = () => {
    const randomMode = Math.random() > 0.5 ? QuizMode.TRIVIA : QuizMode.LYRICS;
    const randomCategory = Math.random() > 0.5 ? QuizCategory.EXPLORE : QuizCategory.ARTIST;
    const randomDiff = Object.values(Difficulty)[Math.floor(Math.random() * Object.values(Difficulty).length)];
    const randomFormat = Math.random() > 0.7 ? QuestionFormat.WRITTEN : QuestionFormat.MULTIPLE_CHOICE;
    const randomCount = [10, 20, 30][Math.floor(Math.random() * 3)];
    
    let g = '';
    let d = '';
    let a = '';

    if (randomCategory === QuizCategory.EXPLORE) {
      g = allGenres[Math.floor(Math.random() * allGenres.length)];
      d = Math.random() > 0.3 ? decades[Math.floor(Math.random() * decades.length)] : '';
    } else {
      a = randomArtists[Math.floor(Math.random() * randomArtists.length)];
    }

    onStart({
      mode: randomMode,
      categoryType: randomCategory,
      difficulty: randomDiff,
      format: randomFormat,
      questionCount: randomCount,
      genre: g,
      decade: d,
      artist: a
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryType === QuizCategory.ARTIST && !artist.trim()) return;
    onStart({ categoryType, mode, genre, decade, artist, questionCount, format, difficulty });
  };

  const isValid = categoryType === QuizCategory.ARTIST ? artist.trim().length > 0 : true;

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Visual Teaser */}
      <div className="lg:col-span-4 space-y-6 hidden lg:block">
        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-purple-400">01</span> Choose Mode
          </h3>
          <p className="text-sm text-slate-400">Switch between general trivia and finishing the lyrics for a varied experience.</p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-pink-400">02</span> Set Filters
          </h3>
          <p className="text-sm text-slate-400">Narrow down by your favorite genre, era, or a specific artist you love.</p>
        </div>
        <div className="bg-slate-800/30 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-indigo-400">03</span> Difficulty
          </h3>
          <p className="text-sm text-slate-400">Easy for casual listening, Hard for the true audiophiles.</p>
        </div>
        
        {/* Quick Start Card */}
        <div className="bg-indigo-600/20 p-6 rounded-3xl border border-indigo-500/30 backdrop-blur-md text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Feeling Lucky?</p>
          <button 
            type="button"
            onClick={handleRandom}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500">🔀</span>
            Random Session
          </button>
        </div>
      </div>

      {/* Right Column: The Form */}
      <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 bg-slate-800/40 p-8 rounded-3xl border border-slate-700/60 backdrop-blur-xl card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            type="button"
            onClick={() => setMode(QuizMode.TRIVIA)}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${mode === QuizMode.TRIVIA ? 'border-purple-500 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
          >
            🎵 Music Trivia
          </button>
          <button
            type="button"
            onClick={() => setMode(QuizMode.LYRICS)}
            className={`flex-1 py-4 rounded-2xl font-bold text-lg transition-all border-2 ${mode === QuizMode.LYRICS ? 'border-pink-500 bg-pink-500/10 text-white shadow-lg shadow-pink-500/10' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'}`}
          >
            🎤 Finish Lyrics
          </button>
        </div>

        <div className="space-y-8">
          {/* Step 1: Category */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Category Selection
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCategoryType(QuizCategory.EXPLORE)}
                className={`p-4 rounded-xl border-2 transition-all ${categoryType === QuizCategory.EXPLORE ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}
              >
                Explore Library
              </button>
              <button
                type="button"
                onClick={() => setCategoryType(QuizCategory.ARTIST)}
                className={`p-4 rounded-xl border-2 transition-all ${categoryType === QuizCategory.ARTIST ? 'border-purple-500 bg-slate-900 text-white' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}
              >
                Specific Artist
              </button>
            </div>
          </div>

          {/* Step 2: Filters */}
          <div className="space-y-4">
            {categoryType === QuizCategory.EXPLORE ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Search Genre</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="e.g. Rock, Jazz..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-t-xl p-3 text-sm focus:ring-1 focus:ring-purple-500 outline-none"
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                    />
                    <div className="max-h-32 overflow-y-auto border border-t-0 border-slate-700 bg-slate-950 rounded-b-xl custom-scrollbar">
                      <button
                        type="button"
                        onClick={() => setGenre('')}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${genre === '' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-500 hover:bg-slate-800'}`}
                      >
                        Any Genre
                      </button>
                      {filteredGenres.map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGenre(g)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${genre === g ? 'bg-purple-500/20 text-purple-300 font-bold' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-300">Select Era</label>
                  <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1 custom-scrollbar">
                    <button
                      type="button"
                      onClick={() => setDecade('')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${decade === '' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
                    >
                      Any
                    </button>
                    {decades.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDecade(d)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${decade === d ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Enter Artist or Band</label>
                <input 
                  type="text"
                  placeholder="The Beatles, Queen, SZA..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-lg outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 3: Intensity */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Intensity
              </label>
              <div className="flex gap-2">
                {Object.values(Difficulty).map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${difficulty === level ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Format */}
            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Format
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormat(QuestionFormat.MULTIPLE_CHOICE)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${format === QuestionFormat.MULTIPLE_CHOICE ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  onClick={() => setFormat(QuestionFormat.WRITTEN)}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${format === QuestionFormat.WRITTEN ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-800 bg-slate-900 text-slate-500'}`}
                >
                  Written Answer
                </button>
              </div>
            </div>
          </div>

          {/* Step 5: Length */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              Question Count
            </label>
            <div className="flex flex-wrap gap-2">
              {counts.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setQuestionCount(c)}
                  className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xs font-bold transition-all ${questionCount === c ? 'border-pink-500 bg-pink-500/10 text-pink-300' : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <Button fullWidth disabled={!isValid} type="submit" className="py-5 text-xl">
            Generate Session
          </Button>
          <button 
            type="button"
            onClick={handleRandom}
            className="sm:hidden w-full py-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-2xl font-black transition-all flex items-center justify-center gap-2 border border-indigo-500/30"
          >
            🔀 Surprise Me
          </button>
        </div>
      </form>
    </div>
  );
};
