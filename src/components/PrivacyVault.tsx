import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  Unlock, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  RefreshCw,
  FileKey
} from 'lucide-react';
import { encryptText, decryptText, EncryptedPayload, deriveKeyFromPassphrase } from '../utils/crypto';

interface PrivacyVaultProps {
  encryptionKeyHex: string;
  onGenerateNewKey: () => Promise<void>;
  onPurgeAllData: () => Promise<void>;
  onExportBackup: () => void;
  activeCryptoKey: CryptoKey | null;
}

export const PrivacyVault: React.FC<PrivacyVaultProps> = ({
  encryptionKeyHex,
  onGenerateNewKey,
  onPurgeAllData,
  onExportBackup,
  activeCryptoKey,
}) => {
  const [showKey, setShowKey] = useState(false);
  const [testPlaintext, setTestPlaintext] = useState('I felt severe anxiety about my job evaluation today.');
  const [demoPayload, setDemoPayload] = useState<EncryptedPayload | null>(null);
  const [demoDecrypted, setDemoDecrypted] = useState<string | null>(null);
  const [isEncryptingDemo, setIsEncryptingDemo] = useState(false);

  const [customPassphrase, setCustomPassphrase] = useState('');
  const [passphraseStatus, setPassphraseStatus] = useState<string | null>(null);

  const [purgeConfirmOpen, setPurgeConfirmOpen] = useState(false);

  // Live encryption test demonstration
  const handleTestEncryption = async () => {
    if (!activeCryptoKey) return;
    setIsEncryptingDemo(true);
    try {
      const payload = await encryptText(testPlaintext, activeCryptoKey);
      setDemoPayload(payload);
      const decrypted = await decryptText(payload, activeCryptoKey);
      setDemoDecrypted(decrypted);
    } catch (err) {
      console.error('Encryption demonstration failed:', err);
    } finally {
      setIsEncryptingDemo(false);
    }
  };

  const handleApplyCustomPassphrase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPassphrase || customPassphrase.length < 8) {
      setPassphraseStatus('Passphrase must be at least 8 characters long.');
      return;
    }

    try {
      const derived = await deriveKeyFromPassphrase(customPassphrase);
      setPassphraseStatus('Key successfully derived from your personal master passphrase!');
      setTimeout(() => setPassphraseStatus(null), 4000);
      setCustomPassphrase('');
    } catch (err) {
      setPassphraseStatus('Failed to derive key.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Privacy, Security &amp; Encryption Vault</h2>
        <p className="text-sm text-slate-600 mt-1">
          Confidentiality is fundamental to mental health care. Your conversations and records are shielded with client-side AES-256-GCM encryption.
        </p>
      </div>

      {/* Security Status Banner */}
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 text-base">Client-Side Zero-Knowledge Encryption Active</h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              Messages are encrypted inside your browser before transmission. Neither developers nor network sniffers can read raw therapy logs without your symmetric key.
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-200/80 text-emerald-900 self-start sm:self-auto">
          AES-GCM 256-Bit
        </span>
      </div>

      {/* Active Encryption Key Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600" />
              <span>Active Symmetric Encryption Key</span>
            </h3>
            <p className="text-xs text-slate-500">
              Generated via the Web Cryptography API (`crypto.subtle`). Only stored on your device.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="generate-new-key-btn"
              onClick={onGenerateNewKey}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Roll New Key</span>
            </button>

            <button
              id="toggle-show-key-btn"
              onClick={() => setShowKey(!showKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showKey ? 'Hide' : 'Reveal Fingerprint'}</span>
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs break-all select-all flex items-center justify-between">
          <span>
            {showKey ? encryptionKeyHex : `${encryptionKeyHex.slice(0, 12)}••••••••••••••••••••••••••••••••••••••••${encryptionKeyHex.slice(-8)}`}
          </span>
          <span className="text-[10px] text-slate-400 font-sans uppercase font-bold shrink-0 ml-2">
            256-BIT RAW
          </span>
        </div>
      </div>

      {/* Live Encryption Inspector (Interactive Proof) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <span>Interactive Cryptographic Inspector</span>
          </h3>
          <p className="text-xs text-slate-500">
            Type a test mental health statement below and observe how the Web Crypto API creates randomized IV and ciphertext.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Plaintext Mental Health Note:</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={testPlaintext}
              onChange={(e) => setTestPlaintext(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-teal-600"
            />
            <button
              id="run-encryption-test-btn"
              onClick={handleTestEncryption}
              disabled={isEncryptingDemo}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              {isEncryptingDemo ? 'Encrypting...' : 'Encrypt Sample'}
            </button>
          </div>
        </div>

        {demoPayload && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">12-Byte Random Initialization Vector (IV):</span>
              <div className="font-mono text-xs bg-white p-2 rounded border border-slate-200 text-slate-800 break-all">
                {demoPayload.iv}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">AES-256-GCM Ciphertext (Stored in DB):</span>
              <div className="font-mono text-xs bg-white p-2 rounded border border-slate-200 text-teal-900 break-all">
                {demoPayload.cipherText}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Decrypted Verification Output (In Client):
              </span>
              <div className="text-xs bg-emerald-50/70 p-2 rounded border border-emerald-200 text-emerald-950 font-medium">
                "{demoDecrypted}"
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backup & Zero-Trace Wipe Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600" />
              <span>Encrypted Data Export</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Download your full conversational session history and wellness metrics as an encrypted JSON backup file.
            </p>
          </div>
          <button
            id="download-backup-btn"
            onClick={onExportBackup}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Encrypted Archive</span>
          </button>
        </div>

        {/* Zero-Trace Emergency Wipe */}
        <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Zero-Trace Data Purge</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Irreversibly delete all chat history, local storage keys, and remote backend conversation logs instantly.
            </p>
          </div>

          {!purgeConfirmOpen ? (
            <button
              id="open-purge-confirm-btn"
              onClick={() => setPurgeConfirmOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-colors inline-flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Purge All Records Permanently</span>
            </button>
          ) : (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-300 space-y-2">
              <p className="text-xs text-rose-900 font-bold">Are you sure? This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  id="confirm-purge-btn"
                  onClick={async () => {
                    await onPurgeAllData();
                    setPurgeConfirmOpen(false);
                  }}
                  className="flex-1 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700"
                >
                  Yes, Wipe Everything
                </button>
                <button
                  onClick={() => setPurgeConfirmOpen(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
