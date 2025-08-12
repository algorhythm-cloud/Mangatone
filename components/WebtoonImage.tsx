import React, { useState } from "react";
import { View, Dimensions, Platform } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: screenWidth } = Dimensions.get("window");

interface WebtoonImageProps {
  source: { uri: string };
  index: number;
  onLoad?: () => void;
}

export default function WebtoonImage({ source, index, onLoad }: WebtoonImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
  };

  return (
    <Animated.View 
      entering={FadeIn.delay(index * 50)} 
      style={{
        width: screenWidth,
        backgroundColor: "#000000",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={source}
        style={{
          width: screenWidth,
          height: undefined, // Let the image determine its own height
          aspectRatio: undefined, // Don't force aspect ratio
        }}
        contentFit="cover"
        transition={300}
        placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        onLoad={handleImageLoad}
        onError={handleImageError}
        priority={index < 3 ? "high" : "normal"}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#1a1a1a",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      )}
    </Animated.View>
  );
}