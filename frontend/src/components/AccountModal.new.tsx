import { X, User, Mail, Calendar, Settings, Lock, Save, RefreshCw, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'profile' | 'settings' | 'security';

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isRestartDialogOpen, setIsRestartDialogOpen] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  // Handlers
  const handleClose = () => {
    setActiveTab('profile');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setDeleteConfirmation('');
    setShowDeleteModal(false);
    setIsRestartDialogOpen(false);
    onClose();
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', { firstName, lastName });
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.error('Bitte fülle alle Passwort-Felder aus.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      console.error('Die neuen Passwörter stimmen nicht überein.');
      return;
    }
    
    if (newPassword.length < 8) {
      console.error('Das neue Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    console.log('Updating password...');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRestartOnboarding = () => {
    setIsRestartDialogOpen(true);
  };

  const confirmRestartOnboarding = () => {
    setIsRestartDialogOpen(false);
    handleClose();
    navigate('/onboarding?restart=true');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'LÖSCHEN') {
      console.error('Bitte gib "LÖSCHEN" ein, um fortzufahren');
      return;
    }

    try {
      await authAPI.deleteAccount();
      setShowDeleteModal(false);
      setDeleteConfirmation('');
      handleClose();
      useAuthStore.getState().logout();
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
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full max-w-[85vw] max-h-[95vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/95 dark:bg-gray-800/95 flex items-center justify-center shadow-lg">
                <User size={28} className="text-primary-600 dark:text-accent-dark-600" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white m-0">Account Einstellungen</h2>
                <p className="text-white/90 text-base mt-1">Verwalte dein Konto</p>
              </div>
            </div>
            <button 
              onClick={handleClose}
              className="p-3 bg-red-500/20 hover:bg-red-500 border-0 rounded-xl text-red-500 hover:text-white cursor-pointer transition-colors duration-200"
            >
              <X size={28} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <TabButton
              active={activeTab === 'profile'}
              onClick={() => setActiveTab('profile')}
              icon={<User size={20} />}
              label="Profil"
            />
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<Settings size={20} />}
              label="Einstellungen"
            />
            <TabButton
              active={activeTab === 'security'}
              onClick={() => setActiveTab('security')}
              icon={<Lock size={20} />}
              label="Sicherheit"
            />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-gray-50 dark:bg-gray-800">
            {activeTab === 'profile' && (
              <ProfileTab
                firstName={firstName}
                lastName={lastName}
                email={user?.email || ''}
                createdAt={user?.createdAt || ''}
                onFirstNameChange={setFirstName}
                onLastNameChange={setLastName}
                onSave={handleSaveProfile}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab
                onRestartOnboarding={handleRestartOnboarding}
                onDeleteAccount={() => setShowDeleteModal(true)}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onUpdatePassword={handleUpdatePassword}
              />
            )}
          </div>
        </div>
      </div>

      {/* Restart Onboarding Dialog */}
      <ConfirmDialog
        isOpen={isRestartDialogOpen}
        onClose={() => setIsRestartDialogOpen(false)}
        onConfirm={confirmRestartOnboarding}
        title="Fragebogen neu ausfüllen?"
        message="Möchtest du den Onboarding-Fragebogen wirklich neu starten? Deine aktuellen Einstellungen bleiben erhalten."
        confirmText="Ja, neu starten"
        cancelText="Abbrechen"
        type="info"
      />

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Account löschen?
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Trades, Strategien und Einstellungen werden permanent gelöscht.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Gib "LÖSCHEN" ein, um fortzufahren:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="LÖSCHEN"
              />
            </div>

            <div className="flex gap-3">
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

// Tab Button Component
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 border-0 rounded-xl text-base font-medium cursor-pointer transition-colors duration-200 ${
        active
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white shadow-lg'
          : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Profile Tab Component
function ProfileTab({ 
  firstName, 
  lastName, 
  email, 
  createdAt, 
  onFirstNameChange, 
  onLastNameChange, 
  onSave 
}: { 
  firstName: string; 
  lastName: string; 
  email: string; 
  createdAt: string; 
  onFirstNameChange: (value: string) => void; 
  onLastNameChange: (value: string) => void; 
  onSave: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto">
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
            onChange={(e) => onFirstNameChange(e.target.value)}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
            placeholder="Dein Vorname"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nachname</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
            placeholder="Dein Nachname"
          />
        </div>

        <div className="flex flex-col col-span-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            <Mail size={18} className="inline mr-1" />
            E-Mail
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        <div className="flex items-center gap-3 p-6 rounded-xl bg-primary-50 dark:bg-gray-800 border-2 border-primary-200 dark:border-accent-dark-600/30 text-gray-700 dark:text-white text-base col-span-2">
          <Calendar size={20} className="text-primary-600 dark:text-accent-dark-600" />
          <span>Account erstellt am: {new Date(createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold border-0 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white cursor-pointer transition-colors duration-200 hover:opacity-90"
        >
          <Save size={22} />
          Speichern
        </button>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ 
  onRestartOnboarding, 
  onDeleteAccount 
}: { 
  onRestartOnboarding: () => void; 
  onDeleteAccount: () => void;
}) {
  const settings = [
    { label: 'E-Mail Benachrichtigungen', description: 'Erhalte Updates über deine Trades' },
    { label: 'Tägliche Zusammenfassung', description: 'Tägliche Übersicht deiner Aktivitäten' },
    { label: 'Performance Warnungen', description: 'Warnungen bei wichtigen Meilensteinen' },
    { label: 'Wöchentliche Reports', description: 'Wöchentliche Performance-Berichte' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-8">
        <Settings size={28} className="text-primary-600 dark:text-accent-dark-600" />
        Benachrichtigungen & Einstellungen
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {settings.map((setting) => (
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
          onClick={onRestartOnboarding}
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
          onClick={onDeleteAccount}
          className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold border-2 border-red-600 dark:border-red-500 rounded-xl bg-red-600 text-white cursor-pointer transition-colors duration-200 hover:bg-red-700"
        >
          <Trash2 size={20} />
          Account löschen
        </button>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ 
  currentPassword, 
  newPassword, 
  confirmPassword, 
  onCurrentPasswordChange, 
  onNewPasswordChange, 
  onConfirmPasswordChange, 
  onUpdatePassword 
}: { 
  currentPassword: string; 
  newPassword: string; 
  confirmPassword: string; 
  onCurrentPasswordChange: (value: string) => void; 
  onNewPasswordChange: (value: string) => void; 
  onConfirmPasswordChange: (value: string) => void; 
  onUpdatePassword: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto">
      <h3 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-8">
        <Lock size={28} className="text-primary-600 dark:text-accent-dark-600" />
        Sicherheitseinstellungen
      </h3>

      <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm">
        <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Passwort ändern</h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Aktuelles Passwort
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
              placeholder="Dein aktuelles Passwort"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Neues Passwort
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
              placeholder="Mindestens 8 Zeichen"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Neues Passwort bestätigen
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="w-full px-5 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200 focus:outline-none focus:border-primary-600 dark:focus:border-accent-dark-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:ring-accent-dark-600/20"
              placeholder="Passwort wiederholen"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onUpdatePassword}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold border-0 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-accent-dark-600 dark:to-accent-dark-700 text-white cursor-pointer transition-colors duration-200 hover:opacity-90"
          >
            <Lock size={22} />
            Passwort aktualisieren
          </button>
        </div>
      </div>
    </div>
  );
}
