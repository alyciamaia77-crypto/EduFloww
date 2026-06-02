import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft } from 'lucide-react';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordRecoveryModal({ isOpen, onClose }: PasswordRecoveryModalProps) {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast('Por favor, informe seu e-mail.', 'error');
      return;
    }

    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);

    if (result.error) {
      toast(result.error, 'error');
    } else {
      setSubmitted(true);
      toast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
    }
  };

  const handleReset = () => {
    setEmail('');
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full">
        {!submitted ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h2>
              <p className="text-white/60 text-sm">
                Digite seu e-mail para receber um link de recuperação de senha.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-white/90">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/30"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 bg-white/10 text-white hover:bg-white/20 border border-white/20 font-medium transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-10 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : 'Enviar'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 mb-4">
                <Mail className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">E-mail Enviado!</h2>
              <p className="text-white/60 text-sm">
                Um link de recuperação de senha foi enviado para <span className="font-semibold text-white">{email}</span>
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-200 text-sm">
                ℹ️ Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </p>
            </div>

            <Button
              onClick={handleReset}
              className="w-full h-10 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold transition-all"
            >
              Fechar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
