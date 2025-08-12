import React, { useEffect, useState, useMemo } from "react";
import { Dimensions, Image as RNImage, View } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");
const MAX_SEGMENT_HEIGHT = 2048; // keep below common GPU texture limits

interface ReaderImageProps {
  uri: string;
  index: number;
}

export default function ReaderImage({ uri, index }: ReaderImageProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    RNImage.getSize(
      uri,
      (width, height) => {
        if (!isMounted) return;
        if (width > 0 && height > 0) {
          setAspectRatio(width / height);
        } else {
          setAspectRatio(1);
        }
      },
      () => setAspectRatio(1)
    );

    return () => {
      isMounted = false;
    };
  }, [uri]);

  const displayHeight = useMemo(() => {
    if (!aspectRatio) return null;
    return screenWidth / aspectRatio; // since aspectRatio = width/height
  }, [aspectRatio]);

  if (!aspectRatio || !displayHeight) {
    return (
      <View style={{ width: screenWidth, height: 300, backgroundColor: "#000" }} />
    );
  }

  // If small enough, render normally
  if (displayHeight <= MAX_SEGMENT_HEIGHT) {
    return (
      <Animated.View
        entering={FadeIn.delay(index * 40)}
        style={{
          width: screenWidth,
          backgroundColor: "#000000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={{ uri }}
          style={{
            width: screenWidth,
            aspectRatio,
          }}
          contentFit="contain"
          transition={200}
          placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          priority={index < 3 ? "high" : "normal"}
        />
      </Animated.View>
    );
  }

  // For very tall images, split into segments
  const segmentCount = Math.ceil(displayHeight / MAX_SEGMENT_HEIGHT);

  return (
    <Animated.View
      entering={FadeIn.delay(index * 40)}
      style={{ width: screenWidth, backgroundColor: "#000" }}
    >
      {Array.from({ length: segmentCount }).map((_, segmentIndex) => {
        const isLast = segmentIndex === segmentCount - 1;
        const segmentHeight = isLast
          ? displayHeight - MAX_SEGMENT_HEIGHT * (segmentCount - 1)
          : MAX_SEGMENT_HEIGHT;
        const offsetY = -segmentIndex * MAX_SEGMENT_HEIGHT;

        return (
          <View
            key={`${uri}-seg-${segmentIndex}`}
            style={{
              width: screenWidth,
              height: segmentHeight,
              overflow: "hidden",
              backgroundColor: "#000",
            }}
          >
            <Image
              source={{ uri }}
              style={{
                width: screenWidth,
                height: displayHeight,
                position: "absolute",
                top: offsetY,
                left: 0,
              }}
              contentFit="cover"
              transition={200}
              placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              priority={index < 3 ? "high" : "normal"}
            />
          </View>
        );
      })}
    </Animated.View>
  );
}