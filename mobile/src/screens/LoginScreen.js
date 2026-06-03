import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome6 } from '@expo/vector-icons';
import { API_BASE_URL } from '../lib/config';

const LoginScreen = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OTP States (se precisar)
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Preencha todos os campos!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      console.log(`Tentando conectar ao backend em: ${API_BASE_URL}/api/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Se o backend exigir verificação OTP em duas etapas
      if (data.requireOtp) {
        setShowOtp(true);
        Alert.alert('Código Enviado', data.message || 'Digite o código recebido no seu e-mail.');
      } else {
        // Login direto de sucesso
        await saveSession(data.token, data.user);
      }
    } catch (error) {
      console.error('Erro de login:', error);
      setErrorMsg(error.message || 'Não foi possível conectar ao servidor. Verifique o IP configurado!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      setErrorMsg('Digite o código de 6 dígitos');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      await saveSession(data.token, data.user);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (token, user) => {
    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      onLoginSuccess(user);
    } catch (e) {
      console.error('Erro ao salvar sessão localmente:', e);
      setErrorMsg('Erro ao iniciar sessão.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('welcome')}>
            <FontAwesome6 name="arrow-left" size={20} color="#512da8" />
          </TouchableOpacity>

          <View style={styles.content}>
            
            {/* Header logo / Title */}
            <View style={styles.header}>
              <View style={styles.logo}>
                <FontAwesome6 name="lock" size={32} color="#fff" />
              </View>
              <Text style={styles.title}>{showOtp ? 'Verificação OTP' : 'Entrar'}</Text>
              <Text style={styles.subtitle}>
                {showOtp 
                  ? 'Digite o código de segurança enviado ao seu e-mail para continuar' 
                  : 'Entre com seus dados para gerenciar suas doações'}
              </Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <FontAwesome6 name="circle-exclamation" size={16} color="#c62828" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            {!showOtp ? (
              // LOGIN FORM
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <FontAwesome6 name="envelope" size={16} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <FontAwesome6 name="key" size={16} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={styles.input}
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <FontAwesome6 name={showPassword ? "eye" : "eye-slash"} size={16} color="#512da8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.forgotLink} onPress={() => Alert.alert('Esqueceu a senha?', 'Entre em contato com o administrador para redefinir sua senha.')}>
                  <Text style={styles.forgotLinkText}>Esqueceu sua senha?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.buttonDisabled]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Entrar</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // OTP VERIFICATION FORM
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <FontAwesome6 name="shield-halved" size={18} color="#666" style={styles.inputIcon} />
                  <TextInput 
                    style={[styles.input, styles.otpInput]}
                    placeholder="Código de 6 dígitos"
                    value={otpCode}
                    onChangeText={setOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, loading && styles.buttonDisabled]} 
                  onPress={handleVerifyOtp}
                  disabled={loading || otpCode.length < 6}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Verificar Código</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backToLogin} onPress={() => { setShowOtp(false); setErrorMsg(''); }}>
                  <Text style={styles.backToLoginText}>Voltar para o login</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom link to Register */}
            {!showOtp && (
              <TouchableOpacity style={styles.registerLink} onPress={() => onNavigate('register')}>
                <Text style={styles.registerLinkText}>
                  Não tem uma conta? <Text style={styles.registerLinkTextBold}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#512da8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#512da8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#c62828',
    fontWeight: '500',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    height: '100%',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotLink: {
    alignSelf: 'flex-end',
  },
  forgotLinkText: {
    fontSize: 13,
    color: '#512da8',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#512da8',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#512da8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: 12,
  },
  backToLoginText: {
    color: '#512da8',
    fontSize: 14,
    fontWeight: '600',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 28,
  },
  registerLinkText: {
    fontSize: 13,
    color: '#666',
  },
  registerLinkTextBold: {
    color: '#512da8',
    fontWeight: 'bold',
  },
});

export default LoginScreen;