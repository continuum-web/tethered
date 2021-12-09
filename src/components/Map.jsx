import React, { useState, useEffect, useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import getDeltas from "../utils/utils.maps";
import * as Location from "expo-location";
import styles from "../styles/Login.Style";
import mapStyle from "../styles/Map.Style";
export default function Map({ user, locations }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  let mapRef = useRef(null);
  let maxLatitudeDelta;
  let maxLongitudeDelta;
  const animateToRegion = (location) => {
    mapRef.current.animateToRegion(location, 1000);
  };
  if (location !== null) {
    const deltas = getDeltas(location, locations);
    maxLatitudeDelta = deltas.maxLatitudeDelta;
    maxLongitudeDelta = deltas.maxLongitudeDelta;
  }
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      Location.watchPositionAsync({ distanceInterval: 100 }, (location) => {
        setLocation(location);
      });
    })();
  }, []);
  if (location === null)
    return (
      <View>
        <Text>Map Loading...</Text>
      </View>
    );
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
          latitudeDelta: maxLatitudeDelta * 2,
          longitudeDelta: maxLongitudeDelta * 2,
        }}
      >
        <Marker
          onPress={({ nativeEvent }) => {
            console.log("NE", nativeEvent);
            animateToRegion(
              {
                latitude: nativeEvent.coordinate.latitude,
                longitude: nativeEvent.coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000
            );
          }}
          coordinate={{
            latitude: location.coords?.latitude,
            longitude: location.coords?.longitude,
          }}
        >
          <Image
            source={require("../assets/userMarker.png")}
            style={styles.marker}
          ></Image>
        </Marker>
        {locations.map((location) => {
          return (
            <Marker
              onPress={({ nativeEvent }) => {
                console.log("NE", nativeEvent);
                animateToRegion(
                  {
                    latitude: nativeEvent.coordinate.latitude,
                    longitude: nativeEvent.coordinate.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  },
                  1000
                );
              }}
              key={location.name}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
            >
              <Image
                source={require("../assets/groupMarker.png")}
                style={styles.marker}
              ></Image>
            </Marker>
          );
        })}
      </MapView>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          animateToRegion(
            {
              latitude: location.coords?.latitude,
              longitude: location.coords?.longitude,
              latitudeDelta: maxLatitudeDelta * 2,
              longitudeDelta: maxLongitudeDelta * 2,
            },
            1000
          );
        }}
      >
        <Text>Group View</Text>
      </TouchableOpacity>
    </View>
  );
}
