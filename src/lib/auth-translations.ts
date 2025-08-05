// Translation utility for authentication error messages
export function translateAuthError(error: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Credenciais de login inválidas',
    'Email not confirmed': 'Email não confirmado',
    'User not found': 'Usuário não encontrado',
    'Invalid email': 'Email inválido',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
    'User already registered': 'Usuário já cadastrado',
    'Email already exists': 'Email já existe',
    'Weak password': 'Senha muito fraca',
    'Network error': 'Erro de rede',
    'Signup disabled': 'Cadastro desabilitado',
    'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
    'Email rate limit exceeded': 'Limite de emails excedido. Aguarde antes de tentar novamente',
  };

  // Check for exact matches first
  if (translations[error]) {
    return translations[error];
  }

  // Check for partial matches
  for (const [englishKey, portugueseValue] of Object.entries(translations)) {
    if (error.toLowerCase().includes(englishKey.toLowerCase())) {
      return portugueseValue;
    }
  }

  // If no translation found, return original error
  return error;
}