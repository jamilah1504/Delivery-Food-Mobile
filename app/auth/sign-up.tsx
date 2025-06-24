import React, { useEffect, useState } from "react";
import { ScrollView, useWindowDimensions, Alert, Image } from "react-native";
import { ms, ScaledSheet } from "react-native-size-matters";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";

import axiosInstance from "../../utils/axiosInstance"; 

import { ThemedPressable } from "@/components/ThemedPressable";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/store/auth/auth-context";

export default function SignUp() {
  const { session } = useSession();
  const { height: windowHeight, width } = useWindowDimensions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [errorIndicator, setErrorIndicator] = useState({
    email: false,
    displayName: false,
    password: false,
    confirmPassword: false,
  });

  const [inputValue, setInputValue] = useState({
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [canSubmit, setCanSubmit] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  const styles = ScaledSheet.create({
    wrapper: {
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
      minHeight: windowHeight,
      width,
    },
    inputContainer: {
      flex: 1,
      justifyContent: "center",
      gap: "10@ms",
      width: "80%",
    },
    logo: {
      width: "60%",
      height: undefined,
      resizeMode: "contain",
      marginBottom: 15,
    },
    title: {
      textAlign: "center",
      marginBottom: 15,
      fontSize: ms(18),
    },
    buttonText: {
      fontSize: ms(14),
    },
    errorText: {
      color: "red",
      textAlign: "center",
      fontSize: ms(12),
      marginTop: 10,
    },
    linkText: {
      color: "#4CAF50",
      textAlign: "center",
      fontSize: ms(14),
    },
  });

  type InputValueKey = keyof typeof inputValue;

  const placeholders: Record<InputValueKey, string> = {
    email: "Alamat Email",
    displayName: "Nama Lengkap",
    password: "Password",
    confirmPassword: "Konfirmasi Password",
  };

  const validateInput = (key: InputValueKey) => {
    let hasError = false;
    const value = inputValue[key];
    const regex = {
      email: /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      displayName: /^[a-zA-Z\s]{3,50}$/,
      password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
    };

    switch (key) {
      case "email":
        hasError = !regex.email.test(value);
        setErrors((prev) => ({
          ...prev,
          email: hasError ? "Format email tidak valid" : "",
        }));
        break;
      case "displayName":
        hasError = !regex.displayName.test(value);
        setErrors((prev) => ({
          ...prev,
          displayName: hasError ? "Nama tidak valid" : "",
        }));
        break;
      case "password":
        hasError = !regex.password.test(value);
        setErrors((prev) => ({
          ...prev,
          password: hasError ? "Password lemah (min 8 char, 1 besar, 1 kecil, 1 angka)" : "",
        }));
        break;
      case "confirmPassword":
        hasError = value !== inputValue.password;
        setErrors((prev) => ({
          ...prev,
          confirmPassword: hasError ? "Password tidak cocok" : "",
        }));
        break;
    }

    setErrorIndicator((prev) => ({ ...prev, [key]: hasError }));
    return hasError;
  };

  useEffect(() => {
    const allFilled = Object.values(inputValue).every((v) => v !== "");
    const noErrors = Object.values(errors).every((e) => !e);
    setCanSubmit(allFilled && noErrors);
  }, [errors, inputValue]);

  useEffect(() => {
    if (session) {
      router.replace("/");
    }
  }, [session]);

  const handleSubmit = async () => {
    let isFormValid = true;
    Object.keys(inputValue).forEach((key) => {
      if (validateInput(key as InputValueKey)) {
        isFormValid = false;
      }
    });

    if (!isFormValid || !canSubmit) {
      Alert.alert("Error", "Harap periksa kembali semua isian Anda.");
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    const payload = {
      name: inputValue.displayName,
      email: inputValue.email,
      password: inputValue.password,
    };

    try {
      const response = await axiosInstance.post("/register", payload);

      Alert.alert(
        "Pendaftaran Berhasil",
        "Akun Anda telah berhasil dibuat. Silakan login.",
        [{ text: "OK", onPress: () => router.replace("./sign-in") }]
      );

    } catch (err: any) {
      let errorMessage = "Terjadi kesalahan. Silakan coba lagi nanti.";

      if (err.response && err.response.data) {
        const responseData = err.response.data;

        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors).flat();
          errorMessage = errorMessages.join("\n");
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setApiError(errorMessage);
      Alert.alert("Pendaftaran Gagal", errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ThemedView style={styles.wrapper}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.title} type="title">
            TNDH Company
          </ThemedText>

          {Object.keys(inputValue).map((field, index) => (
            <ThemedTextInput
              key={index}
              placeholder={placeholders[field as InputValueKey]}
              value={inputValue[field as InputValueKey]}
              onChangeText={(text) =>
                setInputValue((prev) => ({ ...prev, [field]: text }))
              }
              onBlur={() => validateInput(field as InputValueKey)}
              validationError={errorIndicator[field as InputValueKey]}
              validationErrorMessage={errors[field as InputValueKey]}
              secureTextEntry={
                ["password", "confirmPassword"].includes(field)
                  ? securePasswordEntry
                  : false
              }
              icon={
                field === "password" || field === "confirmPassword" ? (
                  securePasswordEntry ? (
                    <AntDesign
                      name="eyeo"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(20)}
                    />
                  ) : (
                    <Feather
                      name="eye-off"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(20)}
                    />
                  )
                ) : undefined
              }
            />
          ))}

          <ThemedPressable
            disabled={!canSubmit || isSubmitting}
            onPress={handleSubmit}
            style={
              !canSubmit || isSubmitting ? { backgroundColor: "#ccc" } : {}
            }
          >
            <ThemedText style={styles.buttonText}>
              {isSubmitting ? "Mendaftar..." : "Daftar"}
            </ThemedText>
          </ThemedPressable>

          {apiError ? <ThemedText style={styles.errorText}>{apiError}</ThemedText> : null}

          <ThemedText
            onPress={() => router.push("./auth/sign-in")}
            style={styles.linkText}
            type="link"
          >
            Sudah memiliki akun? Login
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}