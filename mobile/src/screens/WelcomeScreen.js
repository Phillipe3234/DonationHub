import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Logo and Branding Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <FontAwesome6 name="hand-holding-heart" size={48} color="#fff" />
          </View>
          <Text style={styles.brandName}>DonationHub</Text>
          <Text style={styles.brandSlogan}>Faça a diferença na vida de alguém</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>+1000</Text>
            <Text style={styles.statLabel}>Doações</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>+500</Text>
            <Text style={styles.statLabel}>Doadores</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>+50</Text>
            <Text style={styles.statLabel}>Empresas</Text>
          </View>
        </View>

        {/* Interactive Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => onNavigate('login')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => onNavigate('register')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#512da8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#512da8',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#512da8',
    letterSpacing: 0.5,
  },
  brandSlogan: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#512da8',
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#512da8',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#512da8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'transparent',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#512da8',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#512da8',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default WelcomeScreen;