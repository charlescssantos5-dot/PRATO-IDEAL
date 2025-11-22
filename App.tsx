import React, { useState, useEffect } from 'react';
import { getProfile, getData, saveData, saveProfile, resetApp } from './services/storageService';
import { generatePlans } from './services/geminiService';
import { UserProfile, AppData, ViewState, Gender, Goal, DailyDiet, DailyWorkout } from './types';
import { Navigation } from './components/Navigation';
import { DropletIcon, PlusIcon, DumbbellIcon } from './components/Icons';

// --- Views ---

const Onboarding: React.FC<{ onComplete: (p: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserProfile>({
    ...getProfile(),
    onboardingComplete: true
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Finish
      setLoading(true);
      saveProfile(formData);
      try {
        const { diet, workout } = await generatePlans(formData);
        const currentData = getData();
        currentData.dietPlan = diet;
        currentData.workoutPlan = workout;
        
        // Auto-generate shopping list from diet (simplified)
        const ingredients = new Set<string>();
        diet.forEach(d => {
          [d.breakfast, d.lunch, d.dinner, d.snack].forEach(meal => {
            meal.ingredients.forEach(ing => ingredients.add(ing));
          });
        });
        currentData.shoppingList = Array.from(ingredients).map(i => ({ item: i, checked: false }));
        
        saveData(currentData);
        onComplete(formData);
      } catch (e) {
        alert("Erro ao gerar plano via IA. Verifique sua conexão ou chave de API. Usando dados locais se existirem.");
        onComplete(formData);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-green-700 mb-2 text-center">Prato Ideal 🥗</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">Configure seu perfil para gerar seu plano.</p>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-green-700 animate-pulse">Criando sua dieta e treino personalizados com IA...</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-gray-700 text-sm font-bold">Nome</span>
                  <input 
                    className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Seu nome"
                  />
                </label>
                <div className="grid grid-cols-2 gap-4">
                   <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Idade</span>
                    <input type="number"
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                      value={formData.age || ''}
                      onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Gênero</span>
                    <select 
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value as Gender})}
                    >
                      {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Peso (kg)</span>
                    <input type="number"
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                      value={formData.weight || ''}
                      onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                    />
                  </label>
                  <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Altura (cm)</span>
                    <input type="number"
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                      value={formData.height || ''}
                      onChange={e => setFormData({...formData, height: Number(e.target.value)})}
                    />
                  </label>
                </div>
                <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Nível de Atividade</span>
                    <select 
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 border p-3"
                      value={formData.activityLevel}
                      onChange={e => setFormData({...formData, activityLevel: e.target.value as any})}
                    >
                      <option value="Sedentário">Sedentário</option>
                      <option value="Leve">Leve (1-2x semana)</option>
                      <option value="Moderado">Moderado (3-5x semana)</option>
                      <option value="Intenso">Intenso (6+ semana)</option>
                    </select>
                  </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                 <label className="block">
                    <span className="text-gray-700 text-sm font-bold">Qual seu objetivo principal?</span>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {Object.values(Goal).map(g => (
                        <button
                          key={g}
                          onClick={() => setFormData({...formData, goal: g})}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            formData.goal === g 
                            ? 'border-green-500 bg-green-50 text-green-700 font-bold' 
                            : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </label>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full mt-8 bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-green-700 transition-colors"
            >
              {step === 3 ? 'Gerar Plano Mágico ✨' : 'Próximo'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ data: AppData, profile: UserProfile, updateData: (d: AppData) => void }> = ({ data, profile, updateData }) => {
  const addWater = () => {
    const newData = { ...data, waterConsumed: data.waterConsumed + 250 };
    updateData(newData);
  };

  const progress = Math.min(100, (data.waterConsumed / profile.waterGoal) * 100);

  return (
    <div className="p-6 pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Olá, {profile.name.split(' ')[0]}! 👋</h2>
          <p className="text-gray-500 text-sm">Vamos manter o foco hoje?</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
          🔥 {profile.streak} dias seguidos
        </div>
      </header>

      {/* Water Card */}
      <div className="bg-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold opacity-90">Hidratação</h3>
              <p className="text-3xl font-bold mt-1">{data.waterConsumed} <span className="text-sm font-normal opacity-75">/ {profile.waterGoal}ml</span></p>
            </div>
            <div className="bg-white/20 p-2 rounded-full">
              <DropletIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-blue-900/30 rounded-full h-2">
            <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <button onClick={addWater} className="mt-4 w-full bg-white text-blue-600 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
            <PlusIcon className="w-4 h-4" /> Beber 250ml
          </button>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-4 -bottom-10 w-32 h-32 bg-blue-400 rounded-full opacity-50"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Objetivo</p>
          <p className="text-gray-800 font-bold text-sm mt-1">{profile.goal}</p>
        </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">IMC Estimado</p>
          <p className="text-gray-800 font-bold text-sm mt-1">
            {profile.height > 0 ? (profile.weight / ((profile.height/100) ** 2)).toFixed(1) : '--'}
          </p>
        </div>
      </div>

      {/* Today's Focus */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Resumo do Dia</h3>
        {data.workoutPlan.length > 0 ? (
          <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
            <div className="bg-orange-100 p-2 rounded-full text-orange-600">
              <DumbbellIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-orange-600 font-bold">Treino de Hoje</p>
              <p className="text-sm font-medium text-gray-700">{data.workoutPlan[0].focus}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Sem treino hoje. Descanse!</p>
        )}
      </div>
    </div>
  );
};

const DietView: React.FC<{ plan: DailyDiet[] }> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  
  if (!plan || plan.length === 0) return (
    <div className="p-8 text-center text-gray-500 mt-10">
      <p>Nenhum plano de dieta encontrado. Tente reiniciar o app ou atualizar o perfil.</p>
    </div>
  );

  const currentDay = plan[selectedDay % plan.length];

  const MealCard = ({ title, meal }: { title: string, meal: any }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-bold text-green-700">{title}</h4>
        <span className="text-xs text-gray-400 font-mono">{meal.calories} kcal</span>
      </div>
      <p className="font-medium text-gray-800 mb-1">{meal.name}</p>
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">{meal.ingredients.join(', ')}</p>
      <div className="flex gap-2 text-[10px] text-gray-400 uppercase font-bold tracking-wide">
        <span className="bg-gray-50 px-2 py-1 rounded">P: {meal.protein}</span>
        <span className="bg-gray-50 px-2 py-1 rounded">C: {meal.carbs}</span>
        <span className="bg-gray-50 px-2 py-1 rounded">G: {meal.fats}</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 pb-24 bg-green-50/50 min-h-screen">
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
        {plan.map((d, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              selectedDay === idx ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {d.day || `Dia ${idx + 1}`}
          </button>
        ))}
      </div>

      <MealCard title="Café da Manhã ☕" meal={currentDay.breakfast} />
      <MealCard title="Almoço 🥗" meal={currentDay.lunch} />
      <MealCard title="Lanche 🍎" meal={currentDay.snack} />
      <MealCard title="Jantar 🍲" meal={currentDay.dinner} />
    </div>
  );
};

const WorkoutView: React.FC<{ plan: DailyWorkout[] }> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!plan || plan.length === 0) return <div className="p-8 text-center text-gray-500">Sem plano de treino disponível.</div>;
  
  const currentDay = plan[selectedDay % plan.length];

  return (
    <div className="p-4 pb-24 bg-gray-50 min-h-screen">
       <div className="flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
        {plan.map((d, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDay(idx)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              selectedDay === idx ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            {d.day || `Dia ${idx + 1}`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{currentDay.focus}</h2>
        <p className="text-gray-500 text-sm">Foco do dia</p>
      </div>

      <div className="space-y-3">
        {currentDay.exercises.map((ex, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">{ex.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-orange-500">{ex.sets}x</p>
              <p className="text-xs text-gray-400">{ex.reps}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShoppingView: React.FC<{ items: {item: string, checked: boolean}[], updateData: (d: AppData) => void, fullData: AppData }> = ({ items, updateData, fullData }) => {
  const toggleItem = (idx: number) => {
    const newItems = [...items];
    newItems[idx].checked = !newItems[idx].checked;
    updateData({ ...fullData, shoppingList: newItems });
  };

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 px-2">Lista de Compras 🛒</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {items.length === 0 ? (
          <p className="p-6 text-center text-gray-500">Sua lista está vazia.</p>
        ) : (
          items.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => toggleItem(idx)}
              className={`p-4 border-b border-gray-100 flex items-center gap-4 cursor-pointer transition-colors hover:bg-gray-50 ${item.checked ? 'bg-gray-50' : ''}`}
            >
              <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                {item.checked && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <span className={`text-sm font-medium flex-1 ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {item.item}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProfileView: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner">
          👤
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
        <p className="text-gray-500">{profile.email}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2">Meus Dados</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-400">Peso:</span> <span className="font-medium">{profile.weight}kg</span></div>
            <div><span className="text-gray-400">Altura:</span> <span className="font-medium">{profile.height}cm</span></div>
            <div><span className="text-gray-400">Meta:</span> <span className="font-medium">{profile.goal}</span></div>
            <div><span className="text-gray-400">Atividade:</span> <span className="font-medium">{profile.activityLevel}</span></div>
          </div>
        </div>

        <button 
          onClick={() => {
            if(confirm("Deseja realmente resetar o app? Todos os dados serão perdidos.")) {
              resetApp();
            }
          }}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
        >
          Resetar Aplicativo
        </button>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-2">Instalação</p>
          <p className="text-sm text-gray-600">
            Para instalar este app: <br/>
            1. Clique em "Compartilhar" no navegador.<br/>
            2. Selecione "Adicionar à Tela de Início".
          </p>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('ONBOARDING');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const loadedProfile = getProfile();
    const loadedData = getData();

    setProfile(loadedProfile);
    setData(loadedData);

    if (loadedProfile.onboardingComplete) {
      setCurrentView('DASHBOARD');
    }
    setInitialized(true);
  }, []);

  const updateAppData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const completeOnboarding = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setCurrentView('DASHBOARD');
    setData(getData()); // Refresh data after generation
  };

  if (!initialized) return <div className="min-h-screen flex items-center justify-center text-green-600">Carregando...</div>;

  if (!profile?.onboardingComplete) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
      {currentView === 'DASHBOARD' && <Dashboard data={data!} profile={profile} updateData={updateAppData} />}
      {currentView === 'DIET' && <DietView plan={data!.dietPlan} />}
      {currentView === 'WORKOUT' && <WorkoutView plan={data!.workoutPlan} />}
      {currentView === 'SHOPPING' && <ShoppingView items={data!.shoppingList} updateData={updateAppData} fullData={data!} />}
      {currentView === 'PROFILE' && <ProfileView profile={profile} />}
      
      <Navigation currentView={currentView} onChange={setCurrentView} />
    </div>
  );
};

export default App;