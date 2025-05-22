import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Input, Button, Text, Overlay } from "react-native-elements";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showErrors, setShowErrors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    color: "#ff0000",
  });

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

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "#ff0000";

    if (!password) {
      return { score: 0, message: "Ingrese una contraseña", color: "#ff0000" };
    }

    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;

    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      message = "Débil";
      color = "#ff0000";
    } else if (score <= 4) {
      message = "Regular";
      color = "#ffa500";
    } else if (score <= 6) {
      message = "Buena";
      color = "#ffff00";
    } else {
      message = "Fuerte";
      color = "#00ff00";
    }

    return { score, message, color };
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\W]{6,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ingrese un email válido";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "La contraseña debe tener al menos 6 caracteres, una letra y un número (se permiten caracteres especiales)";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme su contraseña";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setErrors(newErrors);
    setShowErrors(true);
    console.log("Form Data:", formData);
    console.log("Errors:", newErrors);
    console.log("Is Valid:", isValid);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      console.log("Validation failed");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      showOverlay("¡Registro exitoso! Redirigiendo al inicio...");
      setTimeout(() => {
        navigation.replace("Home");
      }, 1500);
    } catch (error) {
      console.log("Error code:", error.code);
      let errorMessage = "Error al registrarse";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este email ya está registrado";
          break;
        case "auth/invalid-email":
          errorMessage = "El formato del email no es válido";
          break;
        case "auth/weak-password":
          errorMessage =
            "La contraseña es muy débil. Debe tener al menos 6 caracteres, una letra y un número";
          break;
        case "auth/network-request-failed":
          errorMessage = "Error de conexión. Verifique su conexión a internet";
          break;
        case "auth/operation-not-allowed":
          errorMessage =
            "El registro con email y contraseña no está habilitado";
          break;
        default:
          errorMessage = "Error al registrarse. Por favor, intente nuevamente";
      }

      showOverlay(errorMessage);
      setFormData({
        email: "",
        password: "",
        confirmPassword: "",
      });
      setPasswordStrength({ score: 0, message: "", color: "#ff0000" });
      setErrors({ email: "", password: "", confirmPassword: "" });
      setShowErrors(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text) => {
    setFormData((prev) => ({ ...prev, password: text }));
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(text)
        ? ""
        : "La contraseña debe tener al menos 6 caracteres, una letra y un número",
    }));
    setPasswordStrength(checkPasswordStrength(text));
  };

  const handleConfirmPasswordChange = (text) => {
    setFormData((prev) => ({ ...prev, confirmPassword: text }));
    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        text === formData.password ? "" : "Las contraseñas no coinciden",
    }));
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
  
      <Text h3 style={styles.title}>Registro</Text>
  
      <Input
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => {
          setFormData({ ...formData, email: text });
          if (showErrors) {
            setErrors({ ...errors, email: "" });
          }
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        errorMessage={showErrors ? errors.email : ""}
        disabled={loading}
        leftIcon={{ type: "material", name: "email" }}
      />
  
      <Input
        placeholder="Contraseña"
        value={formData.password}
        onChangeText={handlePasswordChange}
        secureTextEntry
        errorMessage={showErrors ? errors.password : ""}
        disabled={loading}
        leftIcon={{ type: "material", name: "lock" }}
      />
  
      <Input
        placeholder="Confirmar Contraseña"
        value={formData.confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry
        errorMessage={showErrors ? errors.confirmPassword : ""}
        disabled={loading}
        leftIcon={{ type: "material", name: "lock-outline" }}
      />
  
      {formData.password ? (
        <View style={styles.passwordStrengthContainer}>
          <Text style={styles.strengthLabel}>
            Nivel de seguridad de la contraseña
          </Text>
          <View style={styles.strengthBarContainer}>
            <View
              style={[
                styles.strengthBar,
                {
                  width: `${(passwordStrength.score / 7) * 100}%`,
                  backgroundColor: passwordStrength.color,
                },
              ]}
            />
          </View>
          <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
            {passwordStrength.message}
          </Text>
        </View>
      ) : null}
  
      <Button
        title="Registrarse"
        onPress={handleRegister}
        containerStyle={styles.button}
        loading={loading}
        disabled={loading}
        icon={{
          name: "person-add",
          type: "material",
          color: "white",
          size: 20,
        }}
      />
  
      <Button
        title="Volver al Login"
        type="outline"
        onPress={() => navigation.navigate("Login")}
        containerStyle={styles.button}
        disabled={loading}
        icon={{
          name: "arrow-back",
          type: "material",
          color: "#2089dc",
          size: 20,
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
    width: "80%",
    padding: 20,
    borderRadius: 10,
  },
  overlayText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 15,
  },
  overlayButton: {
    marginTop: 10,
  },
  passwordStrengthContainer: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  strengthLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  strengthBarContainer: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 5,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    textAlign: "right",
    fontWeight: "bold",
  },
});