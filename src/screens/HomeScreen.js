import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Input, Overlay, Text } from 'react-native-elements';
import { auth, db } from '../config/firebase';

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState({
    nombre: '',
    apellido: '',
    comidaFavorita: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    apellido: '',
    comidaFavorita: ''
  });

  const [loadingStates, setLoadingStates] = useState({
    initialLoad: true,
    updating: false,
    signingOut: false
  });

  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState('');

  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      if (!auth.currentUser) {
        console.log("Usuario no autenticado, esperando...");
        return;
      }
      await loadProfile();
    };
    checkAuthAndLoadProfile();
  }, []);

  const showOverlay = (message) => {
    setOverlayMessage(message);
    setOverlayVisible(true);
  };

  const hideOverlay = () => {
    setOverlayVisible(false);
    setOverlayMessage('');
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      nombre: '',
      apellido: '',
      comidaFavorita: ''
    };

    if (!profile.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    } else if (profile.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    if (!profile.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
      isValid = false;
    } else if (profile.apellido.length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      isValid = false;
    }

    if (!profile.comidaFavorita.trim()) {
      newErrors.comidaFavorita = 'La comida favorita es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const loadProfile = async () => {
    try {
      const docRef = doc(db, "usuarios", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      showOverlay("Error al cargar el perfil");
    } finally {
      setLoadingStates(prev => ({ ...prev, initialLoad: false }));
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, updating: true }));
    try {
      await setDoc(doc(db, 'usuarios', auth.currentUser.uid), profile);
      showOverlay('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showOverlay('Error al actualizar perfil');
    } finally {
      setLoadingStates(prev => ({ ...prev, updating: false }));
    }
  };

  const handleSignOut = async () => {
    setLoadingStates(prev => ({ ...prev, signingOut: true }));
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showOverlay('Error al cerrar sesión');
      setLoadingStates(prev => ({ ...prev, signingOut: false }));
    }
  };

  if (loadingStates.initialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Overlay
        isVisible={overlayVisible}
        onBackdropPress={hideOverlay}
        overlayStyle={styles.overlay}
      >
        <Text style={styles.overlayText}>{overlayMessage}</Text>
        <Button
          title="Aceptar"
          onPress={hideOverlay}
          containerStyle={styles.overlayButton}
        />
      </Overlay>

      <Text h4 style={styles.title}>Mi Perfil</Text>

      <Input
        placeholder="Nombre"
        value={profile.nombre}
        onChangeText={(text) => {
          setProfile({...profile, nombre: text});
          setErrors({...errors, nombre: ''});
        }}
        errorMessage={errors.nombre}
        disabled={loadingStates.updating || loadingStates.signingOut}
      />
      <Input
        placeholder="Apellido"
        value={profile.apellido}
        onChangeText={(text) => {
          setProfile({...profile, apellido: text});
          setErrors({...errors, apellido: ''});
        }}
        errorMessage={errors.apellido}
        disabled={loadingStates.updating || loadingStates.signingOut}
      />
      <Input
        placeholder="Comida Favorita"
        value={profile.comidaFavorita}
        onChangeText={(text) => {
          setProfile({...profile, comidaFavorita: text});
          setErrors({...errors, comidaFavorita: ''});
        }}
        errorMessage={errors.comidaFavorita}
        disabled={loadingStates.updating || loadingStates.signingOut}
      />
      <Button
        title="Actualizar Perfil"
        onPress={handleUpdate}
        containerStyle={styles.button}
        loading={loadingStates.updating}
        disabled={loadingStates.updating || loadingStates.signingOut}
      />
      <Button
        title="Cerrar Sesión"
        type="outline"
        onPress={handleSignOut}
        containerStyle={styles.button}
        loading={loadingStates.signingOut}
        disabled={loadingStates.updating || loadingStates.signingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 10,
  },
  overlay: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
  },
  overlayText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 15,
  },
  overlayButton: {
    marginTop: 10,
  }
});