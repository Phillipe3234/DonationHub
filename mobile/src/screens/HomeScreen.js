import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modals
import MenuDrawer from '../components/MenuDrawer';
import CompanyModal from '../components/CompanyModal';
import ProfileModal from '../components/ProfileModal';
import HistoryModal from '../components/HistoryModal';

const { width } = Dimensions.get('window');

const companies = [
  { id: 1, name: 'Empresa A', pix: '11945957447', category: 'Saúde', description: 'Apoie hospitais, tratamentos médicos e compra de suprimentos vitais para quem precisa.' },
  { id: 2, name: 'Empresa B', pix: '11945957448', category: 'Educação', description: 'Ajude escolas comunitárias, forneça material didático e bolsas de estudo para jovens carentes.' },
  { id: 3, name: 'Empresa C', pix: '11945957449', category: 'Meio Ambiente', description: 'Apoie o plantio de árvores, a preservação de nascentes e projetos de reciclagem urbana.' },
  { id: 4, name: 'Empresa D', pix: '11945957450', category: 'Animais', description: 'Contribua com abrigos de cães e gatos, tratamentos veterinários e campanhas de adoção.' },
  { id: 5, name: 'Empresa E', pix: '11945957451', category: 'Crianças', description: 'Ajude orfanatos, projetos esportivos no contra-turno e alimentação infantil saudável.' },
  { id: 6, name: 'Empresa F', pix: '11945957452', category: 'Idosos', description: 'Leve conforto a casas de repouso, apoie a compra de fraldas geriátricas e atividades físicas.' },
  { id: 7, name: 'Empresa G', pix: '11945957453', category: 'Cultura', description: 'Incentive festivais de teatro de rua, oficinas de música e a preservação do folclore local.' },
  { id: 8, name: 'Empresa H', pix: '11945957454', category: 'Esportes', description: 'Patrocine atletas da periferia, forneça quimonos, bolas e estimule a inclusão social pelo esporte.' },
  { id: 9, name: 'fsjpii', pix: '11945957447', category: 'Saúde', description: 'Ajuda financeira continuada para tratamentos complexos de saúde e apoio a famílias.' }
];

const categories = ['Todos', 'Saúde', 'Educação', 'Meio Ambiente', 'Animais', 'Crianças', 'Idosos', 'Cultura', 'Esportes'];

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Saúde': return 'heart-pulse';
    case 'Educação': return 'graduation-cap';
    case 'Meio Ambiente': return 'leaf';
    case 'Animais': return 'paw';
    case 'Crianças': return 'child';
    case 'Idosos': return 'person-cane';
    case 'Cultura': return 'masks-theater';
    case 'Esportes': return 'volleyball';
    default: return 'building-ngo';
  }
};

const HomeScreen = ({ user, setUser, onLogout }) => {
  // Drawer & Modals visibility states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompanyDonation, setShowCompanyDonation] = useState(false);

  // Data states
  const [donations, setDonations] = useState([]);
  const [totalDonated, setTotalDonated] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    if (user) {
      loadDonations();
    }
  }, [user]);

  const loadDonations = async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`donations_${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDonations(parsed);
        const total = parsed.reduce((sum, donation) => sum + donation.amount, 0);
        setTotalDonated(total);
      }
    } catch (e) {
      console.error('Erro ao carregar doações do AsyncStorage:', e);
    }
  };

  const handleDonation = async (company, amount) => {
    const newDonation = {
      id: Date.now(),
      user_id: user.id,
      company_name: company.name,
      company_pix: company.pix,
      amount: amount,
      created_at: new Date().toISOString()
    };

    const updatedDonations = [newDonation, ...donations];
    setDonations(updatedDonations);
    setTotalDonated(prev => prev + amount);

    try {
      await AsyncStorage.setItem(`donations_${user.id}`, JSON.stringify(updatedDonations));
      Alert.alert(
        'Muito Obrigado!',
        `Sua doação de R$ ${amount.toFixed(2)} para ${company.name} foi registrada com sucesso.`
      );
    } catch (e) {
      console.error('Erro ao salvar doação no AsyncStorage:', e);
      Alert.alert('Erro', 'Não foi possível registrar a doação localmente.');
    }
  };

  const filteredCompanies = selectedCategory === 'Todos'
    ? companies
    : companies.filter(company => company.category === selectedCategory);

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.menuBtn} onPress={() => setIsMenuOpen(true)}>
          <FontAwesome6 name="bars" size={20} color="#512da8" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>DonationHub</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() => setShowProfile(true)}>
          <FontAwesome6 name="circle-user" size={24} color="#512da8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>Olá,</Text>
          <Text style={styles.welcomeTitle}>{user?.nome || user?.name || 'Doador'}!</Text>
        </View>

        {/* Dashboard Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#e8f5e9' }]}>
              <FontAwesome6 name="hand-holding-heart" size={18} color="#2e7d32" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statValue}>{donations.length}</Text>
              <Text style={styles.statLabel}>Doações feitas</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconCircle, { backgroundColor: '#e0f2fe' }]}>
              <FontAwesome6 name="brazilian-real-sign" size={16} color="#0369a1" />
            </View>
            <View style={styles.statDetails}>
              <Text style={styles.statValue}>R$ {totalDonated.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total doado</Text>
            </View>
          </View>
        </View>

        {/* Categories Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Filtrar por Causa</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryBadge,
                selectedCategory === cat && styles.categoryBadgeActive
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <FontAwesome6
                name={getCategoryIcon(cat)}
                size={12}
                color={selectedCategory === cat ? '#fff' : '#512da8'}
                style={{ marginRight: 6 }}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section Banner */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Causas em Destaque ({filteredCompanies.length})</Text>
        </View>

        {/* Grid/List of Companies */}
        <View style={styles.companiesList}>
          {filteredCompanies.map(company => (
            <View key={company.id} style={styles.companyCard}>
              <View style={styles.companyCardHeader}>
                <View style={styles.companyIconCircle}>
                  <FontAwesome6 name={getCategoryIcon(company.category)} size={20} color="#512da8" />
                </View>
                <View style={styles.companyMeta}>
                  <Text style={styles.companyName}>{company.name}</Text>
                  <Text style={styles.companyCategory}>{company.category}</Text>
                </View>
              </View>
              <Text style={styles.companyDesc}>{company.description}</Text>

              <TouchableOpacity
                style={styles.donateBtn}
                onPress={() => setSelectedCompany(company)}
              >
                <Text style={styles.donateBtnText}>Doar Agora</Text>
                <FontAwesome6 name="chevron-right" size={10} color="#fff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Side Menu Drawer */}
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        setShowProfile={setShowProfile}
        setShowHistory={setShowHistory}
        setShowCompanyDonation={setShowCompanyDonation}
        handleLogout={onLogout}
        user={user}
      />

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          setUser={setUser}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          donations={donations}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Company/Project Support Modal */}
      {showCompanyDonation && (
        <CompanyModal
          company={{ name: 'Nossa Empresa (DonationHub)', pix: '11945957447', description: 'Apoie o DonationHub para que possamos expandir nosso projeto e manter o aplicativo no ar!' }}
          onClose={() => setShowCompanyDonation(false)}
          onDonate={handleDonation}
        />
      )}

      {/* Company Pix Modal */}
      {selectedCompany && (
        <CompanyModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onDonate={handleDonation}
        />
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  navBar: {
    height: Platform.OS === 'android' ? 64 + (StatusBar.currentHeight || 24) : 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      }
    }),
  },
  menuBtn: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#512da8',
    letterSpacing: 0.5,
  },
  profileBtn: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  statDetails: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0d7f7',
  },
  categoryBadgeActive: {
    backgroundColor: '#512da8',
    borderColor: '#512da8',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#512da8',
  },
  categoryTextActive: {
    color: '#fff',
  },
  companiesList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  companyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  companyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  companyMeta: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  companyCategory: {
    fontSize: 11,
    color: '#512da8',
    fontWeight: 'bold',
    marginTop: 2,
  },
  companyDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 16,
  },
  donateBtn: {
    flexDirection: 'row',
    backgroundColor: '#512da8',
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#512da8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  donateBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default HomeScreen;