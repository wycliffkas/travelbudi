import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  Mail,
  Phone,
  Star,
  ArrowLeft
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/providers/AppProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_WIDTH = SCREEN_WIDTH - 40;

export default function TripDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { trips } = useApp();
  const [currentImage, setCurrentImage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const trip = trips.find((t) => t.id === id);

  const scrollToImage = useCallback(
    (index: number) => {
      if (!trip) return;
      const newIndex = Math.max(0, Math.min(index, trip.images.length - 1));
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
      setCurrentImage(newIndex);
    },
    [trip]
  );

  if (!trip) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Trip not found</Text>
      </View>
    );
  }

  const spotsWarning = trip.spotsLeft <= 2;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.carouselContainer}>
          {trip.images && trip.images.length > 0 ? (
            <>
              <FlatList
                ref={flatListRef}
                data={trip.images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(
                    e.nativeEvent.contentOffset.x / IMAGE_WIDTH
                  );
                  setCurrentImage(index);
                }}
                renderItem={({ item }) => (
                  <Image source={{ uri: item }} style={styles.carouselImage} />
                )}
                keyExtractor={(_, i) => i.toString()}
                getItemLayout={(_, index) => ({
                  length: IMAGE_WIDTH,
                  offset: IMAGE_WIDTH * index,
                  index
                })}
              />

              {trip.images.length > 1 && (
                <>
                  <TouchableOpacity
                    style={[styles.carouselArrow, styles.carouselArrowLeft]}
                    onPress={() => scrollToImage(currentImage - 1)}>
                    <ChevronLeft size={20} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.carouselArrow, styles.carouselArrowRight]}
                    onPress={() => scrollToImage(currentImage + 1)}>
                    <ChevronRight size={20} color={Colors.white} />
                  </TouchableOpacity>
                  <View style={styles.dotsContainer}>
                    {trip.images.map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          currentImage === i && styles.dotActive
                        ]}
                      />
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <Image
              source={{ uri: trip.organizer.avatar }}
              style={styles.carouselImage}
            />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{trip.location}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Trip Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Dates</Text>
                <Text style={styles.summaryValue}>
                  {trip.startDate} - {trip.endDate}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>{trip.duration} days</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Stops</Text>
                <Text style={styles.summaryValue}>{trip.stops} locations</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Age Range</Text>
                <Text style={styles.summaryValue}>{trip.ageRange}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Spots</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    spotsWarning && { color: Colors.danger }
                  ]}>
                  {trip.spotsLeft} of {trip.spotsTotal} left
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Categories</Text>
                <View style={styles.categoriesInline}>
                  {trip.categories.map((cat) => (
                    <View key={cat} style={styles.miniChip}>
                      <Text style={styles.miniChipText}>{cat}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What&apos;s Special</Text>
            <Text style={styles.specialText}>{trip.whatsSpecial}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Itinerary</Text>
            {trip.itinerary.map((day) => (
              <View key={day.day} style={styles.itineraryDay}>
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>Day {day.day}</Text>
                </View>
                <View style={styles.dayContent}>
                  <Text style={styles.dayTitle}>{day.title}</Text>
                  <View style={styles.dayLocationRow}>
                    <MapPin size={12} color={Colors.textSecondary} />
                    <Text style={styles.dayLocation}>{day.location}</Text>
                  </View>
                  <Text style={styles.dayDescription}>{day.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.organizerCard}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerInfo}>
              <Image
                source={{ uri: trip.organizer.avatar }}
                style={styles.organizerAvatar}
              />
              <View style={styles.organizerDetails}>
                <Text style={styles.organizerName}>{trip.organizer.name}</Text>
                <View style={styles.organizerStats}>
                  <Star size={14} color={Colors.star} fill={Colors.star} />
                  <Text style={styles.organizerRating}>
                    {trip.organizer.rating}
                  </Text>
                  <Text style={styles.organizerTrips}>
                    · {trip.organizer.tripsOrganized} trips organized
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.verificationsRow}>
              {trip.organizer.verifications.email && (
                <View style={styles.verificationBadge}>
                  <Mail size={12} color={Colors.primary} />
                  <Text style={styles.verificationText}>Email</Text>
                </View>
              )}
              {trip.organizer.verifications.phone && (
                <View style={styles.verificationBadge}>
                  <Phone size={12} color={Colors.primary} />
                  <Text style={styles.verificationText}>Phone</Text>
                </View>
              )}
              <View style={styles.verificationBadge}>
                <Shield
                  size={12}
                  color={
                    trip.organizer.verifications.identity === "verified"
                      ? Colors.primary
                      : Colors.warning
                  }
                />
                <Text style={styles.verificationText}>
                  {trip.organizer.verifications.identity === "verified"
                    ? "ID Verified"
                    : "ID Pending"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() =>
            Alert.alert(
              "Request Sent",
              "Your request to join this trip has been sent to the organizer."
            )
          }
          testID="join-trip-button">
          <Text style={styles.joinButtonText}>Request to Join Trip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text
  },
  scrollView: {
    flex: 1
  },
  carouselContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 220,
    position: "relative"
  },
  carouselImage: {
    width: IMAGE_WIDTH,
    height: 220
  },
  carouselArrow: {
    position: "absolute",
    top: "50%",
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center"
  },
  carouselArrowLeft: {
    left: 8
  },
  carouselArrowRight: {
    right: 8
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    flexDirection: "row",
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)"
  },
  dotActive: {
    backgroundColor: Colors.white,
    width: 20
  },
  content: {
    padding: 20,
    gap: 16
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationText: {
    fontSize: 15,
    color: Colors.textSecondary
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  summaryItem: {
    width: "50%",
    marginBottom: 14
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text
  },
  categoriesInline: {
    flexDirection: "row",
    gap: 4,
    marginTop: 2
  },
  miniChip: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  miniChipText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500" as const
  },
  section: {
    gap: 4
  },
  specialText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22
  },
  itineraryDay: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14
  },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start"
  },
  dayBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600" as const
  },
  dayContent: {
    flex: 1,
    gap: 2
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text
  },
  dayLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3
  },
  dayLocation: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  dayDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 2
  },
  organizerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  organizerDetails: {
    flex: 1,
    gap: 4
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text
  },
  organizerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  organizerRating: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text
  },
  organizerTrips: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  verificationsRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  verificationText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500" as const
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight
  },
  joinButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center"
  },
  joinButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700" as const
  }
});
