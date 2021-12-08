import React, { useContext } from "react";
import { View } from "react-native";
import styles from "../styles/Login.Style";
import Map from "./Map";
import { UserContext } from "../contexts/UserContext";

export default function Event({ navigation }) {
  const { isLoggedIn, currentUser } = useContext(UserContext);
  const user = {
    name: "Ellis",
    latitude: 53.43015321229701,
    longitude: -2.235823473023755,
  };
  const locations = [
    { name: "Scott", latitude: 53.45744, longitude: -2.28477 },
    { name: "Sam", latitude: 53.47744, longitude: -2.28777 },
    { name: "Tom", latitude: 53.430156, longitude: -2.365864 },
  ];

  return (
    <View style={styles.container}>
      <Map user={user} locations={locations} />
    </View>
  );
}
