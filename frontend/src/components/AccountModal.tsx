import { X, User, Mail, Calendar, Settings, Lock, Save, RefreshCw, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'security'>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Blockiere Body-Scroll wenn Modal offen ist
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup beim Unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Schließe Modal automatisch bei Route-Änderung
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSaveProfile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Saving profile:', { firstName, lastName });
  };

  const handleUpdatePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.error('Bitte fülle alle Passwort-Felder aus.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      console.error('Die neuen Passwörter stimmen nicht überein.');
      return;
    }
    
    console.log('Updating password...');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleRestartOnboarding = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Schließe Modal SOFORT
    onClose();
    // Navigiere zur Onboarding-Seite
    navigate('/onboarding?restart=true');
  };

  const handleDeleteAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (deleteConfirmation !== 'LÖSCHEN') {
      console.error('Bitte gib "LÖSCHEN" ein, um fortzufahren');
      return;
    }

    try {
      await authAPI.deleteAccount();
      
      // Modal schließen
      setShowDeleteModal(false);
      setDeleteConfirmation('');
      onClose();
      
      // Benutzer ausloggen (löscht Token und User-Daten)
      useAuthStore.getState().logout();
      
      // Zur Homepage weiterleiten
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      let errorMessage = 'Fehler beim Löschen des Accounts';
      
      if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Server ist nicht erreichbar. Bitte prüfe ob der Backend-Server läuft.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" 
        onClick={handleCloseModal} 
      />
      
      {/* Modal Container */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-[85vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/95 dark:bg-gray-800/95 flex items-center justify-center shadow-lg">
                <User size={28} className="text-primary-600 dark:text-accent-dark-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white m-0">Account Einstellungen</h2>
                <p className="text-white/90 dark:text-white/85 text-base mt-1">Verwalte dein Konto</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="p-3 bg-red-500/20 hover:bg-red-500 border-0 rounded-xl text-red-500 hover:text-white cursor-pointer transition-colors duration-200"
            >
              <X size={28} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 border-0 rounded-xl text-base font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white shadow-lg'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <User size={20} />
              Profil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-3 border-0 rounded-xl text-base font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white shadow-lg'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Settings size={20} />
              Einstellungen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-2 px-6 py-3 border-0 rounded-xl text-base font-medium cursor-pointer transition-colors duration-200 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white shadow-lg'
                  : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Lock size={20} />
              Sicherheit
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-gray-50 dark:bg-gray-800">
            {activeTab === 'profile' && (
              <div key="profile" className="max-w-7xl mx-auto">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  <User size={28} className="text-primary-600 dark:text-accent-dark-600" />
                  Persönliche Informationen
                </h3>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Vorname</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
                      placeholder="Dein Vorname"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nachname</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
                      placeholder="Dein Nachname"
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Mail size={18} className="inline mr-1" />
                      E-Mail Adresse
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed transition-all duration-300"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">E-Mail kann nicht geändert werden</p>
                  </div>

                  <div className="flex items-center gap-3 p-6 rounded-xl bg-primary-50 dark:bg-gray-800 border-2 border-primary-200 dark:border-accent-dark-600/30 text-gray-700 dark:text-white text-base col-span-2">
                    <Calendar size={20} className="text-primary-600 dark:text-accent-dark-600" />
                    <span>Account erstellt am:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="px-8 py-4 text-lg font-semibold border-0 rounded-xl bg-transparent text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Abbrechen
                  </button>
                  <button 
                    type="button" 
                    onClick={handleSaveProfile} 
                    className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold border-0 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white cursor-pointer transition-colors duration-200 hover:opacity-90"
                  >
                    <Save size={22} className="transition-transform duration-300 group-hover:rotate-12" />
                    Speichern
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div key="settings" className="max-w-7xl mx-auto">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  <Settings size={28} className="text-primary-600 dark:text-accent-dark-600" />
                  Benachrichtigungen & Einstellungen
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[
                    { label: 'E-Mail Benachrichtigungen', description: 'Erhalte Updates über deine Trades' },
                    { label: 'Tägliche Zusammenfassung', description: 'Tägliche Übersicht deiner Aktivitäten' },
                    { label: 'Performance Warnungen', description: 'Warnungen bei wichtigen Meilensteinen' },
                    { label: 'Wöchentliche Reports', description: 'Wöchentliche Performance-Berichte' },
                  ].map((setting, index) => (
                    <div key={setting.label} className="flex items-center justify-between p-7 rounded-xl bg-white dark:bg-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-600 group cursor-pointer">
                      <div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white m-0 mb-1 transition-colors group-hover:text-primary-600 dark:group-hover:text-accent-dark-600">{setting.label}</p>
                        <p className="text-base text-gray-600 dark:text-gray-400 m-0">{setting.description}</p>
                      </div>
                      <label className="relative inline-block w-14 h-7 cursor-pointer">
                        <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                        <span className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 dark:bg-gray-600 transition-all duration-200 rounded-full before:absolute before:content-[''] before:h-5 before:w-5 before:left-1 before:bottom-1 before:bg-white before:transition-all before:duration-200 before:rounded-full peer-checked:bg-primary-600 dark:peer-checked:bg-accent-dark-600 peer-checked:before:translate-x-7"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-12 p-8 rounded-2xl bg-primary-50 dark:bg-gray-800 border-2 border-primary-200 dark:border-accent-dark-600/30">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white m-0 mb-3">Fragebogen neu ausfüllen</h4>
                  <p className="text-base text-gray-700 dark:text-white m-0 mb-6 leading-relaxed">
                    Möchtest du den Onboarding-Fragebogen neu durchlaufen? Dies kann hilfreich sein, wenn sich deine Trading-Ziele oder Erfahrung geändert haben.
                  </p>
                  <button 
                    type="button" 
                    onClick={handleRestartOnboarding} 
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border-2 border-primary-600 dark:border-accent-dark-600 rounded-xl bg-white dark:bg-gray-800 text-primary-600 dark:text-accent-dark-600 cursor-pointer transition-colors duration-200 hover:bg-primary-600 dark:hover:bg-accent-dark-600 hover:text-white"
                  >
                    <RefreshCw size={20} />
                    Fragebogen neu starten
                  </button>
                </div>

                <div className="mt-8 p-8 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                  <h4 className="text-xl font-bold text-red-900 dark:text-red-200 m-0 mb-3 flex items-center gap-2">
                    <Trash2 size={24} />
                    Gefahrenzone
                  </h4>
                  <p className="text-base text-red-700 dark:text-red-300 m-0 mb-6 leading-relaxed">
                    Sobald du deinen Account löschst, gibt es kein Zurück mehr. Alle deine Daten, Trades und Einstellungen werden permanent gelöscht.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setShowDeleteModal(true)} 
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border-2 border-red-600 dark:border-red-500 rounded-xl bg-red-600 text-white cursor-pointer transition-colors duration-200 hover:bg-red-700"
                  >
                    <Trash2 size={20} />
                    Account löschen
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div key="security" className="max-w-7xl mx-auto">
                <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  <Lock size={28} className="text-primary-600 dark:text-accent-dark-600" />
                  Sicherheitseinstellungen
                </h3>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div className="flex flex-col col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Aktuelles Passwort</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Aktuelles Passwort eingeben"
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-4 focus:ring-primary-600/15 dark:focus:ring-accent-dark-600/15"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Neues Passwort</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Neues Passwort eingeben"
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-4 focus:ring-primary-600/15 dark:focus:ring-accent-dark-600/15"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Neues Passwort bestätigen</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Neues Passwort bestätigen"
                      className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-4 focus:ring-primary-600/15 dark:focus:ring-accent-dark-600/15"
                    />
                  </div>

                  <div className="flex flex-col col-span-2">
                    <button 
                      type="button" 
                      onClick={handleUpdatePassword} 
                      className="w-full flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold border-0 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white cursor-pointer transition-colors duration-200 hover:opacity-90"
                    >
                      <Lock size={22} />
                      Passwort aktualisieren
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4" onClick={() => setShowDeleteModal(false)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                Account löschen?
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Trades, Strategien und Einstellungen werden permanent gelöscht.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Gib "LÖSCHEN" ein, um fortzufahren:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-red-600 dark:focus:border-red-500 focus:ring-4 focus:ring-red-600/15"
                placeholder="LÖSCHEN"
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-6 py-4 text-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'LÖSCHEN'}
                className="flex-1 px-6 py-4 text-lg font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Endgültig löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
