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
import { FontAwesome6 } from '@expo/vector-icons';
import { API_BASE_URL } from '../lib/config';
import TermsModal from '../components/TermsModal';

// Calcula a força da senha e retorna os critérios
const checkPasswordStrength = (pwd) => ({
  length:    pwd.length >= 8,
  uppercase: /[A-Z]/.test(pwd),
  number:    /[0-9]/.test(pwd),
  special:   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
});

const RegisterScreen = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const strength = checkPasswordStrength(password);
  const strengthScore = Object.values(strength).filter(Boolean).length; // 0-4
  const strengthColors = ['#e0e0e0', '#ef5350', '#ffa726', '#66bb6a', '#512da8'];
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Preencha todos os campos!');
      return;
    }

    if (!acceptedTerms) {
      setErrorMsg('Você deve aceitar os Termos de Política para se cadastrar.');
      return;
    }

    if (!strength.length) {
      setErrorMsg('A senha deve ter pelo menos 8 caracteres!');
      return;
    }
    if (!strength.uppercase) {
      setErrorMsg('A senha deve conter pelo menos uma letra maiúscula!');
      return;
    }
    if (!strength.number) {
      setErrorMsg('A senha deve conter pelo menos um número!');
      return;
    }
    if (!strength.special) {
      setErrorMsg('A senha deve conter pelo menos um caractere especial (ex: !@#$%)!');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem!');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      console.log(`Tentando registrar no backend em: ${API_BASE_URL}/api/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao realizar cadastro');
      }

      Alert.alert(
        'Sucesso!', 
        'Cadastro realizado com sucesso! Faça seu login.',
        [{ text: 'OK', onPress: () => onNavigate('login') }]
      );
    } catch (error) {
      console.error('Erro de cadastro:', error);
      setErrorMsg(error.message || 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
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
                <FontAwesome6 name="user-plus" size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Cadastre-se para começar a fazer doações</Text>
            </View>

            {/* Error Banner */}
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <FontAwesome6 name="circle-exclamation" size={16} color="#c62828" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Form Fields */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <FontAwesome6 name="user" size={16} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Nome completo"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

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
                  textContentType="oneTimeCode"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <FontAwesome6 name={showPassword ? "eye" : "eye-slash"} size={16} color="#512da8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <FontAwesome6 name="key" size={16} color="#666" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="Confirmar Senha"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <FontAwesome6 name={showConfirmPassword ? "eye" : "eye-slash"} size={16} color="#512da8" />
                </TouchableOpacity>
              </View>

              {/* Indicador de Força da Senha */}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  {/* Barras de força */}
                  <View style={styles.strengthBars}>
                    {[1,2,3,4].map(i => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: i <= strengthScore ? strengthColors[strengthScore] : '#e0e0e0' }
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strengthColors[strengthScore] }]}>
                    {strengthLabels[strengthScore]}
                  </Text>

                  {/* Checklist de requisitos */}
                  <View style={styles.requirementsList}>
                    {[
                      { key: 'length',    label: 'Mínimo 8 caracteres' },
                      { key: 'uppercase', label: 'Uma letra maiúscula' },
                      { key: 'number',    label: 'Um número' },
                      { key: 'special',   label: 'Um caractere especial (!@#$%)' },
                    ].map(req => (
                      <View key={req.key} style={styles.requirementItem}>
                        <FontAwesome6
                          name={strength[req.key] ? 'circle-check' : 'circle-xmark'}
                          size={13}
                          color={strength[req.key] ? '#66bb6a' : '#bbb'}
                        />
                        <Text style={[
                          styles.requirementText,
                          strength[req.key] && styles.requirementMet
                        ]}>{req.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Checkbox Termos */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, acceptedTerms && styles.checkboxActive]}
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                  {acceptedTerms && <FontAwesome6 name="check" size={12} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>
                  Eu li e aceito os{' '}
                  <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                    Termos e Política
                  </Text>
                </Text>
              </View>

              <TouchableOpacity 
                style={[styles.submitButton, loading && styles.buttonDisabled]} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Bottom link to Login */}
            <TouchableOpacity style={styles.loginLink} onPress={() => onNavigate('login')}>
              <Text style={styles.loginLinkText}>
                Já tem uma conta? <Text style={styles.loginLinkTextBold}>Faça Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAcceptedTerms(true)}
      />
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
  strengthContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
    marginTop: 12,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 5,
    borderRadius: 4,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: -6,
  },
  requirementsList: {
    gap: 6,
    marginTop: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: '#aaa',
  },
  requirementMet: {
    color: '#66bb6a',
    fontWeight: '600',
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
  eyeIcon: {
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#512da8',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#512da8',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#666',
  },
  termsLink: {
    color: '#512da8',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
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
  loginLink: {
    alignItems: 'center',
    marginTop: 28,
  },
  loginLinkText: {
    fontSize: 13,
    color: '#666',
  },
  loginLinkTextBold: {
    color: '#512da8',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;