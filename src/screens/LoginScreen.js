import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Button, Text, Overlay } from "react-native-elements";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const showOverlay = (message) => {
    setOverlayMessage(message);
    setOverlayVisible(true);
  };

  const hideOverlay = () => {
    setOverlayVisible(false);
    setOverlayMessage("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: ""
    };

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ingrese un email válido";
      isValid = false;
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigation.replace("Home");
    } catch (error) {
      let errorMessage = "Error al iniciar sesión";
      
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No existe una cuenta con este email";
          break;
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta. Por favor, intente nuevamente";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del email no es válido";
          break;
        case "auth/too-many-requests":
          errorMessage = "Demasiados intentos fallidos. Por favor, intente más tarde";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifique su conexión a internet";
          break;
        case "auth/invalid-credential":
          errorMessage = "Credenciales inválidas. Verifique su email y contraseña";
          break;
        default:
          errorMessage = "Error al iniciar sesión. Por favor, intente nuevamente";
      }
      
      showOverlay(errorMessage);
      
      setFormData(prev => ({
        ...prev,
        password: ""
      }));
    } finally {
      setLoading(false);
    }
  };

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

      <Text h3 style={styles.title}>Mi Comida Favorita</Text>
      
      <Input
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => {
          setFormData({...formData, email: text});
          setErrors({...errors, email: ""});
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        errorMessage={errors.email}
        disabled={loading}
        leftIcon={{ type: 'material', name: 'email' }}
      />
      
      <Input
        placeholder="Contraseña"
        value={formData.password}
        onChangeText={(text) => {
          setFormData({...formData, password: text});
          setErrors({...errors, password: ""});
        }}
        secureTextEntry
        errorMessage={errors.password}
        disabled={loading}
        leftIcon={{ type: 'material', name: 'lock' }}
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleLogin}
        containerStyle={styles.button}
        loading={loading}
        disabled={loading}
        icon={{
          name: 'login',
          type: 'material',
          color: 'white',
          size: 20
        }}
      />
      
      <Button
        title="Registrarse"
        type="outline"
        onPress={() => navigation.navigate("Register")}
        containerStyle={styles.button}
        disabled={loading}
        icon={{
          name: 'person-add',
          type: 'material',
          color: '#2089dc',
          size: 20
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
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
