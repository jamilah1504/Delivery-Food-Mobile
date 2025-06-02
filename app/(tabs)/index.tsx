import React, { useContext, useEffect, useState } from "react";
import { ScrollView, useWindowDimensions, Alert, Image } from "react-native";
import { ms, ScaledSheet } from "react-native-size-matters";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { ThemedPressable } from "../../components/ThemedPressable";
import { ThemedText } from "../../components/ThemedText";
import { ThemedTextInput } from "../../components/ThemedTextInput";
import { ThemedView } from "../../components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/utils/axiosInstance";
import { useSession } from "../../store/auth/auth-context";
import { AuthContext } from "@/utils/AuthContext";

export default function SignIn() {
  const { signIn, error, isLoading, session } = useSession();
  const { height: windowHeight, width } = useWindowDimensions();
  const {login} = useContext(AuthContext)

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [errorIndicator, setErrorIndicator] = useState({
    email: false,
    password: false,
  });

  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
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
      gap: "15@ms",
      width: "80%",
    },
    logo: {
      width: "80%",
      height: undefined,
      resizeMode: "contain",
      alignSelf: "center",
      marginBottom: 20,
    },
  });

  type InputValueKey = keyof typeof inputValue;

  const placeholders: Record<InputValueKey, string> = {
    email: "Email Address",
    password: "Password",
  };

  const validateInput = (key: InputValueKey) => {
    let hasError = false;
    const value = inputValue[key];

    const regex = {
      email: /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
    };

    switch (key) {
      case "email":
        hasError = !regex.email.test(value);
        setErrors((prev) => ({
          ...prev,
          email: hasError ? "Invalid email" : "",
        }));
        break;
      case "password":
        hasError = value.length < 6;
        setErrors((prev) => ({
          ...prev,
          password: hasError ? "Password must be at least 8 characters" : "",
        }));
        break;
    }

    setErrorIndicator((prev) => ({ ...prev, [key]: hasError }));
    return hasError;
  };

  useEffect(() => {
    let isMounted = true;

    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      const userData = await AsyncStorage.getItem("user");
      if (!token || !userData) return;

      try {
        const user = JSON.parse(userData);
        if (isMounted) {
          router.replace("/");
        }
      } catch (error) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }
    };

    checkLoginStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const isValid =
      Object.values(errors).every((error) => error === "") &&
      Object.values(inputValue).every((value) => value !== "");
    setCanSubmit(isValid);
  }, [errors, inputValue]);

  useEffect(() => {
    if (session) {
      console.log("Redirecting to /");
      router.replace("/");
    }
  }, [session]);

  const handleSubmit = async () => {
    let isValid = true;
    Object.keys(inputValue).forEach((key) => {
      if (validateInput(key as InputValueKey)) isValid = false;
    });

    if (!isValid) {
      Alert.alert("Error", "Please fill in all fields correctly.");
      return;
    }

    if (!inputValue.email || !inputValue.password) {
      Alert.alert("Error", "Email and Password must be filled!");
      return;
    }

    try {
      const { data } = await api.post("/auth/login", {
        email: inputValue.email,
        password: inputValue.password,
      });
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      // Call login from AuthContext with token and user
      login(data.token, data.user);

      Alert.alert("Success", "Logged in successfully!");
      router.replace("/home");
    } catch (error) {
      const errorMessage = error?.response?.data?.error;
      let message = "Login Failed, please check your credentials.";
      if (errorMessage === "Email belum terdaftar") {
        message = "Email is not registered.";
      } else if (errorMessage === "password salah") {
        message = "Incorrect password.";
      }

      Alert.alert("Login Failed", errorMessage || message);
    }
  };

  return (
    <ScrollView>
      <ThemedView style={styles.wrapper}>
        <ThemedView style={styles.inputContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />

          <ThemedText
            style={{ textAlign: "center", marginBottom: 20 }}
            type="title"
          >
            TNDH Company
          </ThemedText>

          {Object.keys(inputValue).map((field, index) => (
            <ThemedTextInput
              key={index}
              placeholder={placeholders[field as InputValueKey]}
              value={inputValue[field as InputValueKey]}
              onChangeText={(text: string) =>
                setInputValue((prev) => ({ ...prev, [field]: text }))
              }
              onBlur={() => validateInput(field as InputValueKey)}
              validationError={errorIndicator[field as InputValueKey]}
              validationErrorMessage={errors[field as InputValueKey]}
              secureTextEntry={
                field === "password" ? securePasswordEntry : false
              }
              icon={
                field === "password" ? (
                  securePasswordEntry ? (
                    <AntDesign
                      name="eyeo"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(24)}
                    />
                  ) : (
                    <Feather
                      name="eye-off"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(24)}
                    />
                  )
                ) : undefined
              }
            />
          ))}

          <ThemedPressable
            disabled={!canSubmit || isLoading}
            onPress={handleSubmit}
            style={!canSubmit && { backgroundColor: "#ccc" }}
          >
            <ThemedText>{isLoading ? "Logging In..." : "Login"}</ThemedText>
          </ThemedPressable>

          {error && (
            <ThemedText style={{ color: "red", textAlign: "center" }}>
              {error}
            </ThemedText>
          )}

          <ThemedText
            onPress={() => router.push("./sign-up")}
            style={{ color: "#4CAF50", textAlign: "center" }}
            type="link"
          >
            Belum punya akun? Daftar
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}