import React, { useEffect, useState } from "react";
import { ScrollView, useWindowDimensions, Alert, Image } from "react-native";
import { ms, ScaledSheet } from "react-native-size-matters";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import { ThemedPressable } from "@/components/ThemedPressable";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { useSession } from "@/store/auth/auth-context";

export default function SignUp() {
  const { signUp, error, isLoading, session } = useSession();
  const { height: windowHeight, width } = useWindowDimensions();

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
      gap: "10@ms", // Reduced gap between inputs
      width: "80%",
    },
    logo: {
      width: "60%", // Reduced logo size
      height: undefined,
      resizeMode: "contain",
      marginBottom: 15, // Reduced margin
    },
    title: {
      textAlign: "center",
      marginBottom: 15,
      fontSize: ms(18), // Reduced font size for title
    },
    buttonText: {
      fontSize: ms(14), // Reduced font size for button text
    },
    errorText: {
      color: "red",
      textAlign: "center",
      fontSize: ms(12), // Reduced font size for error messages
    },
    linkText: {
      color: "#4CAF50",
      textAlign: "center",
      fontSize: ms(14), // Reduced font size for link text
    },
  });

  type InputValueKey = keyof typeof inputValue;

  const placeholders: Record<InputValueKey, string> = {
    email: "Email Address",
    displayName: "Display Name",
    password: "Password",
    confirmPassword: "Confirm Password",
  };

  const validateInput = (key: InputValueKey) => {
    let hasError = false;
    const value = inputValue[key];

    const regex = {
      email: /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      displayName: /^[a-zA-Z0-9]{2,25}$/,
      password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/,
    };

    switch (key) {
      case "email":
        hasError = !regex.email.test(value);
        setErrors((prev) => ({
          ...prev,
          email: hasError ? "Invalid email" : "",
        }));
        break;
      case "displayName":
        hasError = !regex.displayName.test(value);
        setErrors((prev) => ({
          ...prev,
          displayName: hasError ? "Invalid name" : "",
        }));
        break;
      case "password":
        hasError = !regex.password.test(value);
        setErrors((prev) => ({
          ...prev,
          password: hasError ? "Weak password" : "",
        }));
        break;
      case "confirmPassword":
        hasError = value !== inputValue.password;
        setErrors((prev) => ({
          ...prev,
          confirmPassword: hasError ? "Passwords do not match" : "",
        }));
        break;
    }

    setErrorIndicator((prev) => ({ ...prev, [key]: hasError }));
    return hasError;
  };

  useEffect(() => {
    const allValid =
      Object.values(errors).every((e) => !e) &&
      Object.values(inputValue).every((v) => v !== "");
    setCanSubmit(allValid);
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

    if (!isValid) return;

    try {
      await signUp(
        inputValue.email,
        inputValue.password,
        inputValue.displayName
      );
      Alert.alert("Success", "Account created successfully!");
      router.replace("/");
    } catch (err) {
      Alert.alert("Sign Up Failed", error || "An error occurred.");
    }
  };

  return (
    <ScrollView>
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
                field === "password" ? (
                  securePasswordEntry ? (
                    <AntDesign
                      name="eyeo"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(20)} // Reduced icon size
                    />
                  ) : (
                    <Feather
                      name="eye-off"
                      onPress={() =>
                        setSecurePasswordEntry(!securePasswordEntry)
                      }
                      size={ms(20)} // Reduced icon size
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
            <ThemedText style={styles.buttonText}>
              {isLoading ? "Signing Up..." : "Sign Up"}
            </ThemedText>
          </ThemedPressable>

          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          <ThemedText
            onPress={() => router.push("./sign-in")}
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
