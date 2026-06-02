import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Mail, Lock, User, Eye, EyeOff, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nome: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let result;
    if (isLogin) {
      result = await login(form.email, form.password);
    } else {
      if (!form.nome.trim()) {
        toast('Por favor, informe seu nome completo.', 'error');
        setLoading(false);
        return;
      }
      result = await register(form.email, form.password, form.nome);
    }

    if (result.error) {
      toast(result.error, 'error');
    } else {
      toast(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!', 'success');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">EduFlow</h1>
          <p className="text-indigo-200 mt-1 text-sm">Controle suas atividades escolares</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-8 bg-white/10 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label className="text-white/90">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="text"
                    placeholder="Seu nome completo"
                    value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/30"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white/90">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/90">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-lg transition-all duration-200 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Aguarde...
                </span>
              ) : isLogin ? 'Entrar na conta' : 'Criar conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              {isLogin ? (
                <>Não tem uma conta?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-white/80 hover:text-white underline transition-colors">
                    Cadastre-se gratuitamente
                  </button>
                </>
              ) : (
                <>Já tem uma conta?{' '}
                  <button onClick={() => setIsLogin(true)} className="text-white/80 hover:text-white underline transition-colors">
                    Faça login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: 'Organização' },
            { icon: GraduationCap, label: 'Metas' },
            { icon: User, label: 'Progresso' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-white/5 rounded-xl border border-white/10">
              <Icon className="w-5 h-5 text-indigo-300" />
              <span className="text-white/60 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
